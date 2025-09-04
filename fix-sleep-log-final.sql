-- 🔧 แก้ไข sleep_log table แบบทีละขั้นตอน
-- รันใน Supabase SQL Editor ทีละส่วน

-- =====================================================
-- STEP 1: ตรวจสอบและลบ view ที่ใช้ sleep_quality
-- =====================================================

-- ตรวจสอบ view ที่ใช้ sleep_quality column
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE definition LIKE '%sleep_quality%';

-- ลบ view ที่ใช้ sleep_quality column (ถ้ามี)
DROP VIEW IF EXISTS public.daily_health_summary CASCADE;

-- =====================================================
-- STEP 2: แก้ไข sleep_quality column
-- =====================================================

-- ลบ constraint เก่า (ถ้ามี)
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS sleep_quality_check;

-- เปลี่ยน sleep_quality จาก integer เป็น varchar
ALTER TABLE public.sleep_log 
ALTER COLUMN sleep_quality TYPE varchar(20);

-- เพิ่ม enum constraint สำหรับ sleep_quality
ALTER TABLE public.sleep_log 
ADD CONSTRAINT sleep_quality_check 
CHECK (sleep_quality IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));

-- =====================================================
-- STEP 3: แก้ไข bedtime และ wake_time columns
-- =====================================================

-- ลบ constraints เก่า (ถ้ามี)
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS bedtime_format_check;

ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS wake_time_format_check;

-- เปลี่ยน bedtime และ wake_time จาก time เป็น varchar
ALTER TABLE public.sleep_log 
ALTER COLUMN bedtime TYPE varchar(5),
ALTER COLUMN wake_time TYPE varchar(5);

