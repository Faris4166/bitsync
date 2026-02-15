-- ============================================
-- SQL สำหรับบันทึกและดูตำแหน่ง Chart แต่ละตัว
-- แยกตามผู้ใช้ (clerk_id)
-- ============================================

-- 1. ดูตำแหน่ง Chart ทั้งหมดของผู้ใช้
-- แสดงว่า Chart แต่ละตัวอยู่ตำแหน่งไหน (x, y)
SELECT 
  p.clerk_id,
  p.full_name as ชื่อผู้ใช้,
  elem->>'title' as ชื่อ_Chart,
  elem->>'type' as ประเภท,
  (elem->>'x')::int as ตำแหน่ง_X,
  (elem->>'y')::int as ตำแหน่ง_Y,
  (elem->>'w')::int as ความกว้าง,
  (elem->>'h')::int as ความสูง,
  elem->>'color' as สี
FROM profiles p,
     jsonb_array_elements(p.dashboard_config) as elem
WHERE p.clerk_id = 'YOUR_CLERK_ID'  -- เปลี่ยนเป็น clerk_id ของคุณ
  AND p.dashboard_config IS NOT NULL
ORDER BY (elem->>'y')::int, (elem->>'x')::int;

-- ผลลัพธ์จะเป็นแบบนี้:
-- clerk_id          | ชื่อผู้ใช้ | ชื่อ_Chart           | ประเภท | ตำแหน่ง_X | ตำแหน่ง_Y | ความกว้าง | ความสูง | สี
-- user_123          | John       | รายได้ตามช่วงเวลา    | area   | 0         | 0         | 8         | 5       | #3b82f6
-- user_123          | John       | การกระจายรายได้       | pie    | 8         | 0         | 4         | 5       | #10b981
-- user_123          | John       | รายได้รวม            | stat   | 0         | 5         | 3         | 2       | #3b82f6


-- 2. ดูตำแหน่ง Chart แบบละเอียด (มี Grid Map)
-- แสดงว่า Chart อยู่ใน Grid ตำแหน่งไหน
SELECT 
  elem->>'title' as Chart,
  'x=' || (elem->>'x')::text || ', y=' || (elem->>'y')::text as ตำแหน่ง,
  'w=' || (elem->>'w')::text || ', h=' || (elem->>'h')::text as ขนาด,
  elem->>'type' as ประเภท
FROM profiles,
     jsonb_array_elements(dashboard_config) as elem
WHERE clerk_id = 'YOUR_CLERK_ID'
ORDER BY (elem->>'y')::int, (elem->>'x')::int;

-- ผลลัพธ์:
-- Chart                | ตำแหน่ง      | ขนาด        | ประเภท
-- รายได้ตามช่วงเวลา     | x=0, y=0    | w=8, h=5    | area
-- การกระจายรายได้        | x=8, y=0    | w=4, h=5    | pie
-- รายได้รวม             | x=0, y=5    | w=3, h=2    | stat


-- 3. เปรียบเทียบ Layout ของผู้ใช้หลายคน
-- ดูว่าแต่ละคนจัด Chart อย่างไร
SELECT 
  p.clerk_id,
  p.full_name,
  jsonb_array_length(p.dashboard_config) as จำนวน_Chart,
  string_agg(
    elem->>'title' || ' (x=' || (elem->>'x')::text || ',y=' || (elem->>'y')::text || ')',
    ', '
    ORDER BY (elem->>'y')::int, (elem->>'x')::int
  ) as รายการ_Chart
FROM profiles p,
     jsonb_array_elements(p.dashboard_config) as elem
WHERE p.dashboard_config IS NOT NULL
GROUP BY p.clerk_id, p.full_name
ORDER BY p.clerk_id;

-- ผลลัพธ์:
-- clerk_id | full_name | จำนวน_Chart | รายการ_Chart
-- user_001 | สมชาย     | 6           | รายได้ตามช่วงเวลา (x=0,y=0), การกระจายรายได้ (x=8,y=0), ...
-- user_002 | สมหญิง    | 4           | รายได้รวม (x=0,y=0), สินค้าขายดี (x=4,y=0), ...


