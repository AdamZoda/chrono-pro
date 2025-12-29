-- 1. Création du bucket 'avatars' (Dossier de stockage public)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Configuration des permissions (Policies)

-- Autoriser tout le monde à VOIR les images (Lecture publique)
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Autoriser les utilisateurs connectés à AJOUTER une image
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Autoriser les utilisateurs à MODIFIER leur propre image
create policy "Users can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- Autoriser les utilisateurs à SUPPRIMER leur propre image
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using ( bucket_id = 'avatars' and auth.uid() = owner );
