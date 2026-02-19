-- ========================================================
-- BITS SYNC - MASTER SUPABASE SCHEMA
-- Generated: 2026-02-19
-- ========================================================

-- 1. EXTENSIONS
-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES DEFINITIONS

-- PROFILES TABLE
-- Stores user and shop information linked to Clerk ID
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  shop_name TEXT,
  shop_logo_url TEXT,
  dashboard_config JSONB, -- Stores dashboard chart layout configuration as JSONB array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PAYMENT METHODS TABLE
-- Stores payment details.
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('promptpay', 'bank_account')) NOT NULL,
  
  -- For PromptPay
  promptpay_type TEXT CHECK (promptpay_type IN ('citizen_id', 'phone_number')),
  promptpay_number TEXT, 
  
  -- For Bank Account
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT, 
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PRODUCTS TABLE
-- Stores product information linked to profile
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
  quantity INTEGER DEFAULT 0 NOT NULL,
  category TEXT, -- Product category
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RECEIPTS TABLE
-- Stores formal receipt data
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receipt_number TEXT NOT NULL,
  
  -- Customer Info
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Items (JSON array)
  items JSONB DEFAULT '[]'::JSONB NOT NULL,
  
  -- Financials
  labor_cost DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
  subtotal DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
  total_amount DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
  
  -- Payment Choices (what account to show on receipt)
  payment_info JSONB DEFAULT '{}'::JSONB NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- DASHBOARD LAYOUTS TABLE (Normalized Structure)
-- Alternative or supplementary to profiles.dashboard_config
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  chart_id TEXT NOT NULL, -- e.g., 'income-trend', 'stat-total'
  chart_type TEXT NOT NULL, -- 'area', 'bar', 'pie', 'line', 'stat', 'radar', 'radial'
  title TEXT NOT NULL,
  description TEXT,
  metric TEXT NOT NULL, -- 'total', 'products', 'labor', 'count', etc.
  color TEXT DEFAULT '#3b82f6',
  
  -- Grid position
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 4,
  height INTEGER NOT NULL DEFAULT 4,
  
  -- Optional configuration
  compare_type TEXT, -- 'none', 'month', 'products'
  compare_month1 INTEGER,
  compare_month2 INTEGER,
  item_limit INTEGER DEFAULT 5,
  time_range TEXT DEFAULT '30d',
  sort_by TEXT DEFAULT 'value',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure unique chart_id per profile
  UNIQUE(profile_id, chart_id)
);

-- 3. ROW LEVEL SECURITY (RLS)
-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Default Policies: Deny public access (Access via Service Role in Server Actions)
CREATE POLICY "No public access to profiles" ON profiles FOR ALL USING (false);
CREATE POLICY "No public access to payment_methods" ON payment_methods FOR ALL USING (false);
CREATE POLICY "No public access to products" ON products FOR ALL USING (false);
CREATE POLICY "No public access to receipts" ON receipts FOR ALL USING (false);
CREATE POLICY "No public access to dashboard_layouts" ON dashboard_layouts FOR ALL USING (false);

-- 4. INDEXES
-- For better performance on joins and filters
CREATE INDEX IF NOT EXISTS profiles_clerk_id_idx ON profiles (clerk_id);
CREATE INDEX IF NOT EXISTS payment_methods_profile_id_idx ON payment_methods (profile_id);
CREATE INDEX IF NOT EXISTS products_profile_id_idx ON products (profile_id);
CREATE INDEX IF NOT EXISTS receipts_profile_id_idx ON receipts (profile_id);
CREATE INDEX IF NOT EXISTS receipts_created_at_idx ON receipts (created_at DESC);
CREATE INDEX IF NOT EXISTS dashboard_layouts_profile_id_idx ON dashboard_layouts (profile_id);

-- 5. HELPER FUNCTIONS

-- Function to get dashboard layout for a user (joins layouts with profile)
CREATE OR REPLACE FUNCTION get_dashboard_layout(user_clerk_id TEXT)
RETURNS TABLE (
  chart_id TEXT,
  chart_type TEXT,
  title TEXT,
  description TEXT,
  metric TEXT,
  color TEXT,
  x INTEGER,
  y INTEGER,
  w INTEGER,
  h INTEGER,
  compare_type TEXT,
  compare_month1 INTEGER,
  compare_month2 INTEGER,
  item_limit INTEGER,
  time_range TEXT,
  sort_by TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dl.chart_id,
    dl.chart_type,
    dl.title,
    dl.description,
    dl.metric,
    dl.color,
    dl.position_x as x,
    dl.position_y as y,
    dl.width as w,
    dl.height as h,
    dl.compare_type,
    dl.compare_month1,
    dl.compare_month2,
    dl.item_limit,
    dl.time_range,
    dl.sort_by
  FROM dashboard_layouts dl
  JOIN profiles p ON dl.profile_id = p.id
  WHERE p.clerk_id = user_clerk_id
  ORDER BY dl.position_y, dl.position_x;
END;
$$ LANGUAGE plpgsql;

-- 6. COMMENTS
COMMENT ON COLUMN profiles.dashboard_config IS 'Stores dashboard chart layout configuration as JSONB array';
COMMENT ON COLUMN products.category IS 'Product category for filtering and reporting';
