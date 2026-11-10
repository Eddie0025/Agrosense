-- AgroSense Production Database Schema (PostgreSQL / Supabase)
-- Focus: Lightweight data structures, scalable AI integration, and real-time tracking.

-- 1. USERS & PROFILES
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT UNIQUE,
    username TEXT UNIQUE,
    username_lower TEXT UNIQUE,
    email TEXT,
    preferred_language TEXT DEFAULT 'English',
    location_lat DECIMAL(9,6),
    location_lng DECIMAL(9,6),
    region_name TEXT, 
    role TEXT DEFAULT 'farmer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FARMS
-- A user can have multiple farm plots
CREATE TABLE farms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    area_acres DECIMAL(10,2) NOT NULL,
    location_city TEXT, -- Added for localized weather/monitoring
    soil_type TEXT, -- e.g., "Alluvial", "Clayey"
    irrigation_source TEXT, -- e.g., "Tubewell", "Canal"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CROP CYCLES (The central point for Farmer AI)
-- Tracks a specific crop from sowing to harvest
CREATE TABLE crop_cycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL, -- e.g., "Wheat"
    variety TEXT, -- e.g., "PBW 343"
    status TEXT DEFAULT 'active', -- 'active', 'harvested', 'planned'
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    total_yield_kg DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SMART CALENDAR / AI ACTIONS
-- This is where Farmer AI inserts its decisions
CREATE TABLE calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'irrigation', 'fertilizer', 'pest_control', 'harvest'
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'missed'
    ai_rationale TEXT, -- Why the AI suggested this
    quantity_metric TEXT, -- e.g., "3 Acre-Inches" or "50kg"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ECONOMICS / LEDGER
-- Tracks all costs and income for profit estimation
CREATE TABLE economics_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'seeds', 'fertilizer', 'labor', 'misc', 'revenue'
    description TEXT,
    amount_inr DECIMAL(15,2) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMMUNITY FEED
-- Optimized columns for lightweight fetching
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tag TEXT,
    media_url TEXT, -- Link to WebP optimization proxy
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AI ADVISOR LOGS (For Chatbot & Farmer AI training)
-- Keeps track of what the user asked and what Farmer AI decided
CREATE TABLE ai_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    query_text TEXT,
    response_text TEXT,
    context_data JSONB, -- Stores the weather/soil state at the time of query
    source TEXT DEFAULT 'chatbot', -- 'chatbot', 'planner'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for lightweight performance
CREATE INDEX idx_profiles_phone ON profiles(phone_number);
CREATE INDEX idx_farms_owner ON farms(owner_id);
CREATE INDEX idx_calendar_schedule ON calendar_events(scheduled_at);
CREATE INDEX idx_ledger_cycle ON economics_ledger(crop_cycle_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE economics_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Public basic info, private sensitive info
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
-- Note: In a production app, you would use a 'view' to hide 'phone_number' and 'role' from public SELECT.
-- Supabase RLS works on a per-row basis. For per-column protection, a separate public_profiles table is best.
-- For this demo, we'll allow selection but suggest caution.

CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Farms: Owner only
CREATE POLICY "Farms are viewable by owner" ON farms FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can manage their farms" ON farms FOR ALL USING (auth.uid() = owner_id);

-- 3. Crop Cycles: Linked to Farm Owner
CREATE POLICY "Crops viewable by farm owner" ON crop_cycles FOR SELECT USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crop_cycles.farm_id AND farms.owner_id = auth.uid())
);
CREATE POLICY "Owners can manage their crop cycles" ON crop_cycles FOR ALL USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crop_cycles.farm_id AND farms.owner_id = auth.uid())
);

-- 4. Calendar Events: Linked to Owner or Crop Cycle
CREATE POLICY "Calendar viewable by owner" ON calendar_events FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
        SELECT 1 FROM crop_cycles 
        JOIN farms ON crop_cycles.farm_id = farms.id 
        WHERE crop_cycles.id = calendar_events.crop_cycle_id AND farms.owner_id = auth.uid()
    )
);
CREATE POLICY "Users can manage their calendar" ON calendar_events FOR ALL USING (
    auth.uid() = owner_id OR
    EXISTS (
        SELECT 1 FROM crop_cycles 
        JOIN farms ON crop_cycles.farm_id = farms.id 
        WHERE crop_cycles.id = calendar_events.crop_cycle_id AND farms.owner_id = auth.uid()
    )
);

-- 5. Economics: Linked to Crop Cycle
CREATE POLICY "Economics viewable by farm owner" ON economics_ledger FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM crop_cycles 
        JOIN farms ON crop_cycles.farm_id = farms.id 
        WHERE crop_cycles.id = economics_ledger.crop_cycle_id AND farms.owner_id = auth.uid()
    )
);

-- 6. Posts: Public Read, Authed Write, Author Delete
CREATE POLICY "Posts viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can delete their own posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- 7. AI Logs: User & Admin only
CREATE POLICY "Logs viewable by user and admin" ON ai_logs FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Users can create their own logs" ON ai_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- AUTOMATION: PROFILE SYNCHRONIZATION
-- ==========================================

-- Trigger to create a profile automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'farmer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();