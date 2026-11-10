-- AgroSense: Demo Admin Bypass Patch
-- This patch enables the "Quick-Seed" features for the Local Admin Bypass.

-- 1. Extend Calendar Schema
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Broaden RLS for the Demo Admin UUID (Bypass Mode)
-- Allows the specific demo UUID to bypass traditional auth checks for these tables.

-- Profiles: Allow the bypass admin to exist
CREATE POLICY "Bypass Admin Profile Insert" ON public.profiles FOR INSERT WITH CHECK (id = '00000000-0000-0000-0000-000000000000');

-- Posts: Allow the bypass admin to seed the community
CREATE POLICY "Bypass Admin Posts Insert" ON public.posts FOR INSERT WITH CHECK (author_id = '00000000-0000-0000-0000-000000000000');

-- Calendar: Allow the bypass admin to manage events directly
CREATE POLICY "Bypass Admin Calendar Management" ON public.calendar_events FOR ALL USING (owner_id = '00000000-0000-0000-0000-000000000000');

-- 3. Pre-initialize the Bypass Profile
INSERT INTO public.profiles (id, full_name, role, email)
VALUES ('00000000-0000-0000-0000-000000000000', 'Platform Admin (Bypass)', 'admin', 'admin.local@agrosense.team')
ON CONFLICT (id) DO NOTHING;
