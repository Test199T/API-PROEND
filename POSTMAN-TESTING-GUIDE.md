# 🚀 คู่มือการทดสอบใน Postman - VITA WISE AI Profile System

## 📥 **ขั้นตอนที่ 1: Import Collection**

### 1.1 เปิด Postman
- ดาวน์โหลดและติดตั้ง Postman จาก https://www.postman.com/downloads/
- เปิดแอป Postman

### 1.2 Import Collection
1. คลิก **Import** (ปุ่มสีน้ำเงินด้านบนซ้าย)
2. เลือก **Upload Files**
3. เลือกไฟล์ `VITA-WISE-AI-Postman-Collection.json`
4. คลิก **Import**

## 🔧 **ขั้นตอนที่ 2: ตั้งค่า Environment**

### 2.1 สร้าง Environment ใหม่
1. คลิก **Environments** (เมนูซ้าย)
2. คลิก **Create Environment**
3. ตั้งชื่อ: `VITA WISE AI - Local`

### 2.2 เพิ่มตัวแปร Environment
| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:3000` | `http://localhost:3000` |
| `access_token` | (ว่างไว้) | (ว่างไว้) |
| `user_email` | `postman_test@gmail.com` | `postman_test@gmail.com` |
| `user_password` | `password123` | `password123` |

### 2.3 เลือกใช้ Environment
- คลิกดรอปดาวน์ด้านขวาบน
- เลือก `VITA WISE AI - Local`

## 🎯 **ขั้นตอนที่ 3: ทดสอบ API**

### 3.1 ทดสอบตามลำดับ

#### **1. Authentication → Register User**
- เปิด Collection → Authentication → Register User
- คลิก **Send**
- ✅ ควรได้ Response 200/201 พร้อมข้อมูล user

#### **2. Authentication → Login User**  
- เปิด Authentication → Login User
- คลิก **Send**
- ✅ ควรได้ access_token
- 🔑 Token จะถูกบันทึกใน Environment อัตโนมัติ

#### **3. Profile Management → Get Complete Profile**
- เปิด Profile Management → Get Complete Profile  
- คลิก **Send**
- ✅ ควรเห็นข้อมูล Profile พื้นฐาน

#### **4. Profile Management → Update Basic Profile**
- เปิด Profile Management → Update Basic Profile
- คลิก **Send** 
- ✅ ควรอัพเดทชื่อเป็น "Postman Updated"

#### **5. Profile Management → Update Health Data**
- เปิด Profile Management → Update Health Data
- คลิก **Send**
- ✅ ควรบันทึกข้อมูลสุขภาพ (รอบเอว, ความดัน)

#### **6. Profile Management → Update Complete Profile**
- เปิด Profile Management → Update Complete Profile
- คลิก **Send** 
- ✅ ควรบันทึกข้อมูลครบถ้วนทุกส่วน

## 📊 **ขั้นตอนที่ 4: ตรวจสอบผลลัพธ์**

### 4.1 ดู Response ที่คาดหวัง
```json
{
  "success": true,
  "message": "ดึงโปรไฟล์สมบูรณ์สำเร็จ",
  "data": {
    "id": 17,
    "username": "postman_test",
    "email": "postman_test@gmail.com",
    "first_name": "Postman Complete",
    "last_name": "Test User",
    "height_cm": 175,
    "weight_kg": 70,
    "health_data": {
      "waist_circumference_cm": 80,
      "blood_pressure_systolic": 120
    },
    "health_goals": {
      "main_goal": "ลดน้ำหนัก",
      "target_weight_kg": 65
    },
    "healthGoals": [],
    "recentFoodLogs": [],
    "recentExerciseLogs": []
  }
}
```

### 4.2 ตรวจสอบ Tests
- แต่ละ Request มี **Tests** tab
- เปิดดูได้ว่า Test ผ่านหรือไม่
- ✅ สีเขียว = ผ่าน
- ❌ สีแดง = ไม่ผ่าน

## 🔧 **Tips การใช้งาน**

### การ Debug
1. **Console Tab** - ดู Network logs
2. **Tests Tab** - ดูผลการทดสอบ
3. **Response Body** - ดูข้อมูลที่ส่งกลับ

### การแก้ปัญหา
| ปัญหา | วิธีแก้ |
|-------|---------|
| 401 Unauthorized | Login ใหม่เพื่อรับ Token ใหม่ |
| 400 Bad Request | ตรวจสอบ JSON format ใน Body |
| 500 Internal Error | ตรวจสอบ Server ใน VS Code |
| Connection Error | ตรวจสอบ Server รันอยู่ที่ localhost:3000 |

### การแก้ไขข้อมูล
- แก้ไข **Body** tab ในแต่ละ Request
- แก้ไข **Variables** ใน Environment
- เปลี่ยน **Headers** ถ้าจำเป็น

## 🎉 **เสร็จแล้ว!**

ตอนนี้คุณสามารถ:
- ✅ ทดสอบ Authentication System
- ✅ ทดสอบ Profile Management  
- ✅ ทดสอบ Health Data Storage
- ✅ ตรวจสอบ JSON Response
- ✅ แก้ไขและทดสอบข้อมูลใหม่

**Happy Testing! 🚀**
