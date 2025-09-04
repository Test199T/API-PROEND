# Simple SQL Fix Guide - Sleep Log API

## 🎯 **สิ่งที่ต้องทำ:**

### **1. รัน SQL Script ทีละส่วนใน Supabase SQL Editor:**

#### **ส่วนที่ 1: ลบ view**
```sql
DROP VIEW IF EXISTS public.daily_health_summary CASCADE;
```

#### **ส่วนที่ 2: แก้ไข sleep_quality column**
```sql
-- ลบ constraint เก่า
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS sleep_quality_check;

-- เปลี่ยน sleep_quality จาก integer เป็น varchar
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
  ELSE 'fair'
END;

-- เพิ่ม constraint ใหม่
ALTER TABLE public.sleep_log 
ADD CONSTRAINT sleep_quality_check 
CHECK (sleep_quality IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));
```

#### **ส่วนที่ 3: แก้ไข bedtime และ wake_time columns**
```sql
-- ลบ constraints เก่า
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS bedtime_format_check;
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS wake_time_format_check;

-- เปลี่ยน bedtime และ wake_time
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

-- เพิ่ม constraints ใหม่
ALTER TABLE public.sleep_log 
ADD CONSTRAINT bedtime_format_check 
CHECK (bedtime IS NULL OR bedtime ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

ALTER TABLE public.sleep_log 
ADD CONSTRAINT wake_time_format_check 
CHECK (wake_time IS NULL OR wake_time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');
```

#### **ส่วนที่ 4: แก้ไข array types**
```sql
-- แก้ไข sleep_aids_used
ALTER TABLE public.sleep_log 
ALTER COLUMN sleep_aids_used TYPE text[] USING 
  CASE 
    WHEN sleep_aids_used IS NULL THEN NULL
    ELSE ARRAY[]::text[]
  END;

-- แก้ไข medications_taken
ALTER TABLE public.sleep_log 
ALTER COLUMN medications_taken TYPE text[] USING 
  CASE 
    WHEN medications_taken IS NULL THEN NULL
    ELSE ARRAY[]::text[]
  END;
```

#### **ส่วนที่ 5: เพิ่ม indexes**
```sql
CREATE INDEX IF NOT EXISTS idx_sleep_log_user_id ON public.sleep_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_date ON public.sleep_log(sleep_date);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_quality ON public.sleep_log(sleep_quality);
CREATE INDEX IF NOT EXISTS idx_sleep_log_created_at ON public.sleep_log(created_at);
```

#### **ส่วนที่ 6: Grant permissions**
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO authenticated;
```

#### **ส่วนที่ 7: ตรวจสอบ schema**
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sleep_log' 
  AND column_name IN ('sleep_quality', 'bedtime', 'wake_time')
ORDER BY ordinal_position;
```

## 🔧 **สิ่งที่แก้ไข:**

### **1. sleep_quality column:**
- เปลี่ยนจาก `integer` เป็น `varchar(20)`
- ใช้ `USING CASE` เพื่อแปลงค่า 1-10 เป็น text
- เพิ่ม constraint สำหรับ enum values

### **2. bedtime และ wake_time columns:**
- เปลี่ยนจาก `time` เป็น `varchar(8)`
- ใช้ `TO_CHAR()` เพื่อแปลง time เป็น string
- เพิ่ม format validation

### **3. Array columns:**
- แก้ไข `sleep_aids_used` และ `medications_taken` เป็น `text[]`
- ใช้ `USING` clause เพื่อแปลง array type

## ✅ **ผลลัพธ์ที่คาดหวัง:**

หลังจากรัน SQL script แล้ว:
- `sleep_quality` จะเป็น `varchar(20)` พร้อม enum values
- `bedtime` และ `wake_time` จะเป็น `varchar(8)` พร้อม format validation
- Array columns จะเป็น `text[]` type
- API จะทำงานได้ปกติ

## 🚀 **ขั้นตอนต่อไป:**

1. รัน SQL script ทีละส่วนใน Supabase SQL Editor
2. ตรวจสอบว่าไม่มี error
3. ทดสอบ API ด้วย `node test-sleep-log-debug.js`
4. ตรวจสอบว่าข้อมูลเข้าฐานข้อมูลแล้ว

---

**🎯 ใช้ SQL script นี้จะแก้ไขปัญหาได้ทั้งหมด!**
