# Exercise Log API - README

## การติดตั้งและรัน

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รัน Development Server
```bash
npm run start:dev
```

API จะรันที่: `http://localhost:3000`

## การใช้งาน

### Base URL
```
http://localhost:3000
```

### Endpoints หลัก
- `POST /exercise-log` - สร้าง exercise log
- `GET /exercise-log` - ดึงข้อมูล exercise logs (รองรับ pagination และ filters)
- `GET /exercise-log/:id` - ดึงข้อมูล exercise log ตาม ID
- `PUT /exercise-log/:id` - อัปเดต exercise log
- `DELETE /exercise-log/:id` - ลบ exercise log

### Authentication
ทุก request ต้องมี JWT token ใน header:
```
Authorization: Bearer <your_jwt_token>
```

### CORS Configuration
API รองรับ frontend ที่รันที่:
- `http://localhost:8080` (Vue.js, React, etc.)
- `http://localhost:5173` (Vite default port)

## การทดสอบ

### 1. Postman Collection
ใช้ไฟล์ `Exercise-Log-API-Postman-Collection.json` ใน Postman

### 2. HTTP File
ใช้ไฟล์ `test-exercise-log-api.http` ใน VS Code หรือ IntelliJ IDEA

### 3. cURL
```bash
# ทดสอบ health check
curl http://localhost:3000/health

# ทดสอบ exercise log (ต้องมี valid token)
curl -H "Authorization: Bearer <token>" http://localhost:3000/exercise-log
```

## Database Schema

### ตาราง exercise_log
```sql
CREATE TABLE exercise_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  exercise_name VARCHAR(200) NOT NULL,
  exercise_type VARCHAR(50) CHECK (exercise_type IN ('cardio', 'strength', 'flexibility', 'balance', 'sports', 'other')),
  duration_minutes INTEGER CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  sets INTEGER CHECK (sets > 0 AND sets <= 100),
  reps INTEGER CHECK (reps > 0 AND reps <= 1000),
  weight_kg DECIMAL(6,2) CHECK (weight_kg > 0 AND weight_kg <= 1000),
  distance_km DECIMAL(6,2) CHECK (distance_km > 0 AND distance_km <= 1000),
  calories_burned INTEGER CHECK (calories_burned >= 0 AND calories_burned <= 10000),
  intensity VARCHAR(20) CHECK (intensity IN ('low', 'moderate', 'high', 'very_high')),
  notes TEXT,
  exercise_date DATE NOT NULL,
  exercise_time TIME,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Frontend Integration

### JavaScript/TypeScript
```javascript
const API_BASE = 'http://localhost:3000';

// ดึงข้อมูล exercise logs
const getExerciseLogs = async (token) => {
  const response = await fetch(`${API_BASE}/exercise-log`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### React Component
ดูตัวอย่างใน `FRONTEND-API-USAGE.md`

## Error Handling

### Response Format
```json
{
  "success": false,
  "message": "ข้อความแสดงข้อผิดพลาด",
  "error": "รายละเอียดข้อผิดพลาด",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### HTTP Status Codes
- `200` - สำเร็จ
- `201` - สร้างสำเร็จ
- `400` - ข้อมูลไม่ถูกต้อง
- `401` - ไม่มีสิทธิ์เข้าถึง
- `403` - ไม่มีสิทธิ์เข้าถึงข้อมูล
- `404` - ไม่พบข้อมูล
- `500` - ข้อผิดพลาดภายในเซิร์ฟเวอร์

## การพัฒนา

### Project Structure
```
src/
├── exercise-log/
│   ├── exercise-log.module.ts
│   ├── exercise-log.controller.ts
│   └── exercise-log.service.ts
├── controllers/
│   └── exercise-log.controller.ts
├── services/
│   └── exercise-log.service.ts
├── dto/
│   └── exercise-log.dto.ts
└── entities/
    └── exercise-log.entity.ts
```

### การเพิ่ม Endpoint ใหม่
1. เพิ่ม method ใน `ExerciseLogService`
2. เพิ่ม route ใน `ExerciseLogController`
3. อัปเดต DTOs ถ้าจำเป็น
4. ทดสอบด้วย Postman หรือ HTTP file

## Troubleshooting

### ปัญหาที่พบบ่อย

1. **Port 3000 ถูกใช้งาน**
   ```bash
   lsof -i :3000
   kill <PID>
   ```

2. **CORS Error**
   - ตรวจสอบ CORS configuration ใน `main.ts`
   - ตรวจสอบ origin ของ frontend

3. **Authentication Error**
   - ตรวจสอบ JWT token
   - ตรวจสอบ token expiration

4. **Database Connection Error**
   - ตรวจสอบ Supabase configuration
   - ตรวจสอบ environment variables

## Support

สำหรับคำถามหรือปัญหาการใช้งาน ดูเอกสารเพิ่มเติม:
- `FRONTEND-API-USAGE.md` - คู่มือการใช้งานสำหรับ Frontend
- `EXERCISE-LOG-API.md` - API Documentation
- `exercise-log-schema-simple.sql` - Database Schema
