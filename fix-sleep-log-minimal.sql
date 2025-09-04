-- 🔧 แก้ไข sleep_log table เฉพาะส่วนที่จำเป็น
-- รันใน Supabase SQL Editor ทีละส่วน

-- =====================================================
-- STEP 1: ลบ view ที่ใช้ sleep_quality (ถ้ามี)
-- =====================================================
DROP VIEW IF EXISTS public.daily_health_summary CASCADE;

-- =====================================================
-- STEP 2: แก้ไข sleep_quality column
-- =====================================================

-- ลบ constraint เก่า (ถ้ามี)
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS sleep_quality_check;

-- เปลี่ยน sleep_quality จาก integer เป็น varchar ด้วย USING clause
ALTER TABLE public.sleep_log 
ALTER COLUMN sleep_quality TYPE varchar(20) 
USING CASE 
  WHEN sleep_quality IS NULL THEN NULL
  WHEN sleep_quality = 1 THEN 'very_poor'
  WHEN sleep_quality = 2 THEN 'very_poor'
  WHEN sleep_quality = 3 THEN 'poor'
  WHEN sleep_quality = 4 THEN 'poor'
  WHEN sleep_quality = 5 THEN 'fair'
  WHEN sleep_quality = 6 THEN 'fair'
  WHEN sleep_quality = 7 THEN 'good'
  WHEN sleep_quality = 8 THEN 'good'
  WHEN sleep_quality = 9 THEN 'excellent'
  WHEN sleep_quality = 10 THEN 'excellent'
  ELSE 'fair' -- default value
END;

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

-- เปลี่ยน bedtime และ wake_time จาก time เป็น varchar(8) (เพิ่มขนาด)
ALTER TABLE public.sleep_log 
ALTER COLUMN bedtime TYPE varchar(8) 
USING CASE 
  WHEN bedtime IS NULL THEN NULL
  ELSE TO_CHAR(bedtime, 'HH24:MI')
END;

ALTER TABLE public.sleep_log 
ALTER COLUMN wake_time TYPE varchar(8) 
USING CASE 
  WHEN wake_time IS NULL THEN NULL
  ELSE TO_CHAR(wake_time, 'HH24:MI')
END;

-- เพิ่ม format validation สำหรับ time fields
ALTER TABLE public.sleep_log 
ADD CONSTRAINT bedtime_format_check 
CHECK (bedtime IS NULL OR bedtime ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

ALTER TABLE public.sleep_log 
ADD CONSTRAINT wake_time_format_check 
CHECK (wake_time IS NULL OR wake_time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

-- =====================================================
-- STEP 4: แก้ไข array types (ถ้าจำเป็น)
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
-- STEP 5: เพิ่ม indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_sleep_log_user_id ON public.sleep_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_date ON public.sleep_log(sleep_date);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_quality ON public.sleep_log(sleep_quality);
CREATE INDEX IF NOT EXISTS idx_sleep_log_created_at ON public.sleep_log(created_at);

-- =====================================================
-- STEP 6: Grant permissions
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO authenticated;

-- =====================================================
-- STEP 7: ตรวจสอบ schema
-- =====================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sleep_log' 
  AND column_name IN ('sleep_quality', 'bedtime', 'wake_time')
ORDER BY ordinal_position;

-- ✅ เสร็จแล้ว! ตอนนี้ sleep_log table พร้อมใช้งานกับ API แล้ว
