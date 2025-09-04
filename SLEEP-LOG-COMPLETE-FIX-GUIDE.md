# Sleep Log API - Complete Fix Guide

## 🔍 **ปัญหาที่พบ:**

### **1. Database Schema Issues:**
- `sleep_quality` เป็น `integer` แต่ API ต้องการ `varchar` enum
- `bedtime` และ `wake_time` เป็น `time` แต่ API ต้องการ `varchar` (HH:MM format)
- ฟิลด์หลายตัวขาดหายไป
- มี view dependency ที่ขัดขวางการแก้ไข schema

### **2. API Issues:**
- Controller error handling ไม่ถูกต้อง
- Service validation ไม่ครบถ้วน
- Database connection issues

## 🛠️ **วิธีแก้ไขแบบครบถ้วน:**

### **Step 1: แก้ไข Database Schema**

**รัน SQL Script นี้ใน Supabase SQL Editor:**

```sql
-- 1. ลบ view ที่ใช้ sleep_quality column
DROP VIEW IF EXISTS public.daily_health_summary CASCADE;

-- 2. เปลี่ยน sleep_quality จาก integer เป็น varchar
ALTER TABLE public.sleep_log 
ALTER COLUMN sleep_quality TYPE varchar(20);

-- 3. เพิ่ม enum constraint สำหรับ sleep_quality
ALTER TABLE public.sleep_log 
DROP CONSTRAINT IF EXISTS sleep_quality_check;

ALTER TABLE public.sleep_log 
ADD CONSTRAINT sleep_quality_check 
CHECK (sleep_quality IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));

-- 4. เปลี่ยน bedtime และ wake_time จาก time เป็น varchar
ALTER TABLE public.sleep_log 
ALTER COLUMN bedtime TYPE varchar(5),
ALTER COLUMN wake_time TYPE varchar(5);

-- 5. เพิ่ม format validation สำหรับ time fields
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

-- 6. แก้ไข array types ให้เป็น text[]
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

-- 7. อัปเดตข้อมูลเดิม (ถ้ามี)
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

-- 8. เพิ่ม indexes
CREATE INDEX IF NOT EXISTS idx_sleep_log_user_id ON public.sleep_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_date ON public.sleep_log(sleep_date);
CREATE INDEX IF NOT EXISTS idx_sleep_log_sleep_quality ON public.sleep_log(sleep_quality);
CREATE INDEX IF NOT EXISTS idx_sleep_log_created_at ON public.sleep_log(created_at);

-- 9. สร้าง trigger สำหรับอัปเดต updated_at อัตโนมัติ
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

-- 10. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_log TO authenticated;
```

### **Step 2: แก้ไข API Code**

**แก้ไข Controller Error Handling:**

```typescript
// ใน src/controllers/sleep-log.controller.ts
async createSleepLog(
  @User('id') userId: number,
  @Body(ValidationPipe) createSleepLogDto: CreateSleepLogDto,
): Promise<ResponseDto<SleepLogResponseDto>> {
  try {
    const sleepLog = await this.sleepLogService.createSleepLog(
      createSleepLogDto,
      userId,
    );
    return ResponseDto.success(sleepLog, 'สร้างบันทึกการนอนสำเร็จ');
  } catch (error) {
    console.error('Create Sleep Log Error:', error);
    throw new BadRequestException(error.message || 'ข้อผิดพลาดภายในเซิร์ฟเวอร์');
  }
}
```

**แก้ไข Service Validation:**

```typescript
// ใน src/services/sleep-log.service.ts
async createSleepLog(sleepLogData: CreateSleepLogDto, userId: number): Promise<SleepLogResponseDto> {
  try {
    // Basic validation
    if (sleepLogData.sleep_duration_hours < 0 || sleepLogData.sleep_duration_hours > 24) {
      throw new BadRequestException('ข้อมูลไม่ถูกต้อง: sleep_duration_hours ต้องอยู่ระหว่าง 0-24');
    }

    if (!Object.values(SleepQuality).includes(sleepLogData.sleep_quality)) {
      throw new BadRequestException('ข้อมูลไม่ถูกต้อง: sleep_quality ไม่ถูกต้อง');
    }

    // Check if user exists
    const userExists = await this.supabaseService.getUserById(userId);
    if (!userExists) {
      throw new BadRequestException('ไม่พบผู้ใช้ที่ระบุ');
    }

    const sleepLog = await this.supabaseService.createSleepLog({
      ...sleepLogData,
      user_id: userId,
    });

    return this.mapToSleepLogResponseDto(sleepLog);
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    console.error('Sleep Log Service Error:', error);
    throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
  }
}
```

### **Step 3: ทดสอบ API**

**ใช้ไฟล์ทดสอบ:**

```bash
node test-sleep-log-debug.js
```

**หรือทดสอบด้วย curl:**

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ppansiun@outlook.com","password":"awdawdasd"}'

# Create Sleep Log
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

### **Step 4: ตรวจสอบผลลัพธ์**

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

### **Problem 1: View Dependency Error**
```
ERROR: cannot alter type of a column used by a view or rule
```

**Solution:** ลบ view ที่ใช้ column นั้นก่อน แล้วสร้างใหม่

### **Problem 2: Data Type Mismatch**
```
Error: invalid input syntax for type integer: "good"
```

**Solution:** เปลี่ยน data type และเพิ่ม enum constraint

### **Problem 3: Time Format Error**
```
Error: invalid input syntax for type time: "22:30"
```

**Solution:** เปลี่ยนจาก time เป็น varchar และเพิ่ม format validation

### **Problem 4: Array Type Error**
```
Error: column "sleep_aids_used" is of type ARRAY but expression is of type text[]
```

**Solution:** แก้ไข array type ให้เป็น text[]

## 📋 **Checklist การแก้ไข:**

- [ ] รัน SQL script ใน Supabase SQL Editor
- [ ] ตรวจสอบว่า columns ถูกแก้ไขแล้ว
- [ ] ตรวจสอบว่า constraints ถูกเพิ่มแล้ว
- [ ] ตรวจสอบว่า indexes ถูกสร้างแล้ว
- [ ] ตรวจสอบว่า permissions ถูกตั้งค่าแล้ว
- [ ] แก้ไข API code (ถ้าจำเป็น)
- [ ] ทดสอบ API ด้วยข้อมูลจริง
- [ ] ตรวจสอบว่าข้อมูลเข้าฐานข้อมูลแล้ว

## 🎯 **สรุป:**

**ปัญหาหลัก:** Database schema ไม่ตรงกับ API DTO และมี view dependency

**วิธีแก้:** 
1. ลบ view ที่ขัดขวาง
2. แก้ไข database schema
3. สร้าง view ใหม่
4. แก้ไข API code (ถ้าจำเป็น)

**ผลลัพธ์:** API จะทำงานได้ปกติและข้อมูลจะเข้าฐานข้อมูล Supabase

---

**🚀 หลังจากรัน SQL script และแก้ไข API code แล้ว API จะทำงานได้ปกติ!**
