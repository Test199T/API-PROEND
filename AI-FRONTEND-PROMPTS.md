# 🚀 AI Prompt สำหรับสร้าง Frontend - VITA WISE AI Health Tracking System

## 📝 **Main Prompt (คัดลอกไปใช้เลย)**

```
สวัสดีครับ ฉันต้องการให้คุณช่วยสร้างระบบ Frontend สำหรับแอพติดตามสุขภาพ "VITA WISE AI" โดยมีรายละเอียดดังนี้:

## 🎯 **ข้อมูลโครงการ**
- **ชื่อโครงการ**: VITA WISE AI - Health Tracking System
- **Frontend Framework**: React + TypeScript + Vite
- **UI Library**: Material-UI (MUI)
- **Backend API**: NestJS รันอยู่ที่ http://localhost:3000

## 🏗️ **โครงสร้างระบบที่ต้องการ**

### Authentication System
1. **หน้า Login** - เข้าสู่ระบบด้วย email/password
2. **หน้า Register** - สมัครสมาชิกใหม่
3. **JWT Token Management** - บันทึกใน localStorage
4. **Protected Routes** - ป้องกันหน้าที่ต้อง login

### Profile Management System  
1. **หน้า Dashboard** - แสดงสรุปข้อมูลสุขภาพ
2. **หน้า Profile Setup** - กรอกข้อมูลส่วนตัวครั้งแรก
3. **หน้า Profile Edit** - แก้ไขข้อมูลส่วนตัว
4. **หน้า Health Data** - จัดการข้อมูลสุขภาพ

## 📡 **API Endpoints ที่ต้องเชื่อมต่อ**

### Authentication APIs
```javascript
// Login
POST http://localhost:3000/auth/login
Body: { "email": "user@example.com", "password": "password123" }
Response: { "access_token": "JWT_TOKEN", "user": {...} }

// Register  
POST http://localhost:3000/auth/register
Body: { "email": "user@example.com", "password": "password123", "firstName": "ชื่อ", "lastName": "นามสกุล" }
```

### Profile APIs
```javascript
// Get Complete Profile
GET http://localhost:3000/users/profile/complete
Headers: { "Authorization": "Bearer JWT_TOKEN" }

// Update Profile
PUT http://localhost:3000/users/profile
Headers: { "Authorization": "Bearer JWT_TOKEN" }
Body: {
  "first_name": "ชื่อ",
  "height_cm": 175,
  "weight_kg": 70,
  "health_data": { "blood_pressure_systolic": 120 },
  "health_goals": { "main_goal": "ลดน้ำหนัก" }
}
```

## 📊 **ข้อมูลที่ระบบต้องจัดการ**

### ข้อมูลส่วนตัว
- ชื่อ-นามสกุล, อีเมล, วันเกิด, เพศ
- ส่วนสูง, น้ำหนัก, ระดับกิจกรรม

### ข้อมูลสุขภาพ (health_data - JSON)
- รอบเอว (waist_circumference_cm)
- ความดันโลหิต (blood_pressure_systolic/diastolic)  
- น้ำตาลในเลือด (blood_sugar_mg_dl)

### เป้าหมายสุขภาพ (health_goals - JSON)
- เป้าหมายหลัก (main_goal)
- ระยะเวลา (goal_duration)
- น้ำหนักเป้าหมาย (target_weight_kg)
- ชั่วโมงนอนเป้าหมาย (target_sleep_hours)

### เป้าหมายโภชนาการ (nutrition_goals - JSON)
- แคลอรี่ต่อวัน (target_calories_per_day)
- โปรตีนต่อวัน (target_protein_grams_per_day)
- ข้อจำกัดอาหาร (dietary_restrictions - array)

## 🎨 **UI/UX Requirements**

### Design System
- **Theme**: สีฟ้า-เขียว (สุขภาพ), Clean & Modern
- **Layout**: Responsive, Mobile-first
- **Components**: Cards, Charts, Progress bars
- **Language**: ภาษาไทยเป็นหลัก

### Page Structure
```
/login - หน้าเข้าสู่ระบบ
/register - หน้าสมัครสมาชิก  
/dashboard - หน้าแรกหลัง login (สรุปข้อมูล)
/profile/setup - หน้าตั้งค่าโปรไฟล์ครั้งแรก
/profile/edit - หน้าแก้ไขโปรไฟล์
/health/data - หน้าจัดการข้อมูลสุขภาพ
/health/goals - หน้าตั้งเป้าหมายสุขภาพ
```

## 🔧 **Technical Requirements**

### Setup & Dependencies
```bash
npm create vite@latest vita-wise-frontend --template react-ts
npm install axios react-router-dom @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material date-fns recharts react-hook-form
```

### File Structure
```
src/
├── components/
│   ├── auth/ (LoginForm, RegisterForm, ProtectedRoute)
│   ├── profile/ (ProfileForm, HealthDataForm)  
│   ├── shared/ (Header, Navigation, LoadingSpinner)
│   └── charts/ (HealthChart, ProgressChart)
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── ProfilePage.tsx
├── services/
│   ├── authService.ts
│   ├── profileService.ts
│   └── api.ts
├── hooks/
│   ├── useAuth.ts
│   └── useProfile.ts
└── types/
    └── api.types.ts
