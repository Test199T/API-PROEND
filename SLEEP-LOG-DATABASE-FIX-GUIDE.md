# Sleep Log API - Database Fix Guide

## 🔍 **ปัญหาที่พบ:**

### **Database Schema ไม่ตรงกับ API DTO**

**ปัญหา:**
- Database มี `sleep_log` table แต่โครงสร้างไม่ตรงกับที่ API คาดหวัง
- ฟิลด์หลายตัวขาดหายไป
- Data types ไม่ตรงกัน

## 🛠️ **วิธีแก้ไข:**

### **Step 1: อัปเดต Database Schema**

1. **เปิด Supabase Dashboard**
2. **ไปที่ SQL Editor**
3. **คัดลอกและรัน SQL script นี้:**

```sql
-- อัปเดต sleep_log table ให้ตรงกับ API DTO
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

-- เปลี่ยน sleep_quality จาก integer เป็น varchar
ALTER TABLE public.sleep_log 
ALTER COLUMN sleep_quality TYPE varchar(20);

-- เพิ่ม constraint สำหรับ sleep_quality enum
ALTER TABLE public.sleep_log 
ADD CONSTRAINT sleep_quality_check 
CHECK (sleep_quality IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));

-- เปลี่ยน bedtime และ wake_time จาก time เป็น varchar
ALTER TABLE public.sleep_log 
ALTER COLUMN bedtime TYPE varchar(5),
ALTER COLUMN wake_time TYPE varchar(5);

-- เพิ่ม constraint สำหรับ time format
ALTER TABLE public.sleep_log 
ADD CONSTRAINT bedtime_format_check 
CHECK (bedtime ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

ALTER TABLE public.sleep_log 
ADD CONSTRAINT wake_time_format_check 
CHECK (wake_time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

-- เพิ่ม indexes
CREATE INDEX IF NOT EXISTS idx_sleep_log_user_id ON public.sleep_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_date ON public.sleep_log(sleep_date);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_quality ON public.sleep_log(sleep_quality);
CREATE INDEX IF NOT EXISTS idx_sleep_log_created_at ON public.sleep_log(created_at);

-- สร้าง trigger สำหรับอัปเดต updated_at อัตโนมัติ
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

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO authenticated;
```

### **Step 2: ทดสอบ API**

หลังจากรัน SQL script แล้ว ให้ทดสอบ API:

```bash
# ทดสอบการสร้าง sleep log
curl -X POST http://localhost:3000/sleep-log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sleep_date": "2024-01-15",
    "bedtime": "22:30",
    "wake_time": "06:30",
    "sleep_duration_hours": 8,
    "sleep_quality": "good",
    "sleep_efficiency_percentage": 85
  }'
```

### **Step 3: ตรวจสอบผลลัพธ์**

**Expected Response (201):**
```json
{
  "success": true,
  "message": "สร้างบันทึกการนอนสำเร็จ",
  "data": {
    "id": 1,
    "sleep_date": "2024-01-15",
    "bedtime": "22:30",
    "wake_time": "06:30",
    "sleep_duration_hours": 8,
    "sleep_quality": "good",
    "sleep_efficiency_percentage": 85,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

## 🔧 **การแก้ไขปัญหาเฉพาะ:**

### **Problem 1: Column ไม่มีอยู่**
```
Error: column "sleep_duration_hours" does not exist
```

**Solution:** รัน SQL script ข้างต้นเพื่อเพิ่ม columns ที่ขาดหายไป

### **Problem 2: Data Type ไม่ตรงกัน**
```
Error: invalid input syntax for type integer: "good"
```

**Solution:** เปลี่ยน sleep_quality จาก integer เป็น varchar และเพิ่ม enum constraint

### **Problem 3: Time Format ไม่ถูกต้อง**
```
Error: invalid input syntax for type time: "22:30"
```

**Solution:** เปลี่ยน bedtime และ wake_time จาก time เป็น varchar

### **Problem 4: Permission Denied**
```
Error: permission denied for table sleep_log
```

**Solution:** รัน GRANT statements ใน SQL script

## 📋 **Checklist การแก้ไข:**

- [ ] รัน SQL script ใน Supabase SQL Editor
- [ ] ตรวจสอบว่า columns ใหม่ถูกสร้างแล้ว
- [ ] ตรวจสอบว่า constraints ถูกเพิ่มแล้ว
- [ ] ตรวจสอบว่า indexes ถูกสร้างแล้ว
- [ ] ตรวจสอบว่า permissions ถูกตั้งค่าแล้ว
- [ ] ทดสอบ API ด้วยข้อมูลจริง
- [ ] ตรวจสอบว่าข้อมูลเข้าฐานข้อมูลแล้ว

## 🎯 **สรุป:**

**ปัญหาหลัก:** Database schema ไม่ตรงกับ API DTO

**วิธีแก้:** อัปเดต database schema ให้ตรงกับ API requirements

**ผลลัพธ์:** API จะทำงานได้ปกติและข้อมูลจะเข้าฐานข้อมูล Supabase

---

**🚀 หลังจากรัน SQL script แล้ว API จะทำงานได้ปกติ!**
