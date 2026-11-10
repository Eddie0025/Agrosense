-- AgroSense: Multi-Land Seeding Script
-- This script populates the database with demo lands and location-aware tasks.

-- 1. Create two lands for the demo admin
-- Note: Replace '00000000-0000-0000-0000-000000000000' with your actual user ID if testing on a real account.
DO $$
DECLARE
    v_user_id UUID := '00000000-0000-0000-0000-000000000000';
    v_farm_patiala_id UUID := gen_random_uuid();
    v_farm_rajpura_id UUID := gen_random_uuid();
BEGIN
    -- Ensure lands exist
    INSERT INTO public.farms (id, owner_id, name, area_acres, location_city, soil_type)
    VALUES 
    (v_farm_patiala_id, v_user_id, 'Patiala North Block', 5, 'Patiala', 'Clayey'),
    (v_farm_rajpura_id, v_user_id, 'Rajpura South Block', 10, 'Rajpura', 'Sandy');

    -- Seed Tasks for Patiala (Clayey soil - slower drainage)
    INSERT INTO public.calendar_events (owner_id, farm_id, title, event_type, scheduled_at, ai_rationale, quantity_metric, status)
    VALUES
    (v_user_id, v_farm_patiala_id, 'Deep Irrigation', 'irrigation', NOW() + INTERVAL '1 day', 
     'Personalized for Patiala: Because your soil is Clayey, it retains moisture longer. We recommended deep irrigation now followed by a 4-day dry spell to optimize root aeration.', 
     '4 Acre-Inches', 'pending'),
    (v_user_id, v_farm_patiala_id, 'Phosphate Top-dressing', 'fertilizer', NOW() + INTERVAL '3 days', 
     'Personalized for Patiala: Applying nutrients now as your Clayey soil will hold the P2O5 better against leaching compared to sandy plots.', 
     '50kg/Acre', 'pending');

    -- Seed Tasks for Rajpura (Sandy soil - fast drainage)
    INSERT INTO public.calendar_events (owner_id, farm_id, title, event_type, scheduled_at, ai_rationale, quantity_metric, status)
    VALUES
    (v_user_id, v_farm_rajpura_id, 'Light Irrigation Cycle', 'irrigation', NOW() + INTERVAL '1 day', 
     'Personalized for Rajpura: Your Sandy soil drains rapidly. Light, frequent irrigation is required here compared to your Patiala plot to prevent moisture stress.', 
     '2 Acre-Inches', 'pending'),
    (v_user_id, v_farm_rajpura_id, 'Potash Supplement', 'fertilizer', NOW() + INTERVAL '2 days', 
     'Personalized for Rajpura: Sandy soils are prone to K-leaching. This split-application is timed before the expected heatwave in Rajpura.', 
     '30kg/Acre', 'pending');

    -- 3. Seed Active Crop Cycles (to demonstrate growth stages in Monitor)
    -- Patiala: Sown 30 days ago (Should be in Tillering Stage)
    INSERT INTO public.crop_cycles (farm_id, owner_id, crop_name, sowing_date, status)
    VALUES (v_farm_patiala_id, v_user_id, 'Wheat (HD-2967)', NOW() - INTERVAL '30 days', 'active');

    -- Rajpura: Sown 60 days ago (Should be in Stem Elongation Stage)
    INSERT INTO public.crop_cycles (farm_id, owner_id, crop_name, sowing_date, status)
    VALUES (v_farm_rajpura_id, v_user_id, 'Soybean (JS-335)', NOW() - INTERVAL '60 days', 'active');

END $$;