```

## 🧪 **Testing Data**

### Test User Credentials
```
Email: realuser1756678215@gmail.com
Password: mypassword123
```

### Working JWT Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE5LCJlbWFpbCI6InJlYWx1c2VyMTc1NjY3ODIxNUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6InJlYWx1c2VyMTc1NjY3ODIxNSIsImlhdCI6MTc1NjY3ODIxOCwiZXhwIjoxNzU2NzY0NjE4fQ.abNF70oNPx27YuQ8qkBPlk3zearn6VvROcwj-AF_nzo
```

## ✅ **Expected Features**

### Authentication Flow
1. ผู้ใช้เปิดแอพ → ไปหน้า Login
2. กรอก email/password → เรียก API login  
3. รับ JWT token → บันทึก localStorage
4. Redirect ไป Dashboard

### Profile Management Flow  
1. ผู้ใช้ใหม่ → ไปหน้า Profile Setup
2. กรอกข้อมูลส่วนตัว → เรียก API update
3. กรอกข้อมูลสุขภาพ → เรียก API update
4. ตั้งเป้าหมาย → เรียก API update
5. ไป Dashboard แสดงสรุป

### Dashboard Features
- แสดงข้อมูลส่วนตัวสรุป
- แสดงข้อมูลสุขภาพปัจจุบัน
- แสดงความคืบหน้าเป้าหมาย
- ลิงก์ไปหน้าต่างๆ

## 🚨 **Important Notes**

### Error Handling
- จัดการ CORS errors
- จัดการ 401 Unauthorized (token หมดอายุ)
- แสดง loading states  
- แสดง error messages เป็นภาษาไทย

### Data Validation
- Validate form inputs
- Handle API response errors
- Show success/error notifications

### Performance
- Code splitting
- Lazy loading pages
- Optimize API calls

## 🎯 **Deliverables ที่ต้องการ**

1. **Working React Application** - รันได้บน localhost:5173
2. **Complete Authentication System** - Login/Register/Logout
3. **Profile Management System** - CRUD ข้อมูลส่วนตัว
4. **API Integration** - เชื่อมต่อ Backend จริง
5. **Responsive UI** - ใช้งานได้บนมือถือ
6. **Error Handling** - จัดการ errors ได้ดี

กรุณาเริ่มจากการ setup โปรเจกต์และสร้าง authentication system ก่อน แล้วค่อยทำ profile management ทีละส่วนครับ

ถ้ามีคำถามหรือต้องการข้อมูลเพิ่มเติมสามารถถามได้ครับ!
```

---

## 🎯 **Additional Prompts สำหรับขั้นตอนต่างๆ**

### Prompt สำหรับ Authentication System
```
สร้าง Authentication System สำหรับ React + TypeScript ที่มี:
1. LoginForm component พร้อม validation
2. RegisterForm component  
3. useAuth hook สำหรับจัดการ state
4. authService สำหรับเรียก API
5. ProtectedRoute component
6. JWT token management ใน localStorage

API Endpoints:
- POST /auth/login
- POST /auth/register  
Backend: http://localhost:3000
```

### Prompt สำหรับ Profile System
```
สร้าง Profile Management System ที่มี:
1. ProfileForm component แบบ multi-step
2. HealthDataForm สำหรับข้อมูลสุขภาพ
3. HealthGoalsForm สำหรับตั้งเป้าหมาย
4. useProfile hook
5. profileService สำหรับเรียก API

รองรับข้อมูล JSON:
- health_data: { waist_circumference_cm, blood_pressure_systolic }
- health_goals: { main_goal, target_weight_kg }
- nutrition_goals: { target_calories_per_day }
```

### Prompt สำหรับ Dashboard
```
สร้าง Dashboard แสดงสรุปข้อมูลสุขภาพ:
1. Overview cards (BMI, น้ำหนัก, เป้าหมาย)
2. Charts แสดง progress (ใช้ recharts)
3. Quick actions buttons
4. Recent activities
5. Health metrics summary

ดึงข้อมูลจาก GET /users/profile/complete
```

### Prompt สำหรับ CORS/API Integration
```
แก้ปัญหา CORS และ API Integration:
1. Setup axios interceptors สำหรับ JWT token
2. Handle 401 errors (token หมดอายุ)
3. Error handling และ loading states
4. Type definitions สำหรับ API responses
5. Environment variables สำหรับ API URL
```
```
