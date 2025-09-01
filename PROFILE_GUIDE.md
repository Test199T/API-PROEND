# 📋 คู่มือการใช้งานระบบ Profile ครบถ้วน - VITA WISE AI

## 🚀 ภาพรวมระบบ

ระบบ Profile ของ VITA WISE AI ได้รับการพัฒนาให้ครบถ้วนแล้ว รองรับการจัดเก็บและจัดการข้อมูลสุขภาพแบบละเอียด เหมาะสำหรับแอปพลิเคชันติดตามสุขภาพและการให้คำปรึกษาด้วย AI

## 📊 โครงสร้างข้อมูล Profile

### 1. ข้อมูลส่วนตัวพื้นฐาน (Basic Personal Info)
```json
{
  "first_name": "ชื่อ",
  "last_name": "นามสกุล", 
  "email": "อีเมล",
  "date_of_birth": "วันเกิด (YYYY-MM-DD)",
  "gender": "เพศ (male/female/other)",
  "height_cm": "ส่วนสูง (เซนติเมตร)",
  "weight_kg": "น้ำหนัก (กิโลกรัม)",
  "activity_level": "ระดับกิจกรรม"
}
```

### 2. ข้อมูลสุขภาพเพิ่มเติม (Health Data)
```json
{
  "health_data": {
    "waist_circumference_cm": "รอบเอว (เซนติเมตร)",
    "blood_pressure_systolic": "ความดันโลหิตตัวบน",
    "blood_pressure_diastolic": "ความดันโลหิตตัวล่าง", 
    "blood_sugar_mg_dl": "น้ำตาลในเลือด (mg/dL)"
  }
}
```

### 3. เป้าหมายสุขภาพ (Health Goals)
```json
{
  "health_goals": {
    "main_goal": "เป้าหมายหลัก",
    "goal_duration": "ระยะเวลาเป้าหมาย",
    "motivation": "แรงจูงใจ",
    "target_weight_kg": "เป้าหมายน้ำหนัก",
    "target_sleep_hours": "เป้าหมายการนอน (ชั่วโมง)",
    "target_exercise_minutes_per_day": "เป้าหมายออกกำลังกาย (นาที/วัน)"
  }
}
```

### 4. เป้าหมายโภชนาการ (Nutrition Goals)
```json
{
  "nutrition_goals": {
    "target_calories_per_day": "เป้าหมายแคลอรี่ (kcal/วัน)",
    "target_protein_grams_per_day": "เป้าหมายโปรตีน (กรัม/วัน)",
    "target_carbs_grams_per_day": "เป้าหมายคาร์โบไฮเดรต (กรัม/วัน)",
    "target_fat_grams_per_day": "เป้าหมายไขมัน (กรัม/วัน)",
    "target_fiber_grams_per_day": "เป้าหมายไฟเบอร์ (กรัม/วัน)",
    "target_sodium_mg_per_day": "เป้าหมายโซเดียม (มิลลิกรัม/วัน)",
    "dietary_restrictions": ["ข้อจำกัดอาหาร (array)"]
  }
}
```

### 5. พฤติกรรมประจำวัน (Daily Behavior)
```json
{
  "daily_behavior": {
    "exercise_frequency_per_week": "ความถี่การออกกำลังกาย (ครั้ง/สัปดาห์)",
    "average_sleep_hours_per_day": "ชั่วโมงการนอนต่อวัน",
    "meals_per_day": "มื้ออาหารต่อวัน",
    "alcohol_consumption": "การดื่มแอลกอฮอล์ (never/occasionally/regularly/frequently)",
    "smoking_status": "สถานะการสูบบุหรี่ (never/former/current)",
    "daily_water_goal_ml": "เป้าหมายน้ำดื่มต่อวัน (มิลลิลิตร)"
  }
}
```

