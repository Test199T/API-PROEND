# Sleep Quality Column Fix Guide

## 🚨 **ปัญหาที่พบ:**

```
ERROR: 42883: operator does not exist: character varying >= integer
ERROR: 22P02: invalid input syntax for type integer: "very_poor"
```

## 🔍 **สาเหตุของปัญหา:**

### **1. Constraint เก่ายังไม่ได้ลบ:**
- `sleep_quality` ยังมี constraint เก่าที่เป็น `integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10)`
- PostgreSQL ไม่สามารถเปลี่ยน column type ได้เมื่อมี constraint ที่ขัดแย้งกัน

### **2. Column Type ยังเป็น integer:**
- จากข้อมูลที่ตรวจสอบ: `sleep_quality` ยังเป็น `integer` อยู่
- ต้องลบ constraint เก่าก่อน แล้วค่อยเปลี่ยน type

## 🛠️ **วิธีแก้ไข:**

### **Step 1: ตรวจสอบ constraints ที่มีอยู่**
```sql
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.sleep_log'::regclass 
  AND conname LIKE '%sleep_quality%';
```

### **Step 2: ลบ constraints เก่าทั้งหมด**
```sql
-- ลบ constraint เก่า
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS sleep_quality_check;

-- ลบ constraint อื่นๆ ที่อาจมี
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS sleep_log_sleep_quality_check;
```

### **Step 3: เปลี่ยน column type**
```sql
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
```

### **Step 4: เพิ่ม constraint ใหม่**
```sql
ALTER TABLE public.sleep_log 
ADD CONSTRAINT sleep_quality_check 
CHECK (sleep_quality IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));
```

### **Step 5: ตรวจสอบผลลัพธ์**
```sql
-- ตรวจสอบ column type
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sleep_log' 
  AND column_name = 'sleep_quality';

-- ตรวจสอบ constraints ใหม่
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.sleep_log'::regclass 
  AND conname LIKE '%sleep_quality%';
```

## 📋 **ลำดับการรัน SQL:**

### **1. รันทีละส่วนใน Supabase SQL Editor:**

#### **ส่วนที่ 1: ตรวจสอบ constraints**
```sql
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.sleep_log'::regclass 
  AND conname LIKE '%sleep_quality%';
```

#### **ส่วนที่ 2: ลบ constraints เก่า**
```sql
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS sleep_quality_check;

ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS sleep_log_sleep_quality_check;
```

#### **ส่วนที่ 3: เปลี่ยน column type**
```sql
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
```

#### **ส่วนที่ 4: เพิ่ม constraint ใหม่**
```sql
ALTER TABLE public.sleep_log 
ADD CONSTRAINT sleep_quality_check 
CHECK (sleep_quality IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));
```

#### **ส่วนที่ 5: ตรวจสอบผลลัพธ์**
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sleep_log' 
  AND column_name = 'sleep_quality';
```

## ✅ **ผลลัพธ์ที่คาดหวัง:**

หลังจากรัน SQL script แล้ว:
- `sleep_quality` จะเป็น `varchar(20)` 
- มี constraint ใหม่ที่ตรวจสอบ enum values
- ไม่มี error ในการเปลี่ยน column type

## 🎯 **สรุป:**

**ปัญหาหลัก:** Constraint เก่ายังไม่ได้ลบ ทำให้ไม่สามารถเปลี่ยน column type ได้

**วิธีแก้:** ลบ constraint เก่าก่อน แล้วค่อยเปลี่ยน type และเพิ่ม constraint ใหม่

**ผลลัพธ์:** `sleep_quality` จะเป็น `varchar(20)` พร้อม enum constraint

---

**🚀 ใช้ SQL script ใน `fix-sleep-quality-only.sql` จะแก้ไขปัญหาได้!**
