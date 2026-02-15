-- ============================================
-- Add dashboard_config column to profiles table
-- ============================================
-- Run this migration to add dashboard_config support

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dashboard_config JSONB;

-- Add comment to column
COMMENT ON COLUMN profiles.dashboard_config IS 'Stores dashboard chart layout configuration as JSONB array';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'dashboard_config';