### 6. ประวัติสุขภาพ (Medical History)
```json
{
  "medical_history": {
    "chronic_conditions": ["โรคประจำตัว (array)"],
    "surgery_history": ["ประวัติการผ่าตัด (array)"],
    "allergies": ["ประวัติการแพ้ (array)"],
    "medications": ["ยาที่กำลังใช้ (array)"],
    "family_medical_history": "ประวัติครอบครัว (string)"
  }
}
```

## 🔗 API Endpoints

### 📝 สร้างโปรไฟล์ (Register)
```http
POST /users/register
Content-Type: application/json
Authorization: ไม่ต้องใช้

Body: ข้อมูลผู้ใช้ครบถ้วนตามโครงสร้างด้านบน
```

### 👤 ดูโปรไฟล์พื้นฐาน
```http
GET /users/profile
Authorization: Bearer {jwt_token}
```

### 👤 ดูโปรไฟล์แบบครบถ้วน
```http
GET /users/profile/complete  
Authorization: Bearer {jwt_token}
```

### ✏️ อัปเดตโปรไฟล์
```http
PUT /users/profile
Authorization: Bearer {jwt_token}
Content-Type: application/json

Body: ข้อมูลที่ต้องการอัปเดต (สามารถอัปเดตบางส่วนได้)
```

### 📊 ดูแดชบอร์ด
```http
GET /users/dashboard
Authorization: Bearer {jwt_token}
```

### ✅ ตรวจสอบชื่อผู้ใช้
```http
GET /users/check-username/{username}
Authorization: ไม่ต้องใช้
```

### ✅ ตรวจสอบอีเมล
```http
GET /users/check-email/{email}
Authorization: ไม่ต้องใช้
```

## 💻 การใช้งานผ่าน Frontend

### 1. สร้างฟอร์มลงทะเบียน
```javascript
const registerData = {
  // ข้อมูลพื้นฐาน
  username: "testuser",
  email: "test@example.com", 
  password: "password123",
  first_name: "ทดสอบ",
  last_name: "ระบบ",
  date_of_birth: "1990-01-01",
  gender: "male",
  height_cm: 175,
  weight_kg: 70,
  activity_level: "moderately_active",
  
  // ข้อมูลสุขภาพ
  health_data: {
    waist_circumference_cm: 80,
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    blood_sugar_mg_dl: 90
  },
  
  // เป้าหมายสุขภาพ
  health_goals: {
    main_goal: "ลดน้ำหนัก",
    goal_duration: "3 เดือน",
    motivation: "เพื่อสุขภาพที่ดีขึ้น",
    target_weight_kg: 65,
    target_sleep_hours: 8,
    target_exercise_minutes_per_day: 60
  },
  
  // เป้าหมายโภชนาการ  
  nutrition_goals: {
    target_calories_per_day: 1800,
    target_protein_grams_per_day: 100,
    target_carbs_grams_per_day: 200,
    target_fat_grams_per_day: 60,
    target_fiber_grams_per_day: 25,
    target_sodium_mg_per_day: 2300,
    dietary_restrictions: ["ไม่กินหมู", "ลดน้ำตาล"]
  },
  
  // พฤติกรรมประจำวัน
  daily_behavior: {
    exercise_frequency_per_week: 5,
    average_sleep_hours_per_day: 7,
    meals_per_day: 3,
    alcohol_consumption: "occasionally",
    smoking_status: "never", 
    daily_water_goal_ml: 2500
  },
  
  // ประวัติสุขภาพ
  medical_history: {
    chronic_conditions: [],
    surgery_history: [],
    allergies: ["ไข่", "ถั่วลิสง"],
    medications: [],
    family_medical_history: "พ่อแม่เป็นเบาหวาน"
  }
};

// ส่งข้อมูลไปยัง API
fetch('/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(registerData)
});
```

