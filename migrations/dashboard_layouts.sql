-- ============================================
-- Dashboard Layouts Migration
-- ============================================
-- This migration creates a separate table for storing dashboard layouts
-- Alternative to storing in profiles.dashboard_config JSONB column

-- Option 1: Use existing profiles.dashboard_config (ALREADY EXISTS)
-- No migration needed - dashboard_config column already exists in profiles table
-- Structure: profiles.dashboard_config stores JSONB array of chart configurations

-- Option 2: Create separate dashboard_layouts table (if you prefer normalized structure)
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

-- Enable RLS
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Policy: Deny public access
CREATE POLICY "No public access to dashboard_layouts" 
  ON dashboard_layouts FOR ALL USING (false);

-- Index for faster queries
CREATE INDEX idx_dashboard_layouts_profile_id 
  ON dashboard_layouts(profile_id);

-- ============================================
-- Helper Functions
-- ============================================

-- Function to get dashboard layout for a user
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

-- ============================================
-- Sample Queries
-- ============================================

-- Insert a chart layout
INSERT INTO dashboard_layouts (
  profile_id,
  chart_id,
  chart_type,
  title,
  description,
  metric,
  color,
  position_x,
  position_y,
  width,
  height
) VALUES (
  (SELECT id FROM profiles WHERE clerk_id = 'YOUR_CLERK_ID'),
  'income-trend',
  'area',
  'รายได้ตามช่วงเวลา',
  'กราฟแสดงแนวโน้มรายได้',
  'total',
  '#3b82f6',
  0, 0, 8, 5
);

-- Update chart position
UPDATE dashboard_layouts
SET position_x = 4, position_y = 2, width = 6, height = 4
WHERE profile_id = (SELECT id FROM profiles WHERE clerk_id = 'YOUR_CLERK_ID')
  AND chart_id = 'income-trend';

-- Delete a chart
DELETE FROM dashboard_layouts
WHERE profile_id = (SELECT id FROM profiles WHERE clerk_id = 'YOUR_CLERK_ID')
  AND chart_id = 'old-chart-id';

-- Get all charts for a user
SELECT 
  chart_id,
  chart_type,
  title,
  position_x as x,
  position_y as y,
  width as w,
  height as h
FROM dashboard_layouts
WHERE profile_id = (SELECT id FROM profiles WHERE clerk_id = 'YOUR_CLERK_ID')
ORDER BY position_y, position_x;

-- ============================================
-- Migration from JSONB to Table (if needed)
-- ============================================

-- Migrate existing dashboard_config JSONB to dashboard_layouts table
INSERT INTO dashboard_layouts (
  profile_id,
  chart_id,
  chart_type,
  title,
  description,
  metric,
  color,
  position_x,
  position_y,
  width,
  height,
  compare_type,
  item_limit
)
SELECT 
  p.id as profile_id,
  elem->>'id' as chart_id,
  elem->>'type' as chart_type,
  elem->>'title' as title,
  elem->>'desc' as description,
  elem->>'metric' as metric,
  COALESCE(elem->>'color', '#3b82f6') as color,
  (elem->>'x')::INTEGER as position_x,
  (elem->>'y')::INTEGER as position_y,
  (elem->>'w')::INTEGER as width,
  (elem->>'h')::INTEGER as height,
  elem->>'compareType' as compare_type,
  (elem->>'limit')::INTEGER as item_limit
FROM profiles p,
     jsonb_array_elements(p.dashboard_config) as elem
WHERE p.dashboard_config IS NOT NULL
ON CONFLICT (profile_id, chart_id) DO UPDATE
SET 
  chart_type = EXCLUDED.chart_type,
  title = EXCLUDED.title,
  position_x = EXCLUDED.position_x,
  position_y = EXCLUDED.position_y,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  updated_at = NOW();
