# Sleep Log API - Postman Troubleshooting Guide

## 🔍 **ปัญหาที่พบบ่อยและวิธีแก้ไข**

### 1. **ข้อมูลไม่เข้าฐานข้อมูล Supabase**

#### **สาเหตุหลัก:**
- ❌ Authentication ไม่ถูกต้อง
- ❌ JWT Token ไม่ถูกต้อง
- ❌ Request body ไม่ตรงกับ DTO validation
- ❌ Database connection issues

#### **วิธีแก้ไข:**

### **Step 1: ตั้งค่า Authentication**

#### **1.1 ตั้งค่า Variables ใน Postman:**
```
Collection Variables:
- base_url: http://localhost:3000
- user_email: your-actual-email@example.com
- user_password: your-actual-password
- jwt_token: (จะถูกตั้งค่าอัตโนมัติหลัง login)
```

#### **1.2 ทดสอบ Login:**
```json
POST {{base_url}}/auth/login
{
  "email": "{{user_email}}",
  "password": "{{user_password}}"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "user": {
    "id": 1,
    "email": "your-email@example.com"
  }
}
```

### **Step 2: ตรวจสอบ JWT Token**

#### **2.1 ตรวจสอบ Token ใน Console:**
- เปิด Postman Console (View → Show Postman Console)
- ดู log ว่า JWT token ถูกบันทึกหรือไม่
- ควรเห็น: `JWT token saved: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### **2.2 ตรวจสอบ Collection Variables:**
- ไปที่ Collection → Variables
- ตรวจสอบว่า `jwt_token` มีค่าหรือไม่
- ถ้าไม่มีค่า ให้รัน Login request อีกครั้ง

### **Step 3: ตรวจสอบ Request Body**

#### **3.1 ใช้ Request Body ที่ถูกต้อง:**
```json
{
  "sleep_date": "2024-01-15",
  "bedtime": "22:30:00",
  "wake_time": "06:30:00",
  "sleep_duration_hours": 8,
  "sleep_quality": "good",
  "sleep_efficiency_percentage": 85,
  "time_to_fall_asleep_minutes": 15,
  "awakenings_count": 1,
  "notes": "นอนหลับได้ดี"
}
```

#### **3.2 ตรวจสอบ Required Fields:**
- `sleep_date`: ต้องเป็น format YYYY-MM-DD
- `bedtime`: ต้องเป็น format HH:MM:SS
- `wake_time`: ต้องเป็น format HH:MM:SS
- `sleep_duration_hours`: ต้องเป็น number
- `sleep_quality`: ต้องเป็น enum value (poor, fair, good, excellent)

### **Step 4: ตรวจสอบ API Response**

#### **4.1 Success Response (201):**
```json
{
  "success": true,
  "message": "สร้างบันทึกการนอนสำเร็จ",
  "data": {
    "id": "uuid-here",
    "sleep_date": "2024-01-15",
    "bedtime": "22:30:00",
    "wake_time": "06:30:00",
    "sleep_duration_hours": 8,
    "sleep_quality": "good",
    "sleep_score": 85,
    "is_optimal_duration": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **4.2 Error Response (400/401):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### **Step 5: ตรวจสอบ Database**

#### **5.1 ตรวจสอบ Supabase Connection:**
- เปิด Supabase Dashboard
- ไปที่ Table Editor
- ตรวจสอบ table `sleep_log`
- ดูว่ามีข้อมูลใหม่หรือไม่

#### **5.2 ตรวจสอบ Database Schema:**
```sql
-- ตรวจสอบ table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sleep_log';

-- ตรวจสอบข้อมูลล่าสุด
SELECT * FROM sleep_log 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🛠️ **การแก้ไขปัญหาเฉพาะ**

### **Problem 1: 401 Unauthorized**
```
Error: 401 Unauthorized
```

**Solutions:**
1. ตรวจสอบ JWT token ถูกต้องหรือไม่
2. ตรวจสอบ Bearer token ใน Authorization header
3. รัน Login request ใหม่
4. ตรวจสอบ token expiration

### **Problem 2: 400 Bad Request**
```
Error: 400 Bad Request - Validation failed
```

**Solutions:**
1. ตรวจสอบ request body format
2. ตรวจสอบ required fields
3. ตรวจสอบ data types (string, number, boolean)
4. ตรวจสอบ enum values

### **Problem 3: 500 Internal Server Error**
```
Error: 500 Internal Server Error
```

**Solutions:**
1. ตรวจสอบ server logs
2. ตรวจสอบ database connection
3. ตรวจสอบ Supabase configuration
4. ตรวจสอบ environment variables

### **Problem 4: Data ไม่เข้าฐานข้อมูล**
```
Success response แต่ไม่มีข้อมูลใน database
```

**Solutions:**
1. ตรวจสอบ database permissions
2. ตรวจสอบ RLS (Row Level Security) policies
3. ตรวจสอบ user_id mapping
4. ตรวจสอบ database triggers

## 📋 **Checklist การแก้ไขปัญหา**

### **Pre-Request Checklist:**
- [ ] Server กำลังทำงาน (http://localhost:3000)
- [ ] Supabase connection ทำงานได้
- [ ] User credentials ถูกต้อง
- [ ] Collection variables ตั้งค่าถูกต้อง

### **Request Checklist:**
- [ ] Authorization header มี Bearer token
- [ ] Content-Type เป็น application/json
- [ ] Request body format ถูกต้อง
- [ ] Required fields มีครบ

### **Post-Request Checklist:**
- [ ] Response status เป็น 201 (Created)
- [ ] Response body มี success: true
- [ ] ข้อมูลปรากฏใน Supabase dashboard
- [ ] JWT token ถูกบันทึกใน collection variables

## 🔧 **Debug Commands**

### **Test API Health:**
```bash
curl -X GET http://localhost:3000/sleep-log/test/health-check
```

### **Test Authentication:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

### **Test Sleep Log Creation:**
```bash
curl -X POST http://localhost:3000/sleep-log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sleep_date": "2024-01-15",
    "bedtime": "22:30:00",
    "wake_time": "06:30:00",
    "sleep_duration_hours": 8,
    "sleep_quality": "good",
    "sleep_efficiency_percentage": 85
  }'
```

## 📞 **การขอความช่วยเหลือ**

### **ข้อมูลที่ต้องเตรียม:**
1. **Error Message**: ข้อความ error ที่ได้รับ
2. **Request Details**: Method, URL, Headers, Body
3. **Response Details**: Status code, Response body
4. **Environment**: OS, Postman version, Node.js version
5. **Logs**: Server logs, Console logs

### **การส่งข้อมูล:**
```
Error: [ข้อความ error]
Request: [รายละเอียด request]
Response: [รายละเอียด response]
Environment: [ข้อมูล environment]
```

---

**🎯 สรุป: ปัญหาหลักคือ Authentication และ Request Body format ต้องแก้ไขให้ถูกต้อง!**
