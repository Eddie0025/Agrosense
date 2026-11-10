-- AgroSense: Production Content Seed
-- Run this script in your Supabase SQL Editor to populate the community with professional content.

-- 1. Create/Ensure the Global Admin Profile
INSERT INTO public.profiles (id, full_name, role, email)
VALUES ('00000000-0000-0000-0000-000000000000', 'AgroSense Insights', 'admin', 'insights@agrosense.ai')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Public Community Posts
-- These posts will be visible to everyone by default.
INSERT INTO public.posts (author_id, content, tag)
VALUES 
(
    '00000000-0000-0000-0000-000000000000', 
    'Welcome to the AgroSense Community! 🌾 We are here to help you bridge the gap between traditional farming and modern AI intelligence. Stay tuned for daily crop alerts and sustainable farming tips.', 
    'Announcements'
),
(
    '00000000-0000-0000-0000-000000000000', 
    '💡 TIP: Cover cropping with legumes like clover or vetch can naturally fix nitrogen in your soil, reducing the need for synthetic urea by up to 30% for the next cycle. #SoilHealth #Sustainability', 
    'Tips'
),
(
    '00000000-0000-0000-0000-000000000000', 
    '📈 MARKET WATCH: Basmati rice exports are seeing a 12% uptick this quarter. Farmers in the northern belt should consider optimizing storage to capitalize on the predicted price peak in late April.', 
    'Economics'
),
(
    '00000000-0000-0000-0000-000000000000', 
    '🚨 PEST ALERT: Fall Armyworm sightings reported in nearby regions. Ensure you are scouting your maize crops early in the morning. Use pheromone traps for early detection.', 
    'Alert'
);