### 2. ดึงข้อมูลโปรไฟล์
```javascript
const getProfile = async () => {
  const response = await fetch('/users/profile/complete', {
    headers: {
      'Authorization': `Bearer ${jwt_token}`
    }
  });
  
  const result = await response.json();
  if (result.success) {
    const profile = result.data;
    
    // แสดงข้อมูลพื้นฐาน
    console.log('ชื่อ:', profile.first_name, profile.last_name);
    console.log('อายุ:', profile.age);
    console.log('BMI:', profile.bmi);
    
    // แสดงข้อมูลสุขภาพ
    if (profile.health_data) {
      console.log('รอบเอว:', profile.health_data.waist_circumference_cm, 'ซม.');
      console.log('ความดันโลหิต:', 
        profile.health_data.blood_pressure_systolic, '/', 
        profile.health_data.blood_pressure_diastolic);
    }
    
    // แสดงเป้าหมาย
    if (profile.health_goals) {
      console.log('เป้าหมายหลัก:', profile.health_goals.main_goal);
      console.log('เป้าหมายน้ำหนัก:', profile.health_goals.target_weight_kg, 'กก.');
    }
  }
};
```

### 3. อัปเดตโปรไฟล์
```javascript
const updateProfile = async (updateData) => {
  const response = await fetch('/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt_token}`
    },
    body: JSON.stringify(updateData)
  });
  
  const result = await response.json();
  return result;
};

// ตัวอย่างการอัปเดตน้ำหนักและความดันโลหิต
updateProfile({
  weight_kg: 68,
  health_data: {
    blood_pressure_systolic: 118,
    blood_pressure_diastolic: 78
  }
});
```

## 🗄️ การตั้งค่าฐานข้อมูล

### 1. รัน SQL Script
```sql
-- รันไฟล์ database-update-profile.sql ใน Supabase SQL Editor
```

### 2. ตรวจสอบการเปลี่ยนแปลง
```sql
-- ตรวจสอบ columns ใหม่
\d users

