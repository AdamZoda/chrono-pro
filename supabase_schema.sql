-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS / PROFILES (extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  first_name text,
  last_name text,
  email text,
  phone text,
  role text default 'USER' check (role in ('USER', 'ADMIN')),
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- EVENTS (Schedule)
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  professor text,
  room text,
  groups text,
  day text not null,
  hour integer not null,
  duration integer default 1,
  type text not null,
  notification boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for events
alter table public.events enable row level security;

create policy "Events are viewable by everyone."
  on public.events for select
  using ( true );

create policy "Admins can insert events."
  on public.events for insert
  with check ( exists ( select 1 from public.profiles where id = auth.uid() and role = 'ADMIN' ) );

create policy "Admins can update events."
  on public.events for update
  using ( exists ( select 1 from public.profiles where id = auth.uid() and role = 'ADMIN' ) );

create policy "Admins can delete events."
  on public.events for delete
  using ( exists ( select 1 from public.profiles where id = auth.uid() and role = 'ADMIN' ) );

-- NOTES
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for notes
alter table public.notes enable row level security;

create policy "Users can view own notes."
  on public.notes for select
  using ( auth.uid() = user_id );

create policy "Users can insert own notes."
  on public.notes for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own notes."
  on public.notes for update
  using ( auth.uid() = user_id );

create policy "Users can delete own notes."
  on public.notes for delete
  using ( auth.uid() = user_id );

-- CONFERENCES
create table public.conferences (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  password_hash text,
  owner_id uuid references auth.users not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for conferences
alter table public.conferences enable row level security;

create policy "Conferences are viewable by everyone."
  on public.conferences for select
  using ( true );

create policy "Users can create conferences."
  on public.conferences for insert
  with check ( auth.uid() = owner_id );

create policy "Owners can update conferences."
  on public.conferences for update
  using ( auth.uid() = owner_id );

-- TICKETS (Support)
create table public.tickets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text not null,
  status text default 'OPEN' check (status in ('OPEN', 'CLOSED')),
  reply text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for tickets
alter table public.tickets enable row level security;

create policy "Users can view own tickets."
  on public.tickets for select
  using ( auth.uid() = user_id );

create policy "Admins can view all tickets."
  on public.tickets for select
  using ( exists ( select 1 from public.profiles where id = auth.uid() and role = 'ADMIN' ) );

create policy "Users can create tickets."
  on public.tickets for insert
  with check ( auth.uid() = user_id );

create policy "Admins can update tickets."
  on public.tickets for update
  using ( exists ( select 1 from public.profiles where id = auth.uid() and role = 'ADMIN' ) );


-- NOTIFICATIONS
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  message text not null,
  type text not null, -- 'info', 'alert', 'success'
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for notifications
alter table public.notifications enable row level security;

create policy "Users can view own notifications."
  on public.notifications for select
  using ( auth.uid() = user_id );


-- Function to handle new user profile creation automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'firstName',
    new.raw_user_meta_data ->> 'lastName',
    coalesce(new.raw_user_meta_data ->> 'role', 'USER')
  );
  return new;
end;
$$;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