-- เพิ่ม format validation สำหรับ time fields
ALTER TABLE public.sleep_log 
ADD CONSTRAINT bedtime_format_check 
CHECK (bedtime ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

ALTER TABLE public.sleep_log 
ADD CONSTRAINT wake_time_format_check 
CHECK (wake_time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

-- =====================================================
-- STEP 4: แก้ไข array types
-- =====================================================

-- แก้ไข sleep_aids_used array type
ALTER TABLE public.sleep_log 
ALTER COLUMN sleep_aids_used TYPE text[] USING 
  CASE 
    WHEN sleep_aids_used IS NULL THEN NULL
    ELSE ARRAY[]::text[]
  END;

-- แก้ไข medications_taken array type
ALTER TABLE public.sleep_log 
ALTER COLUMN medications_taken TYPE text[] USING 
  CASE 
    WHEN medications_taken IS NULL THEN NULL
    ELSE ARRAY[]::text[]
  END;

-- =====================================================
-- STEP 5: อัปเดตข้อมูลเดิม (ถ้ามี)
-- =====================================================

-- อัปเดตข้อมูลเดิมให้ตรงกับ schema ใหม่
-- หมายเหตุ: รันส่วนนี้หลังจากเปลี่ยน column type แล้วเท่านั้น
UPDATE public.sleep_log 
SET 
  sleep_quality = CASE 
    WHEN sleep_quality::text ~ '^[0-9]+$' AND sleep_quality::integer <= 2 THEN 'very_poor'
    WHEN sleep_quality::text ~ '^[0-9]+$' AND sleep_quality::integer <= 4 THEN 'poor'
    WHEN sleep_quality::text ~ '^[0-9]+$' AND sleep_quality::integer <= 6 THEN 'fair'
    WHEN sleep_quality::text ~ '^[0-9]+$' AND sleep_quality::integer <= 8 THEN 'good'
    WHEN sleep_quality::text ~ '^[0-9]+$' THEN 'excellent'
    ELSE sleep_quality -- ถ้าไม่ใช่ตัวเลข ให้คงค่าเดิม
  END,
  bedtime = CASE 
    WHEN bedtime::text ~ '^[0-9]{2}:[0-9]{2}:[0-9]{2}$' THEN TO_CHAR(bedtime::time, 'HH24:MI')
    ELSE bedtime -- ถ้าไม่ใช่ time format ให้คงค่าเดิม
  END,
  wake_time = CASE 
    WHEN wake_time::text ~ '^[0-9]{2}:[0-9]{2}:[0-9]{2}$' THEN TO_CHAR(wake_time::time, 'HH24:MI')
    ELSE wake_time -- ถ้าไม่ใช่ time format ให้คงค่าเดิม
  END,
  sleep_duration_hours = COALESCE(total_sleep_hours, sleep_duration_hours),
  deep_sleep_minutes = COALESCE(deep_sleep_hours * 60, deep_sleep_minutes),
  rem_sleep_minutes = COALESCE(rem_sleep_hours * 60, rem_sleep_minutes),
  light_sleep_minutes = COALESCE(light_sleep_hours * 60, light_sleep_minutes),
  notes = COALESCE(sleep_notes, notes, ''),
  updated_at = CURRENT_TIMESTAMP
WHERE sleep_quality::text ~ '^[0-9]+$' OR bedtime::text ~ '^[0-9]{2}:[0-9]{2}:[0-9]{2}$';

-- =====================================================
-- STEP 6: เพิ่ม indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sleep_log_user_id ON public.sleep_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_date ON public.sleep_log(sleep_date);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_quality ON public.sleep_log(sleep_quality);
CREATE INDEX IF NOT EXISTS idx_sleep_log_created_at ON public.sleep_log(created_at);

-- =====================================================
-- STEP 7: สร้าง trigger สำหรับอัปเดต updated_at อัตโนมัติ
-- =====================================================

CREATE OR REPLACE FUNCTION update_sleep_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_sleep_log_updated_at ON public.sleep_log;
CREATE TRIGGER update_sleep_log_updated_at 
  BEFORE UPDATE ON public.sleep_log 
  FOR EACH ROW 
  EXECUTE FUNCTION update_sleep_log_updated_at();

-- =====================================================
-- STEP 8: Grant permissions
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO authenticated;

-- =====================================================
-- STEP 9: สร้าง view ใหม่
-- =====================================================

CREATE OR REPLACE VIEW public.daily_health_summary AS
SELECT 
  u.id as user_id,
  u.first_name,
  u.last_name,
  CURRENT_DATE as summary_date,
  
  -- Sleep data
  sl.sleep_quality,
  sl.sleep_duration_hours,
  sl.sleep_efficiency_percentage,
  sl.bedtime,
  sl.wake_time,
  
  -- Exercise data
  el.total_exercise_minutes,
  el.total_calories_burned,
  el.exercise_types,
  
  -- Food data
  fl.total_calories_consumed,
  fl.total_protein_g,
  fl.total_carbs_g,
  fl.total_fat_g,
  
  -- Water data
  wl.total_water_ml,
  
  -- Health metrics
  hm.blood_pressure_systolic,
  hm.blood_pressure_diastolic,
  hm.heart_rate,
  hm.bmi,
  
  -- Goals progress
  hg.active_goals_count,
  hg.completed_goals_count,
  
  CURRENT_TIMESTAMP as created_at
FROM public.users u
LEFT JOIN (
  SELECT 
    user_id,
    sleep_quality,
    sleep_duration_hours,
    sleep_efficiency_percentage,
    bedtime,
    wake_time
  FROM public.sleep_log 
  WHERE sleep_date = CURRENT_DATE
) sl ON u.id = sl.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(duration_minutes) as total_exercise_minutes,
    SUM(calories_burned) as total_calories_burned,
    ARRAY_AGG(DISTINCT exercise_type) as exercise_types
  FROM public.exercise_log 
  WHERE exercise_date = CURRENT_DATE
  GROUP BY user_id
) el ON u.id = el.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(calories) as total_calories_consumed,
    SUM(protein_g) as total_protein_g,
    SUM(carbs_g) as total_carbs_g,
    SUM(fat_g) as total_fat_g
  FROM public.food_log 
  WHERE DATE(consumed_at) = CURRENT_DATE
  GROUP BY user_id
) fl ON u.id = fl.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(amount_ml) as total_water_ml
  FROM public.water_log 
  WHERE DATE(consumed_at) = CURRENT_DATE
  GROUP BY user_id
) wl ON u.id = wl.user_id
LEFT JOIN (
  SELECT 
    user_id,
    blood_pressure_systolic,
    blood_pressure_diastolic,
    heart_rate,
    bmi
  FROM public.health_metrics 
  WHERE metric_date = CURRENT_DATE
) hm ON u.id = hm.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_goals_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_goals_count
  FROM public.health_goals 
  GROUP BY user_id
) hg ON u.id = hg.user_id
WHERE u.is_active = true;

-- Grant permissions สำหรับ view
GRANT SELECT ON public.daily_health_summary TO anon;
GRANT SELECT ON public.daily_health_summary TO authenticated;

-- =====================================================
-- STEP 10: ตรวจสอบ schema
-- =====================================================

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sleep_log' 
ORDER BY ordinal_position;

-- ✅ เสร็จแล้ว! ตอนนี้ sleep_log table พร้อมใช้งานกับ API แล้ว