-- 4. แสดง Layout เป็น Grid ASCII Art
-- สร้างภาพ Grid แสดงตำแหน่ง Chart
WITH chart_positions AS (
  SELECT 
    elem->>'id' as chart_id,
    elem->>'title' as title,
    (elem->>'x')::int as x,
    (elem->>'y')::int as y,
    (elem->>'w')::int as w,
    (elem->>'h')::int as h
  FROM profiles,
       jsonb_array_elements(dashboard_config) as elem
  WHERE clerk_id = 'YOUR_CLERK_ID'
)
SELECT 
  chart_id,
  title,
  'Position: (' || x::text || ',' || y::text || ')' as ตำแหน่ง,
  'Size: ' || w::text || 'x' || h::text as ขนาด,
  'Covers: x[' || x::text || '-' || (x+w-1)::text || '], y[' || y::text || '-' || (y+h-1)::text || ']' as พื้นที่ครอบคลุม
FROM chart_positions
ORDER BY y, x;

-- ผลลัพธ์:
-- chart_id      | title              | ตำแหน่ง        | ขนาด    | พื้นที่ครอบคลุม
-- income-trend  | รายได้ตามช่วงเวลา   | Position: (0,0)| Size: 8x5| Covers: x[0-7], y[0-4]
-- distribution  | การกระจายรายได้      | Position: (8,0)| Size: 4x5| Covers: x[8-11], y[0-4]


-- 5. หา Chart ที่อยู่ในแถวเดียวกัน (Row)
SELECT 
  (elem->>'y')::int as แถว_Y,
  string_agg(
    elem->>'title' || ' (x=' || (elem->>'x')::text || ')',
    ' | '
    ORDER BY (elem->>'x')::int
  ) as Charts_ในแถว
FROM profiles,
     jsonb_array_elements(dashboard_config) as elem
WHERE clerk_id = 'YOUR_CLERK_ID'
GROUP BY (elem->>'y')::int
ORDER BY แถว_Y;

-- ผลลัพธ์:
-- แถว_Y | Charts_ในแถว
-- 0     | รายได้ตามช่วงเวลา (x=0) | การกระจายรายได้ (x=8)
-- 5     | รายได้รวม (x=0) | รายได้จากสินค้า (x=3) | รายได้จากค่าแรง (x=6) | จำนวนออเดอร์ (x=9)


-- 6. ตรวจสอบว่ามี Chart ซ้อนทับกันหรือไม่
WITH chart_positions AS (
  SELECT 
    elem->>'id' as id1,
    elem->>'title' as title1,
    (elem->>'x')::int as x1,
    (elem->>'y')::int as y1,
    (elem->>'w')::int as w1,
    (elem->>'h')::int as h1
  FROM profiles,
       jsonb_array_elements(dashboard_config) as elem
  WHERE clerk_id = 'YOUR_CLERK_ID'
)
SELECT 
  a.title1 as Chart_1,
  b.title1 as Chart_2,
  'Chart 1: x[' || a.x1::text || '-' || (a.x1+a.w1-1)::text || '], y[' || a.y1::text || '-' || (a.y1+a.h1-1)::text || ']' as ตำแหน่ง_1,
  'Chart 2: x[' || b.x1::text || '-' || (b.x1+b.w1-1)::text || '], y[' || b.y1::text || '-' || (b.y1+b.h1-1)::text || ']' as ตำแหน่ง_2
FROM chart_positions a
CROSS JOIN chart_positions b
WHERE a.id1 < b.id1
  AND NOT (
    a.x1 + a.w1 <= b.x1 OR  -- a อยู่ซ้าย b
    b.x1 + b.w1 <= a.x1 OR  -- b อยู่ซ้าย a
    a.y1 + a.h1 <= b.y1 OR  -- a อยู่บน b
    b.y1 + b.h1 <= a.y1     -- b อยู่บน a
  );

-- ถ้าไม่มีผลลัพธ์ = ไม่มี Chart ซ้อนทับกัน ✅


-- 7. สรุป Layout ของผู้ใช้แต่ละคน
SELECT 
  clerk_id,
  full_name,
  jsonb_array_length(dashboard_config) as จำนวน_Chart_ทั้งหมด,
  COUNT(DISTINCT (elem->>'y')::int) as จำนวนแถว,
  MAX((elem->>'y')::int) + MAX((elem->>'h')::int) as ความสูงรวม,
  MAX((elem->>'x')::int) + MAX((elem->>'w')::int) as ความกว้างรวม
FROM profiles,
     jsonb_array_elements(dashboard_config) as elem
WHERE dashboard_config IS NOT NULL
GROUP BY clerk_id, full_name, dashboard_config
ORDER BY clerk_id;


-- 8. Export Layout เป็น JSON สำหรับ Backup
SELECT 
  clerk_id,
  full_name,
  jsonb_pretty(dashboard_config) as layout_json
FROM profiles
WHERE clerk_id = 'YOUR_CLERK_ID';
