# Type Casting Error Fix Guide

## 🚨 **ปัญหาที่พบ:**

```
ERROR: 42883: operator does not exist: character varying >= integer
HINT: No operator matches the given name and argument types. You might need to add explicit type casts.
```

## 🔍 **สาเหตุของปัญหา:**

### **1. Type Mismatch Error:**
- PostgreSQL ไม่สามารถเปรียบเทียบ `character varying` กับ `integer` ได้โดยตรง
- ต้องใช้ explicit type casting (`::integer`) ก่อนเปรียบเทียบ

### **2. Column Type Change:**
- `sleep_quality` ถูกเปลี่ยนจาก `integer` เป็น `varchar(20)`
- แต่ UPDATE statement ยังพยายามเปรียบเทียบกับ integer

## 🛠️ **วิธีแก้ไข:**

### **Solution 1: ใช้ Explicit Type Casting**

**❌ Code ที่ Error:**
```sql
UPDATE public.sleep_log 
SET 
  sleep_quality = CASE 
    WHEN sleep_quality::integer <= 2 THEN 'very_poor'
    -- Error: character varying >= integer
```

**✅ Code ที่แก้ไขแล้ว:**
```sql
UPDATE public.sleep_log 
SET 
  sleep_quality = CASE 
    WHEN sleep_quality::text ~ '^[0-9]+$' AND (sleep_quality::text)::integer <= 2 THEN 'very_poor'
    WHEN sleep_quality::text ~ '^[0-9]+$' AND (sleep_quality::text)::integer <= 4 THEN 'poor'
    WHEN sleep_quality::text ~ '^[0-9]+$' AND (sleep_quality::text)::integer <= 6 THEN 'fair'
    WHEN sleep_quality::text ~ '^[0-9]+$' AND (sleep_quality::text)::integer <= 8 THEN 'good'
    WHEN sleep_quality::text ~ '^[0-9]+$' THEN 'excellent'
    ELSE sleep_quality -- ถ้าไม่ใช่ตัวเลข ให้คงค่าเดิม
  END
```

### **Solution 2: ตรวจสอบ Data Type ก่อนเปรียบเทียบ**

**✅ Safe Type Casting:**
```sql
-- ตรวจสอบว่าเป็นตัวเลขก่อน แล้วค่อย cast
WHEN sleep_quality::text ~ '^[0-9]+$' AND (sleep_quality::text)::integer <= 2 THEN 'very_poor'
```

## 📋 **ขั้นตอนการแก้ไขแบบทีละส่วน:**

### **Step 1: ตรวจสอบข้อมูลเดิม**
```sql
-- ตรวจสอบข้อมูลเดิมใน sleep_log table
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN sleep_quality IS NOT NULL THEN 1 END) as sleep_quality_count
FROM public.sleep_log;

-- ตรวจสอบ data types ปัจจุบัน
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sleep_log' 
  AND column_name IN ('sleep_quality', 'bedtime', 'wake_time')
ORDER BY ordinal_position;
```

### **Step 2: เปลี่ยน Column Type**
```sql
-- ลบ constraint เก่า
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS sleep_quality_check;

-- เปลี่ยน sleep_quality จาก integer เป็น varchar
ALTER TABLE public.sleep_log 
ALTER COLUMN sleep_quality TYPE varchar(20);

-- เพิ่ม enum constraint
ALTER TABLE public.sleep_log 
ADD CONSTRAINT sleep_quality_check 
CHECK (sleep_quality IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));
```

### **Step 3: อัปเดตข้อมูลด้วย Safe Type Casting**
```sql
-- อัปเดตข้อมูลเดิมด้วย explicit type casting
UPDATE public.sleep_log 
SET 
  sleep_quality = CASE 
    WHEN sleep_quality::text ~ '^[0-9]+$' AND (sleep_quality::text)::integer <= 2 THEN 'very_poor'
    WHEN sleep_quality::text ~ '^[0-9]+$' AND (sleep_quality::text)::integer <= 4 THEN 'poor'
    WHEN sleep_quality::text ~ '^[0-9]+$' AND (sleep_quality::text)::integer <= 6 THEN 'fair'
    WHEN sleep_quality::text ~ '^[0-9]+$' AND (sleep_quality::text)::integer <= 8 THEN 'good'
    WHEN sleep_quality::text ~ '^[0-9]+$' THEN 'excellent'
    ELSE sleep_quality
  END,
  bedtime = CASE 
    WHEN bedtime::text ~ '^[0-9]{2}:[0-9]{2}:[0-9]{2}$' THEN TO_CHAR(bedtime::time, 'HH24:MI')
    ELSE bedtime
  END,
  wake_time = CASE 
    WHEN wake_time::text ~ '^[0-9]{2}:[0-9]{2}:[0-9]{2}$' THEN TO_CHAR(wake_time::time, 'HH24:MI')
    ELSE wake_time
  END,
  updated_at = CURRENT_TIMESTAMP
WHERE sleep_quality::text ~ '^[0-9]+$' OR bedtime::text ~ '^[0-9]{2}:[0-9]{2}:[0-9]{2}$';
```

### **Step 4: ตรวจสอบผลลัพธ์**
```sql
-- ตรวจสอบข้อมูลหลังแก้ไข
SELECT 
  sleep_quality,
  bedtime,
  wake_time,
  COUNT(*) as count
FROM public.sleep_log 
GROUP BY sleep_quality, bedtime, wake_time
ORDER BY count DESC;
```

## 🔧 **Best Practices สำหรับ Type Casting:**

### **1. ตรวจสอบ Data Type ก่อน Cast:**
```sql
-- ✅ Good: ตรวจสอบก่อน cast
WHEN column::text ~ '^[0-9]+$' AND (column::text)::integer <= 10 THEN 'value'

-- ❌ Bad: cast โดยไม่ตรวจสอบ
WHEN column::integer <= 10 THEN 'value'
```

### **2. ใช้ Pattern Matching:**
```sql
-- ✅ Good: ใช้ regex pattern
WHEN sleep_quality::text ~ '^[0-9]+$' THEN ...

-- ❌ Bad: ไม่ตรวจสอบ format
WHEN sleep_quality::integer THEN ...
```

### **3. Handle NULL Values:**
```sql
-- ✅ Good: handle NULL
CASE 
  WHEN column IS NULL THEN 'default'
  WHEN column::text ~ '^[0-9]+$' THEN (column::text)::integer
  ELSE column
END
```

## 🎯 **สรุป:**

**ปัญหาหลัก:** Type casting error ระหว่าง `character varying` และ `integer`

**วิธีแก้:** ใช้ explicit type casting และตรวจสอบ data type ก่อนเปรียบเทียบ

**ผลลัพธ์:** SQL script จะรันได้สำเร็จและข้อมูลจะถูกแปลงเป็น format ใหม่

---

**🚀 หลังจากแก้ไข Type Casting Error แล้ว SQL script จะทำงานได้ปกติ!**
