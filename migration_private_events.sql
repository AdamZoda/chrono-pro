-- MIGRATION: PRIVATE SCHEDULES
-- 1. Nettoyage (optionnel mais conseillé pour éviter les conflits lors du passage à "NOT NULL")
-- ATTENTION : Cela supprime tous les cours existants !
TRUNCATE TABLE public.events;

-- 2. Ajout de la colonne user_id
ALTER TABLE public.events 
ADD COLUMN user_id uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid();

-- 3. Activation RLS (au cas où ce n'est pas déjà fait)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4. Suppression des anciennes politiques (tout le monde voit tout, ou admins seulement)
DROP POLICY IF EXISTS "Events are viewable by everyone." ON public.events;
DROP POLICY IF EXISTS "Admins can insert events." ON public.events;
DROP POLICY IF EXISTS "Admins can update events." ON public.events;
DROP POLICY IF EXISTS "Admins can delete events." ON public.events;

-- 5. Création des nouvelles politiques "Mes Données Uniquement"

-- SELECT: Je ne vois que MES cours
CREATE POLICY "Users can view own events"
ON public.events FOR SELECT
USING ( auth.uid() = user_id );

-- INSERT: Je peux créer des cours pour MOI
CREATE POLICY "Users can insert own events"
ON public.events FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- UPDATE: Je peux modifier MES cours
CREATE POLICY "Users can update own events"
ON public.events FOR UPDATE
USING ( auth.uid() = user_id );

-- DELETE: Je peux supprimer MES cours
CREATE POLICY "Users can delete own events"
ON public.events FOR DELETE
USING ( auth.uid() = user_id );
