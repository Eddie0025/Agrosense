-- AgroSense: Final Database Sync Patch
-- This patch ensures your database supports the latest multi-user seeding features.

-- 1. Add missing owner_id to Calendar
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Update RLS policies to support the new owner_id column
-- This allows real users (not just admins) to seed and manage their own schedules.

DROP POLICY IF EXISTS "Calendar viewable by owner" ON public.calendar_events;
CREATE POLICY "Calendar viewable by owner" ON public.calendar_events FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
        SELECT 1 FROM crop_cycles 
        JOIN farms ON crop_cycles.farm_id = farms.id 
        WHERE crop_cycles.id = calendar_events.crop_cycle_id AND farms.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can manage their calendar" ON public.calendar_events;
CREATE POLICY "Users can manage their calendar" ON public.calendar_events FOR ALL USING (
    auth.uid() = owner_id OR
    EXISTS (
        SELECT 1 FROM crop_cycles 
        JOIN farms ON crop_cycles.farm_id = farms.id 
        WHERE crop_cycles.id = calendar_events.crop_cycle_id AND farms.owner_id = auth.uid()
    )
);
