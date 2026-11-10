-- 1. Update Profiles with Username and Email
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_lower TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Index for fast case-insensitive username lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles(username_lower);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Update Farms with detailed location
ALTER TABLE public.farms ADD COLUMN IF NOT EXISTS location_city TEXT;

-- 3. Update existing data (Self-correction for demo)
-- If there's an existing profile for the demo admin, give it a username
UPDATE public.profiles SET 
    username = 'farmer_admin', 
    username_lower = 'farmer_admin',
    email = 'admin.local@agrosense.team'
WHERE id = '00000000-0000-0000-0000-000000000000' 
AND username IS NULL;

-- 4. Function to automatically sync username_lower
CREATE OR REPLACE FUNCTION sync_username_lower() RETURNS trigger AS $$
BEGIN
  NEW.username_lower := LOWER(NEW.username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_username_lower ON public.profiles;
CREATE TRIGGER tr_sync_username_lower
BEFORE INSERT OR UPDATE OF username ON public.profiles
FOR EACH ROW EXECUTE FUNCTION sync_username_lower();

-- 5. Updated handle_new_user trigger to include username and email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, username, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'username',
    COALESCE(new.raw_user_meta_data->>'role', 'farmer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Link Calendar Events to Farms directly
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_calendar_farm ON public.calendar_events(farm_id);