-- ทดสอบ view
SELECT * FROM user_complete_profile LIMIT 1;
```

## 🧪 การทดสอบด้วย Postman

### 1. Import Collection
- ใช้ไฟล์ `test-profile-api.http`
- แทนที่ `YOUR_JWT_TOKEN_HERE` ด้วย token จริง

### 2. ลำดับการทดสอบ
1. สร้างผู้ใช้ใหม่ (Register)
2. ดูโปรไฟล์พื้นฐาน  
3. ดูโปรไฟล์แบบครบถ้วน
4. อัปเดตข้อมูลต่างๆ
5. ทดสอบ validation errors

## ⚠️ ข้อควรระวัง

### 1. Validation Rules
- **height_cm**: 50-300 ซม.
- **weight_kg**: 20-500 กก.
- **age**: 1-120 ปี
- **target_calories_per_day**: 800-5000 kcal
- **blood_pressure_systolic**: 70-200 mmHg
- **blood_pressure_diastolic**: 40-130 mmHg

### 2. Optional Fields
- ทุกข้อมูลเพิ่มเติม (นอกจากข้อมูลพื้นฐาน) เป็น optional
- สามารถส่งเป็น null หรือไม่ส่งมาได้
- ระบบจะจัดการค่าเริ่มต้นให้

### 3. Data Types
- **Arrays**: ส่งเป็น array ว่าง [] ถ้าไม่มีข้อมูล
- **Strings**: ส่งเป็น empty string "" หรือไม่ส่งมา
- **Numbers**: ส่งเป็น null หรือไม่ส่งมา

## 🎯 ฟีเจอร์พิเศษ

### 1. Auto-calculated Fields
- **BMI**: คำนวณอัตโนมัติจาก height_cm และ weight_kg
- **Age**: คำนวณอัตโนมัติจาก date_of_birth
- **BMI Status**: แสดงสถานะ BMI (ปกติ/เกินเกณฑ์/อ้วน)
- **Blood Pressure Status**: แสดงสถานะความดันโลหิต
- **Blood Sugar Status**: แสดงสถานะน้ำตาลในเลือด

### 2. Smart Defaults
- กรณีไม่ระบุข้อจำกัดอาหาร: แสดง array ว่าง
- กรณีไม่ระบุโรคประจำตัว: แสดง array ว่าง
- กรณีไม่ระบุเป้าหมายโภชนาการ: ใช้ค่าเริ่มต้นตามเพศและอายุ

### 3. Flexible Updates
- สามารถอัปเดตทีละส่วนได้ (partial updates)
- ไม่ต้องส่งข้อมูลทั้งหมดในการอัปเดต
- รองรับการอัปเดต nested objects

## 📱 Integration กับ Frontend

### React Example
```jsx
import { useState, useEffect } from 'react';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/users/profile/complete', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>โปรไฟล์ของ {profile?.fullName}</h1>
      
      {/* ข้อมูลพื้นฐาน */}
      <section>
        <h2>ข้อมูลส่วนตัว</h2>
        <p>อีเมล: {profile?.email}</p>
        <p>อายุ: {profile?.age} ปี</p>
        <p>เพศ: {profile?.gender}</p>
        <p>ส่วนสูง: {profile?.height_cm} ซม.</p>
        <p>น้ำหนัก: {profile?.weight_kg} กก.</p>
        <p>BMI: {profile?.bmi} ({profile?.bmiStatus})</p>
      </section>

      {/* ข้อมูลสุขภาพ */}
      {profile?.health_data && (
        <section>
          <h2>ข้อมูลสุขภาพ</h2>
          <p>รอบเอว: {profile.health_data.waist_circumference_cm} ซม.</p>
          <p>ความดันโลหิต: {profile.health_data.blood_pressure_systolic}/{profile.health_data.blood_pressure_diastolic} mmHg</p>
          <p>น้ำตาลในเลือด: {profile.health_data.blood_sugar_mg_dl} mg/dL</p>
        </section>
      )}

      {/* เป้าหมายสุขภาพ */}
      {profile?.health_goals && (
        <section>
          <h2>เป้าหมายสุขภาพ</h2>
          <p>เป้าหมายหลัก: {profile.health_goals.main_goal}</p>
          <p>ระยะเวลา: {profile.health_goals.goal_duration}</p>
          <p>แรงจูงใจ: {profile.health_goals.motivation}</p>
          <p>เป้าหมายน้ำหนัก: {profile.health_goals.target_weight_kg} กก.</p>
          <p>เป้าหมายการนอน: {profile.health_goals.target_sleep_hours} ชั่วโมง/วัน</p>
          <p>เป้าหมายออกกำลังกาย: {profile.health_goals.target_exercise_minutes_per_day} นาที/วัน</p>
        </section>
      )}
    </div>
  );
};
```

## 🔒 Security Notes

1. **Authentication**: ทุก endpoint (ยกเว้น register) ต้องใช้ JWT token
2. **Data Validation**: มีการตรวจสอบข้อมูลก่อนบันทึก
3. **Privacy**: ข้อมูลสุขภาพมีการป้องกันตามมาตรฐาน
4. **CORS**: ตั้งค่า CORS ให้เหมาะสมกับ domain ของ frontend

## 🎉 สรุป

ระบบ Profile ของ VITA WISE AI พร้อมใช้งานแล้วด้วยฟีเจอร์:

✅ **ข้อมูลครบถ้วน**: รองรับข้อมูลสุขภาพ 6 หมวดหลัก  
✅ **API สมบูรณ์**: มี endpoints ครบถ้วนสำหรับ CRUD operations  
✅ **Validation**: มีการตรวจสอบข้อมูลที่เข้มงวด  
✅ **Flexibility**: รองรับการอัปเดตแบบ partial  
✅ **Auto-calculations**: คำนวณค่าต่างๆ อัตโนมัติ  
✅ **Testing Ready**: พร้อมไฟล์ทดสอบ Postman  
✅ **Frontend Integration**: พร้อม example code สำหรับ frontend  

พร้อมสำหรับการพัฒนา frontend และการใช้งานจริง! 🚀
