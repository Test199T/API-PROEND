# SQL Execution Guide - Sleep Log API Fix

## 🔍 **ปัญหาที่พบ:**

### **SQL Script Errors:**
1. **Duplicate Constraints:** มีการเพิ่ม constraint ซ้ำ
2. **Syntax Errors:** มี syntax error ใน SQL
3. **View Creation Issues:** การสร้าง view มีปัญหา

## 🛠️ **วิธีแก้ไขแบบทีละขั้นตอน:**

### **Step 1: รัน SQL Script ทีละส่วน**

**แทนที่จะรันทั้งหมดพร้อมกัน ให้รันทีละส่วน:**

#### **ส่วนที่ 1: ตรวจสอบและลบ view**
```sql
-- ตรวจสอบ view ที่ใช้ sleep_quality column
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE definition LIKE '%sleep_quality%';

-- ลบ view ที่ใช้ sleep_quality column (ถ้ามี)
DROP VIEW IF EXISTS public.daily_health_summary CASCADE;
```

#### **ส่วนที่ 2: แก้ไข sleep_quality column**
```sql
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
```

#### **ส่วนที่ 3: แก้ไข bedtime และ wake_time columns**
```sql
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
```

#### **ส่วนที่ 4: แก้ไข array types**
```sql
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
```

#### **ส่วนที่ 5: อัปเดตข้อมูลเดิม**
```sql
-- อัปเดตข้อมูลเดิมให้ตรงกับ schema ใหม่
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
```

#### **ส่วนที่ 6: เพิ่ม indexes**
```sql
CREATE INDEX IF NOT EXISTS idx_sleep_log_user_id ON public.sleep_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_date ON public.sleep_log(sleep_date);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_quality ON public.sleep_log(sleep_quality);
CREATE INDEX IF NOT EXISTS idx_sleep_log_created_at ON public.sleep_log(created_at);
```

#### **ส่วนที่ 7: สร้าง trigger**
```sql
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
```

#### **ส่วนที่ 8: Grant permissions**
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO authenticated;
```

#### **ส่วนที่ 9: สร้าง view ใหม่**
```sql
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
```

#### **ส่วนที่ 10: ตรวจสอบ schema**
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sleep_log' 
ORDER BY ordinal_position;
```

### **Step 2: ทดสอบ API**

หลังจากรัน SQL script เสร็จแล้ว ให้ทดสอบ API:

```bash
node test-sleep-log-debug.js
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

### **Problem 1: Duplicate Constraints**
```
ERROR: constraint "sleep_quality_check" already exists
```

**Solution:** ใช้ `DROP CONSTRAINT IF EXISTS` ก่อนเพิ่ม constraint ใหม่

### **Problem 2: Syntax Errors**
```
ERROR: syntax error at or near "CREATE"
```

**Solution:** รัน SQL script ทีละส่วน แทนที่จะรันทั้งหมดพร้อมกัน

### **Problem 3: View Creation Issues**
```
ERROR: relation "daily_health_summary" already exists
```

**Solution:** ใช้ `CREATE OR REPLACE VIEW` แทน `CREATE VIEW`

## 📋 **Checklist การแก้ไข:**

- [ ] รัน SQL script ทีละส่วน
- [ ] ตรวจสอบว่าไม่มี error
- [ ] ตรวจสอบว่า columns ถูกแก้ไขแล้ว
- [ ] ตรวจสอบว่า constraints ถูกเพิ่มแล้ว
- [ ] ตรวจสอบว่า indexes ถูกสร้างแล้ว
- [ ] ตรวจสอบว่า permissions ถูกตั้งค่าแล้ว
- [ ] ตรวจสอบว่า view ถูกสร้างแล้ว
- [ ] ทดสอบ API ด้วยข้อมูลจริง
- [ ] ตรวจสอบว่าข้อมูลเข้าฐานข้อมูลแล้ว

## 🎯 **สรุป:**

**ปัญหาหลัก:** SQL script มี syntax errors และ duplicate constraints

**วิธีแก้:** รัน SQL script ทีละส่วน แทนที่จะรันทั้งหมดพร้อมกัน

**ผลลัพธ์:** API จะทำงานได้ปกติและข้อมูลจะเข้าฐานข้อมูล Supabase

---

**🚀 หลังจากรัน SQL script ทีละส่วนแล้ว API จะทำงานได้ปกติ!**
