-- ============================================
-- Dashboard Layout Save Queries
-- ============================================

-- 1. SAVE ENTIRE LAYOUT (Current Method - JSONB)
-- This is what the app currently uses
UPDATE profiles
SET 
  dashboard_config = '[
    {
      "id": "income-trend",
      "type": "area",
      "title": "รายได้ตามช่วงเวลา",
      "desc": "กราฟแสดงแนวโน้ม",
      "metric": "total",
      "color": "#3b82f6",
      "x": 0,
      "y": 0,
      "w": 8,
      "h": 5
    },
    {
      "id": "stat-total",
      "type": "stat",
      "title": "รายได้รวม",
      "desc": "ยอดรวมทั้งหมด",
      "metric": "total",
      "color": "#10b981",
      "x": 0,
      "y": 5,
      "w": 3,
      "h": 2
    }
  ]'::jsonb,
  updated_at = NOW()
WHERE clerk_id = 'YOUR_CLERK_ID';

-- 2. ADD SINGLE CHART TO EXISTING LAYOUT
UPDATE profiles
SET 
  dashboard_config = dashboard_config || '[{
    "id": "new-chart",
    "type": "pie",
    "title": "กราฟใหม่",
    "desc": "คำอธิบาย",
    "metric": "products",
    "color": "#ec4899",
    "x": 8,
    "y": 0,
    "w": 4,
    "h": 5
  }]'::jsonb,
  updated_at = NOW()
WHERE clerk_id = 'YOUR_CLERK_ID';

-- 3. REMOVE CHART BY ID
UPDATE profiles
SET 
  dashboard_config = (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements(dashboard_config) elem
    WHERE elem->>'id' != 'chart-to-remove'
  ),
  updated_at = NOW()
WHERE clerk_id = 'YOUR_CLERK_ID';

-- 4. UPDATE CHART POSITION
UPDATE profiles
SET 
  dashboard_config = (
    SELECT jsonb_agg(
      CASE 
        WHEN elem->>'id' = 'income-trend'
        THEN jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(elem, '{x}', '4'),
              '{y}', '2'
            ),
            '{w}', '6'
          ),
          '{h}', '4'
        )
        ELSE elem
      END
    )
    FROM jsonb_array_elements(dashboard_config) elem
  ),
  updated_at = NOW()
WHERE clerk_id = 'YOUR_CLERK_ID';

-- 5. RESET TO DEFAULT LAYOUT
UPDATE profiles
SET 
  dashboard_config = '[
    {
      "id": "income-trend",
      "type": "area",
      "title": "รายได้ตามช่วงเวลา",
      "desc": "รายได้ตามช่วงเวลา",
      "color": "#3b82f6",
      "metric": "total",
      "x": 0,
      "y": 0,
      "w": 8,
      "h": 5
    },
    {
      "id": "distribution",
      "type": "pie",
      "title": "การกระจายรายได้",
      "desc": "แบ่งตามหมวดหมู่",
      "color": "#10b981",
      "metric": "products",
      "x": 8,
      "y": 0,
      "w": 4,
      "h": 5
    },
    {
      "id": "stat-total",
      "type": "stat",
      "title": "รายได้รวม",
      "desc": "รายได้รวม",
      "color": "#3b82f6",
      "metric": "total",
      "x": 0,
      "y": 5,
      "w": 3,
      "h": 2
    },
    {
      "id": "stat-products",
      "type": "stat",
      "title": "รายได้จากสินค้า",
      "desc": "จากสินค้า",
      "color": "#10b981",
      "metric": "products",
      "x": 3,
      "y": 5,
      "w": 3,
      "h": 2
    },
    {
      "id": "stat-labor",
      "type": "stat",
      "title": "รายได้จากค่าแรง",
      "desc": "จากค่าแรง",
      "color": "#f59e0b",
      "metric": "labor",
      "x": 6,
      "y": 5,
      "w": 3,
      "h": 2
    },
    {
      "id": "stat-orders",
      "type": "stat",
      "title": "จำนวนออเดอร์",
      "desc": "จำนวนออเดอร์",
      "color": "#10b981",
      "metric": "count",
      "x": 9,
      "y": 5,
      "w": 3,
      "h": 2
    }
  ]'::jsonb,
  updated_at = NOW()
WHERE clerk_id = 'YOUR_CLERK_ID';

-- ============================================
-- Verification Queries
-- ============================================

-- Check current layout
SELECT 
  clerk_id,
  jsonb_pretty(dashboard_config) as layout,
  updated_at
FROM profiles
WHERE clerk_id = 'YOUR_CLERK_ID';

-- Count charts
SELECT 
  clerk_id,
  jsonb_array_length(dashboard_config) as chart_count
FROM profiles
WHERE dashboard_config IS NOT NULL;

-- List all chart positions
SELECT 
  clerk_id,
  elem->>'id' as chart_id,
  elem->>'title' as title,
  elem->>'type' as type,
  (elem->>'x')::int as x,
  (elem->>'y')::int as y,
  (elem->>'w')::int as w,
  (elem->>'h')::int as h
FROM profiles,
     jsonb_array_elements(dashboard_config) as elem
WHERE clerk_id = 'YOUR_CLERK_ID'
ORDER BY (elem->>'y')::int, (elem->>'x')::int;

-- Find charts by type
SELECT 
  clerk_id,
  elem->>'title' as title,
  elem->>'type' as type
FROM profiles,
     jsonb_array_elements(dashboard_config) as elem
WHERE elem->>'type' = 'stat'
  AND clerk_id = 'YOUR_CLERK_ID';

-- ============================================
-- Bulk Operations
-- ============================================

-- Clear all layouts
UPDATE profiles
SET dashboard_config = NULL
WHERE clerk_id = 'YOUR_CLERK_ID';

-- Copy layout from one user to another
UPDATE profiles
SET dashboard_config = (
  SELECT dashboard_config 
  FROM profiles 
  WHERE clerk_id = 'SOURCE_USER_ID'
)
WHERE clerk_id = 'TARGET_USER_ID';
