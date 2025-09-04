# Sleep Log API - Postman Usage Guide

## 🚀 **วิธีใช้งาน Postman Collection ที่แก้ไขแล้ว**

### **Step 1: Import Collection**
1. เปิด Postman
2. คลิก **Import**
3. เลือกไฟล์ `Sleep-Log-API-Postman-Collection.json`
4. คลิก **Import**

### **Step 2: ตั้งค่า Variables**

#### **2.1 ตั้งค่า Collection Variables:**
```
1. คลิกขวาที่ Collection → Edit
2. ไปที่แท็บ Variables
3. ตั้งค่าดังนี้:

base_url: http://localhost:3000
user_email: your-actual-email@example.com
user_password: your-actual-password
jwt_token: (จะถูกตั้งค่าอัตโนมัติ)
sleep_log_id: (จะถูกตั้งค่าอัตโนมัติ)
```

#### **2.2 ตั้งค่าข้อมูลจริง:**
```
user_email: ใส่ email จริงที่ใช้ login
user_password: ใส่ password จริงที่ใช้ login
```

### **Step 3: ทดสอบ Authentication**

#### **3.1 รัน Login Request:**
```
1. ไปที่ Authentication → Login
2. คลิก Send
3. ตรวจสอบ Response:
   - Status: 200 OK
   - Body: มี access_token
4. ตรวจสอบ Console:
   - ควรเห็น: "JWT token saved: ..."
```

#### **3.2 ตรวจสอบ JWT Token:**
```
1. ไปที่ Collection → Variables
2. ตรวจสอบว่า jwt_token มีค่าหรือไม่
3. ถ้าไม่มีค่า ให้รัน Login อีกครั้ง
```

### **Step 4: ทดสอบ Sleep Log API**

#### **4.1 สร้าง Sleep Log:**
```
1. ไปที่ Sleep Log CRUD → Create Sleep Log
2. คลิก Send
3. ตรวจสอบ Response:
   - Status: 201 Created
   - Body: มี success: true และ data.id
4. ตรวจสอบ Console:
   - ควรเห็น: "Sleep log ID saved: ..."
```

#### **4.2 ตรวจสอบข้อมูลใน Supabase:**
```
1. เปิด Supabase Dashboard
2. ไปที่ Table Editor
3. เลือก table sleep_log
4. ตรวจสอบว่ามีข้อมูลใหม่หรือไม่
```

## 🔧 **การแก้ไขปัญหาเฉพาะ**

### **Problem 1: Login Failed (401)**
```
Error: 401 Unauthorized
```

**Solutions:**
1. ตรวจสอบ email และ password ถูกต้อง
2. ตรวจสอบ user มีอยู่ในระบบหรือไม่
3. ตรวจสอบ Supabase connection

### **Problem 2: JWT Token ไม่ถูกบันทึก**
```
Console ไม่แสดง "JWT token saved"
```

**Solutions:**
1. ตรวจสอบ Login response format
2. ตรวจสอบ Test script ใน Login request
3. รัน Login request อีกครั้ง

### **Problem 3: Sleep Log Creation Failed (401)**
```
Error: 401 Unauthorized เมื่อสร้าง sleep log
```

**Solutions:**
1. ตรวจสอบ JWT token ใน Authorization header
2. ตรวจสอบ Bearer token format
3. รัน Login request ใหม่

### **Problem 4: Sleep Log Creation Failed (400)**
```
Error: 400 Bad Request - Validation failed
```

**Solutions:**
1. ตรวจสอบ request body format
2. ตรวจสอบ required fields
3. ตรวจสอบ data types

### **Problem 5: ข้อมูลไม่เข้าฐานข้อมูล**
```
Success response แต่ไม่มีข้อมูลใน Supabase
```

**Solutions:**
1. ตรวจสอบ database permissions
2. ตรวจสอบ RLS policies
3. ตรวจสอบ user_id mapping

## 📋 **Request Examples**

### **Login Request:**
```json
POST {{base_url}}/auth/login
{
  "email": "{{user_email}}",
  "password": "{{user_password}}"
}
```

### **Create Sleep Log Request:**
```json
POST {{base_url}}/sleep-log
Authorization: Bearer {{jwt_token}}
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

### **Get All Sleep Logs Request:**
```json
GET {{base_url}}/sleep-log?page=1&limit=10
Authorization: Bearer {{jwt_token}}
```

## 🎯 **Expected Responses**

### **Login Success (200):**
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

### **Create Sleep Log Success (201):**
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

### **Get Sleep Logs Success (200):**
```json
{
  "success": true,
  "message": "ดึงรายการบันทึกการนอนสำเร็จ",
  "data": {
    "sleepLogs": [
      {
        "id": "uuid-here",
        "sleep_date": "2024-01-15",
        "bedtime": "22:30:00",
        "wake_time": "06:30:00",
        "sleep_duration_hours": 8,
        "sleep_quality": "good",
        "sleep_score": 85
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "stats": {
      "average_sleep_duration": 8,
      "average_sleep_score": 85
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔍 **Debugging Tips**

### **1. เปิด Postman Console:**
```
View → Show Postman Console
```

### **2. ตรวจสอบ Request Details:**
```
- Method: POST/GET/PUT/DELETE
- URL: {{base_url}}/sleep-log
- Headers: Content-Type, Authorization
- Body: JSON format
```

### **3. ตรวจสอบ Response Details:**
```
- Status Code: 200/201/400/401/500
- Response Body: JSON format
- Response Time: ควรน้อยกว่า 2 วินาที
```

### **4. ตรวจสอบ Collection Variables:**
```
- base_url: http://localhost:3000
- jwt_token: มีค่าหรือไม่
- sleep_log_id: มีค่าหรือไม่
```

## 📞 **การขอความช่วยเหลือ**

### **ข้อมูลที่ต้องเตรียม:**
1. **Error Message**: ข้อความ error ที่ได้รับ
2. **Request Details**: Method, URL, Headers, Body
3. **Response Details**: Status code, Response body
4. **Console Logs**: ข้อความใน Postman Console
5. **Collection Variables**: ค่าของ variables

### **การส่งข้อมูล:**
```
Error: [ข้อความ error]
Request: [รายละเอียด request]
Response: [รายละเอียด response]
Console: [ข้อความใน console]
Variables: [ค่าของ variables]
```

---

**🎯 สรุป: ใช้ Postman Collection ที่แก้ไขแล้วและตั้งค่า variables ให้ถูกต้อง!**
