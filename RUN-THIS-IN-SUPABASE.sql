-- 🚀 SQL Script สำหรับอัปเดต users table ใน Supabase
-- คัดลอกและรันใน Supabase SQL Editor

-- เพิ่ม columns ใหม่สำหรับข้อมูล profile ครบถ้วน
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS health_data JSONB,
ADD COLUMN IF NOT EXISTS health_goals JSONB,
ADD COLUMN IF NOT EXISTS nutrition_goals JSONB,
ADD COLUMN IF NOT EXISTS daily_behavior JSONB,
ADD COLUMN IF NOT EXISTS medical_history JSONB;

-- เพิ่ม indexes สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_users_health_data_gin ON public.users USING GIN (health_data);
CREATE INDEX IF NOT EXISTS idx_users_health_goals_gin ON public.users USING GIN (health_goals);
CREATE INDEX IF NOT EXISTS idx_users_nutrition_goals_gin ON public.users USING GIN (nutrition_goals);
CREATE INDEX IF NOT EXISTS idx_users_daily_behavior_gin ON public.users USING GIN (daily_behavior);
CREATE INDEX IF NOT EXISTS idx_users_medical_history_gin ON public.users USING GIN (medical_history);

-- สร้าง function สำหรับอัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง trigger สำหรับอัปเดต updated_at อัตโนมัติ
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO anon;

-- ✅ เสร็จแล้ว! ตอนนี้ระบบพร้อมใช้งาน
