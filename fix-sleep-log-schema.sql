-- 🔧 แก้ไข sleep_log table ให้ตรงกับ API requirements
-- รันใน Supabase SQL Editor

-- 1. เปลี่ยน sleep_quality จาก integer เป็น varchar
ALTER TABLE public.sleep_log 
ALTER COLUMN sleep_quality TYPE varchar(20);

-- 2. เพิ่ม enum constraint สำหรับ sleep_quality
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS sleep_quality_check;

ALTER TABLE public.sleep_log 
ADD CONSTRAINT sleep_quality_check 
CHECK (sleep_quality IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));

-- 3. เปลี่ยน bedtime และ wake_time จาก time เป็น varchar
ALTER TABLE public.sleep_log 
ALTER COLUMN bedtime TYPE varchar(5),
ALTER COLUMN wake_time TYPE varchar(5);

-- 4. เพิ่ม format validation สำหรับ time fields
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS bedtime_format_check;

ALTER TABLE public.sleep_log 
ADD CONSTRAINT bedtime_format_check 
CHECK (bedtime ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS wake_time_format_check;

ALTER TABLE public.sleep_log 
ADD CONSTRAINT wake_time_format_check 
CHECK (wake_time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

-- 5. แก้ไข array types ให้เป็น text[]
ALTER TABLE public.sleep_log 
ALTER COLUMN sleep_aids_used TYPE text[] USING 
  CASE 
    WHEN sleep_aids_used IS NULL THEN NULL
    ELSE ARRAY[]::text[]
  END;

ALTER TABLE public.sleep_log 
ALTER COLUMN medications_taken TYPE text[] USING 
  CASE 
    WHEN medications_taken IS NULL THEN NULL
    ELSE ARRAY[]::text[]
  END;

-- 6. อัปเดตข้อมูลเดิม (ถ้ามี) ให้ตรงกับ schema ใหม่
UPDATE public.sleep_log 
SET 
  sleep_quality = CASE 
    WHEN sleep_quality::integer <= 2 THEN 'very_poor'
    WHEN sleep_quality::integer <= 4 THEN 'poor'
    WHEN sleep_quality::integer <= 6 THEN 'fair'
    WHEN sleep_quality::integer <= 8 THEN 'good'
    ELSE 'excellent'
  END,
  bedtime = TO_CHAR(bedtime::time, 'HH24:MI'),
  wake_time = TO_CHAR(wake_time::time, 'HH24:MI'),
  sleep_duration_hours = COALESCE(total_sleep_hours, sleep_duration_hours),
  deep_sleep_minutes = COALESCE(deep_sleep_hours * 60, deep_sleep_minutes),
  rem_sleep_minutes = COALESCE(rem_sleep_hours * 60, rem_sleep_minutes),
  light_sleep_minutes = COALESCE(light_sleep_hours * 60, light_sleep_minutes),
  notes = COALESCE(sleep_notes, notes, ''),
  updated_at = CURRENT_TIMESTAMP
WHERE sleep_quality ~ '^[0-9]+$' OR bedtime::text ~ '^[0-9]{2}:[0-9]{2}:[0-9]{2}';

-- 7. เพิ่ม indexes สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_sleep_log_user_id ON public.sleep_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_date ON public.sleep_log(sleep_date);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_quality ON public.sleep_log(sleep_quality);
CREATE INDEX IF NOT EXISTS idx_sleep_log_created_at ON public.sleep_log(created_at);

-- 8. สร้าง trigger สำหรับอัปเดต updated_at อัตโนมัติ
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

-- 9. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO authenticated;

-- 10. ตรวจสอบ schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sleep_log' 
ORDER BY ordinal_position;

-- ✅ เสร็จแล้ว! ตอนนี้ sleep_log table พร้อมใช้งานกับ API แล้ว
