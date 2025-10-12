-- 🚀 อัปเดต sleep_log table ให้ตรงกับ API DTO
-- คัดลอกและรันใน Supabase SQL Editor

-- 1. เพิ่ม columns ใหม่ที่ขาดหายไป
ALTER TABLE public.sleep_log 
ADD COLUMN IF NOT EXISTS sleep_duration_hours numeric,
ADD COLUMN IF NOT EXISTS sleep_efficiency_percentage numeric CHECK (sleep_efficiency_percentage >= 0 AND sleep_efficiency_percentage <= 100),
ADD COLUMN IF NOT EXISTS time_to_fall_asleep_minutes integer CHECK (time_to_fall_asleep_minutes >= 0),
ADD COLUMN IF NOT EXISTS awakenings_count integer CHECK (awakenings_count >= 0),
ADD COLUMN IF NOT EXISTS deep_sleep_minutes integer CHECK (deep_sleep_minutes >= 0),
ADD COLUMN IF NOT EXISTS light_sleep_minutes integer CHECK (light_sleep_minutes >= 0),
ADD COLUMN IF NOT EXISTS rem_sleep_minutes integer CHECK (rem_sleep_minutes >= 0),
ADD COLUMN IF NOT EXISTS awake_minutes integer CHECK (awake_minutes >= 0),
ADD COLUMN IF NOT EXISTS heart_rate_avg numeric CHECK (heart_rate_avg >= 30 AND heart_rate_avg <= 200),
ADD COLUMN IF NOT EXISTS heart_rate_min numeric CHECK (heart_rate_min >= 30 AND heart_rate_min <= 200),
ADD COLUMN IF NOT EXISTS heart_rate_max numeric CHECK (heart_rate_max >= 30 AND heart_rate_max <= 200),
ADD COLUMN IF NOT EXISTS oxygen_saturation_avg numeric CHECK (oxygen_saturation_avg >= 70 AND oxygen_saturation_avg <= 100),
ADD COLUMN IF NOT EXISTS room_temperature_celsius numeric CHECK (room_temperature_celsius >= 10 AND room_temperature_celsius <= 40),
ADD COLUMN IF NOT EXISTS noise_level_db numeric CHECK (noise_level_db >= 0 AND noise_level_db <= 120),
ADD COLUMN IF NOT EXISTS light_level_lux numeric CHECK (light_level_lux >= 0 AND light_level_lux <= 1000),
ADD COLUMN IF NOT EXISTS caffeine_intake_mg numeric CHECK (caffeine_intake_mg >= 0),
ADD COLUMN IF NOT EXISTS alcohol_intake_ml numeric CHECK (alcohol_intake_ml >= 0),
ADD COLUMN IF NOT EXISTS exercise_before_bed_hours numeric CHECK (exercise_before_bed_hours >= 0),
ADD COLUMN IF NOT EXISTS screen_time_before_bed_minutes integer CHECK (screen_time_before_bed_minutes >= 0),
ADD COLUMN IF NOT EXISTS sleep_aids_used text[],
ADD COLUMN IF NOT EXISTS medications_taken text[],
ADD COLUMN IF NOT EXISTS stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
ADD COLUMN IF NOT EXISTS mood_before_sleep integer CHECK (mood_before_sleep >= 1 AND mood_before_sleep <= 10),
ADD COLUMN IF NOT EXISTS mood_after_wake integer CHECK (mood_after_wake >= 1 AND mood_after_wake <= 10),
ADD COLUMN IF NOT EXISTS energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS dreams_remembered boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS nightmares boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- 2. เปลี่ยน sleep_quality จาก integer เป็น varchar เพื่อรองรับ enum values
ALTER TABLE public.sleep_log 
ALTER COLUMN sleep_quality TYPE varchar(20);

-- 3. เพิ่ม constraint สำหรับ sleep_quality enum
ALTER TABLE public.sleep_log 
ADD CONSTRAINT sleep_quality_check 
CHECK (sleep_quality IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));

-- 4. เปลี่ยน bedtime และ wake_time จาก time เป็น varchar เพื่อรองรับ HH:MM format
ALTER TABLE public.sleep_log 
ALTER COLUMN bedtime TYPE varchar(5),
ALTER COLUMN wake_time TYPE varchar(5);

-- 5. เพิ่ม constraint สำหรับ time format
ALTER TABLE public.sleep_log 
ADD CONSTRAINT bedtime_format_check 
CHECK (bedtime ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

ALTER TABLE public.sleep_log 
ADD CONSTRAINT wake_time_format_check 
CHECK (wake_time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

-- 6. เพิ่ม indexes สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_sleep_log_user_id ON public.sleep_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_date ON public.sleep_log(sleep_date);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_quality ON public.sleep_log(sleep_quality);
CREATE INDEX IF NOT EXISTS idx_sleep_log_created_at ON public.sleep_log(created_at);

-- 7. สร้าง trigger สำหรับอัปเดต updated_at อัตโนมัติ
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

-- 8. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO authenticated;

-- 9. อัปเดตข้อมูลเดิม (ถ้ามี) ให้ตรงกับ schema ใหม่
UPDATE public.sleep_log 
SET 
  sleep_duration_hours = total_sleep_hours,
  sleep_quality = CASE 
    WHEN sleep_quality::integer <= 2 THEN 'very_poor'
    WHEN sleep_quality::integer <= 4 THEN 'poor'
    WHEN sleep_quality::integer <= 6 THEN 'fair'
    WHEN sleep_quality::integer <= 8 THEN 'good'
    ELSE 'excellent'
  END,
  deep_sleep_minutes = COALESCE(deep_sleep_hours * 60, 0),
  rem_sleep_minutes = COALESCE(rem_sleep_hours * 60, 0),
  light_sleep_minutes = COALESCE(light_sleep_hours * 60, 0),
  notes = COALESCE(sleep_notes, ''),
  updated_at = CURRENT_TIMESTAMP
WHERE sleep_duration_hours IS NULL;
