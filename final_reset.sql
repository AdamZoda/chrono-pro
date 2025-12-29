-- ============================================
-- SCRIPT SIMPLIFIÉ : RESET SANS TOUCHER AUTH.USERS
-- Chrono Hub Database - Version Finale
-- ============================================
-- IMPORTANT : Supprimez manuellement les utilisateurs dans
-- Authentication > Users AVANT d'exécuter ce script
-- ============================================

-- PARTIE 1 : NETTOYAGE COMPLET DES TABLES
-- ============================================
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.conferences CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Supprimer les anciennes fonctions et triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PARTIE 2 : CRÉATION DES TABLES
-- ============================================

-- PROFILES
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  role text default 'USER' check (role in ('USER', 'ADMIN')),
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- EVENTS (Schedule)
CREATE TABLE public.events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  professor text,
  room text,
  groups text,
  day text not null,
  hour numeric not null,
  duration numeric default 1,
  type text,
  notification boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON public.events FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own events"
  ON public.events FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own events"
  ON public.events FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete own events"
  ON public.events FOR DELETE
  USING ( auth.uid() = user_id );

-- NOTES
CREATE TABLE public.notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text not null,
  category text default 'GENERAL',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes."
  ON public.notes FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can create notes."
  ON public.notes FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own notes."
  ON public.notes FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete own notes."
  ON public.notes FOR DELETE
  USING ( auth.uid() = user_id );

-- CONFERENCES
CREATE TABLE public.conferences (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  password_hash text not null,
  owner_id uuid references auth.users not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conferences are viewable by everyone."
  ON public.conferences FOR SELECT
  USING ( true );

CREATE POLICY "Users can create conferences."
  ON public.conferences FOR INSERT
  WITH CHECK ( auth.uid() = owner_id );

CREATE POLICY "Owners can update conferences."
  ON public.conferences FOR UPDATE
  USING ( auth.uid() = owner_id );

-- TICKETS (Support)
CREATE TABLE public.tickets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text not null,
  status text default 'OPEN' check (status in ('OPEN', 'CLOSED')),
  reply text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets."
  ON public.tickets FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Admins can view all tickets."
  ON public.tickets FOR SELECT
  USING ( exists ( select 1 from public.profiles where id = auth.uid() and role = 'ADMIN' ) );

CREATE POLICY "Users can create tickets."
  ON public.tickets FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Admins can update tickets."
  ON public.tickets FOR UPDATE
  USING ( exists ( select 1 from public.profiles where id = auth.uid() and role = 'ADMIN' ) );

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  message text not null,
  type text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications."
  ON public.notifications FOR SELECT
  USING ( auth.uid() = user_id );

-- PARTIE 3 : FONCTION ET TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, first_name, last_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'firstName', 'User'),
    COALESCE(new.raw_user_meta_data ->> 'lastName', 'Name'),
    COALESCE(new.raw_user_meta_data ->> 'role', 'USER')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- PROCHAINE ÉTAPE :
-- 1. Allez dans Authentication > Users
-- 2. Supprimez TOUS les utilisateurs manuellement
-- 3. Créez un nouveau compte via l'application
-- 4. Connectez-vous !
-- ============================================
