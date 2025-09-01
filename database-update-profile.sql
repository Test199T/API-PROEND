-- SQL Script สำหรับอัปเดต users table เพื่อรองรับข้อมูล profile ครบถ้วน
-- รันใน Supabase SQL Editor

-- เพิ่ม columns ใหม่ใน users table สำหรับข้อมูลเพิ่มเติม
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS health_data JSONB,
ADD COLUMN IF NOT EXISTS health_goals JSONB,
ADD COLUMN IF NOT EXISTS nutrition_goals JSONB,
ADD COLUMN IF NOT EXISTS daily_behavior JSONB,
ADD COLUMN IF NOT EXISTS medical_history JSONB;

-- เพิ่ม comments สำหรับแต่ละ column
COMMENT ON COLUMN public.users.health_data IS 'ข้อมูลสุขภาพเพิ่มเติม: รอบเอว, ความดันโลหิต, น้ำตาลในเลือด';
COMMENT ON COLUMN public.users.health_goals IS 'เป้าหมายสุขภาพ: เป้าหมายหลัก, ระยะเวลา, แรงจูงใจ, เป้าหมายน้ำหนัก, การนอน, ออกกำลังกาย';
COMMENT ON COLUMN public.users.nutrition_goals IS 'เป้าหมายโภชนาการ: แคลอรี่, โปรตีน, คาร์โบไฮเดรต, ไขมัน, ไฟเบอร์, โซเดียม, ข้อจำกัดอาหาร';
COMMENT ON COLUMN public.users.daily_behavior IS 'พฤติกรรมประจำวัน: ความถี่การออกกำลังกาย, ชั่วโมงการนอน, มื้ออาหาร, การดื่มแอลกอฮอล์, การสูบบุหรี่';
COMMENT ON COLUMN public.users.medical_history IS 'ประวัติสุขภาพ: โรคประจำตัว, ประวัติการผ่าตัด, ประวัติการแพ้, ยาที่ใช้, ประวัติครอบครัว';

-- เพิ่ม indexes สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_users_health_data_gin ON public.users USING GIN (health_data);
CREATE INDEX IF NOT EXISTS idx_users_health_goals_gin ON public.users USING GIN (health_goals);
CREATE INDEX IF NOT EXISTS idx_users_nutrition_goals_gin ON public.users USING GIN (nutrition_goals);
CREATE INDEX IF NOT EXISTS idx_users_daily_behavior_gin ON public.users USING GIN (daily_behavior);
CREATE INDEX IF NOT EXISTS idx_users_medical_history_gin ON public.users USING GIN (medical_history);

-- ตัวอย่างข้อมูลที่จะเก็บใน JSON columns:

-- health_data structure:
-- {
--   "waist_circumference_cm": 80,
--   "blood_pressure_systolic": 120,
--   "blood_pressure_diastolic": 80,
--   "blood_sugar_mg_dl": 90
-- }

-- health_goals structure:
-- {
--   "main_goal": "ลดน้ำหนัก",
--   "goal_duration": "3 เดือน",
--   "motivation": "เพื่อสุขภาพที่ดีขึ้น",
--   "target_weight_kg": 65,
--   "target_sleep_hours": 8,
--   "target_exercise_minutes_per_day": 60
-- }

-- nutrition_goals structure:
-- {
--   "target_calories_per_day": 1800,
--   "target_protein_grams_per_day": 100,
--   "target_carbs_grams_per_day": 200,
--   "target_fat_grams_per_day": 60,
--   "target_fiber_grams_per_day": 25,
--   "target_sodium_mg_per_day": 2300,
--   "dietary_restrictions": ["ไม่กินหมู", "ลดน้ำตาล"]
-- }

-- daily_behavior structure:
-- {
--   "exercise_frequency_per_week": 5,
--   "average_sleep_hours_per_day": 7,
--   "meals_per_day": 3,
--   "alcohol_consumption": "occasionally",
--   "smoking_status": "never",
--   "daily_water_goal_ml": 2500
-- }

-- medical_history structure:
-- {
--   "chronic_conditions": [],
--   "surgery_history": [],
--   "allergies": ["ไข่", "ถั่วลิสง"],
--   "medications": [],
--   "family_medical_history": "พ่อแม่เป็นเบาหวาน"
-- }

-- สร้าง view สำหรับดึงข้อมูล profile แบบเต็ม
CREATE OR REPLACE VIEW user_complete_profile AS
SELECT 
  u.*,
  -- คำนวณ BMI
  CASE 
    WHEN u.height_cm IS NOT NULL AND u.weight_kg IS NOT NULL AND u.height_cm > 0 
    THEN ROUND((u.weight_kg / POWER(u.height_cm/100.0, 2))::NUMERIC, 2)
    ELSE NULL 
  END as bmi,
  
  -- คำนวณอายุ
  CASE 
    WHEN u.date_of_birth IS NOT NULL 
    THEN DATE_PART('year', AGE(u.date_of_birth))::INTEGER
    ELSE NULL 
  END as age,
  
  -- สถานะ BMI
  CASE 
    WHEN u.height_cm IS NOT NULL AND u.weight_kg IS NOT NULL AND u.height_cm > 0 THEN
      CASE 
        WHEN (u.weight_kg / POWER(u.height_cm/100.0, 2)) < 18.5 THEN 'ต่ำกว่าเกณฑ์'
        WHEN (u.weight_kg / POWER(u.height_cm/100.0, 2)) < 25 THEN 'ปกติ'
        WHEN (u.weight_kg / POWER(u.height_cm/100.0, 2)) < 30 THEN 'เกินเกณฑ์'
        ELSE 'อ้วน'
      END
    ELSE NULL 
  END as bmi_status,
  
  -- ชื่อเต็ม
  CONCAT(u.first_name, ' ', u.last_name) as full_name
FROM public.users u
WHERE u.is_active = true;

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
GRANT SELECT ON user_complete_profile TO anon;

-- ตัวอย่างการ query ข้อมูล JSON
-- SELECT 
--   first_name, 
--   last_name,
--   health_data->>'waist_circumference_cm' as waist_cm,
--   health_goals->>'main_goal' as main_goal,
--   nutrition_goals->>'target_calories_per_day' as target_calories,
--   daily_behavior->>'exercise_frequency_per_week' as exercise_freq,
--   medical_history->>'allergies' as allergies
-- FROM users 
-- WHERE id = 1;
