# 🔥 วิธีการทดสอบระบบ Profile ด้วยตัวเอง - VITA WISE AI

## ⚡ วิธีที่ 1: ใช้ VS Code REST Client (แนะนำ!)

### 📥 **ติดตั้ง Extension**
1. เปิด VS Code
2. ไปที่ Extensions (Ctrl+Shift+X)
3. ค้นหา "REST Client"
4. ติดตั้ง Extension โดย Huachao Mao

### 🚀 **การทดสอบ**
1. เปิดไฟล์ `test-profile-api.http` 
2. คลิกที่ "Send Request" เหนือแต่ละ request
3. ดูผลลัพธ์ใน panel ด้านขวา

---

## 💻 วิธีที่ 2: ใช้ Terminal/Command Line

### 1️⃣ **สร้างผู้ใช้ใหม่**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mytest@gmail.com",
    "password": "password123",
    "firstName": "ทดสอบ",
    "lastName": "ระบบ"
  }'
```

### 2️⃣ **เข้าสู่ระบบเพื่อรับ Token**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mytest@gmail.com",
    "password": "password123"
  }'
```

**คัดลอก access_token จากผลลัพธ์**

### 3️⃣ **ดูข้อมูล Profile ครบถ้วน**
```bash
curl -X GET http://localhost:3000/users/profile/complete \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4️⃣ **อัพเดท Profile**
```bash
curl -X PUT http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "ชื่อใหม่",
    "height_cm": 175,
    "weight_kg": 70,
    "health_data": {
      "waist_circumference_cm": 80,
      "blood_pressure_systolic": 120,
      "blood_pressure_diastolic": 80
    }
  }'
```

---

## 🌐 วิธีที่ 3: ใช้ Postman

### **Import Collection**
1. เปิด Postman
2. คลิก Import
3. Copy-paste content จาก `test-profile-api.http`
4. แก้ไข Authorization Header ด้วย Token ที่ได้จาก Login

### **Environment Variables**
สร้าง Environment ใน Postman:
- `baseUrl`: http://localhost:3000
- `token`: [Token จาก Login API]

---

## ✅ **สิ่งที่ควรเห็นเมื่อทดสอบสำเร็จ**

### 📊 **Response ตัวอย่าง - Complete Profile**
```json
{
  "success": true,
  "message": "ดึงโปรไฟล์สมบูรณ์สำเร็จ",
  "data": {
    "id": 15,
    "username": "testuser",
    "email": "test@gmail.com",
    "first_name": "ทดสอบ",
    "last_name": "ระบบ",
    "height_cm": 175,
    "weight_kg": 70,
    "health_data": {
      "waist_circumference_cm": 80,
      "blood_pressure_systolic": 120
    },
    "healthGoals": [],
    "recentFoodLogs": [],
    "recentExerciseLogs": [],
    "recentSleepLogs": [],
    "recentWaterLogs": [],
    "healthMetrics": []
  }
}
```

### 🛡️ **การจัดการ Error**
- **401 Unauthorized**: Token หมดอายุ → Login ใหม่
- **400 Bad Request**: ข้อมูลไม่ถูกต้อง → ตรวจสอบ JSON format
- **500 Internal Server Error**: ปัญหาเซิร์ฟเวอร์ → ตรวจสอบ Database connection

---

## 🎯 **Tips การทดสอบ**

1. **เริ่มต้นด้วย REST Client** - ง่ายและรวดเร็วที่สุด
2. **ใช้ Terminal** - เมื่อต้องการ script อัตโนมัติ  
3. **ใช้ Postman** - เมื่อต้องการ UI ที่สวยงาม
4. **เช็ค Server Log** - ถ้ามี error ให้ดูใน VS Code Terminal ที่รัน `npm run start:dev`
5. **Token มีอายุ 24 ชั่วโมง** - หมดอายุแล้วต้อง Login ใหม่
