# Exercise Log API

API สำหรับจัดการบันทึกการออกกำลังกาย

## Endpoints

### Base URL
```
http://localhost:8080
```

### Authentication
ทุก endpoint ต้องมี JWT token:
```
Authorization: Bearer <your_jwt_token>
```

### 1. Exercise Log CRUD

#### POST /exercise-log
สร้าง exercise log ใหม่

```json
{
  "exercise_name": "Running",
  "exercise_type": "cardio",
  "duration_minutes": 30,
  "distance_km": 5.0,
  "calories_burned": 300,
  "intensity": "moderate",
  "notes": "Morning run",
  "exercise_date": "2024-01-15",
  "exercise_time": "07:00:00"
}
```

#### GET /exercise-log
ดึงข้อมูล exercise logs พร้อม pagination

Query parameters:
- `page`: หมายเลขหน้า (default: 1)
- `limit`: จำนวนรายการต่อหน้า (default: 10)
- `exercise_type`: ประเภทการออกกำลังกาย
- `intensity`: ความเข้มข้น
- `search`: คำค้นหา
- `exercise_date_from`: วันที่เริ่มต้น
- `exercise_date_to`: วันที่สิ้นสุด

#### GET /exercise-log/:id
ดึงข้อมูล exercise log ตาม ID

#### PUT /exercise-log/:id
อัปเดตข้อมูล exercise log

#### DELETE /exercise-log/:id
ลบข้อมูล exercise log

### 2. Exercise Log Queries

#### GET /exercise-log/types/:exerciseType
ดึงข้อมูล exercise logs ตามประเภท

#### GET /exercise-log?intensity=high
ดึงข้อมูล exercise logs ตามความเข้มข้น

#### GET /exercise-log?search=running
ค้นหา exercise logs ตามคำค้นหา

### 3. สถิติและการวิเคราะห์

#### GET /exercise-log/stats?date=2024-01-15
ดึงสถิติ exercise log สำหรับวันที่ระบุ

#### GET /exercise-log/trends?days=7
ดึงแนวโน้ม exercise log สำหรับจำนวนวันที่ระบุ

#### GET /exercise-log/calories/summary?startDate=2024-01-01&endDate=2024-01-31
ดึงสรุปแคลอรี่ที่เผาผลาญในช่วงวันที่ระบุ

#### GET /exercise-log/streak/current
ดึงข้อมูล exercise streak ปัจจุบัน

### 4. AI และคำแนะนำ

#### GET /exercise-log/workout-analysis?date=2024-01-15
ดึงการวิเคราะห์ workout จาก AI

#### GET /exercise-log/recommendations
ดึงคำแนะนำการออกกำลังกายจาก AI

## Data Validation

### Exercise Type
- `cardio`, `strength`, `flexibility`, `balance`, `sports`, `other`

### Exercise Intensity
- `low`, `moderate`, `high`, `very_high`

### Validation Rules
- `exercise_name`: ต้องไม่เป็น null และความยาวไม่เกิน 200 ตัวอักษร
- `duration_minutes`: ต้องเป็น integer และอยู่ระหว่าง 1-1440
- `sets`, `reps`: ต้องเป็น integer และมากกว่า 0
- `weight_kg`, `distance_km`: ต้องเป็น float และมากกว่า 0
- `calories_burned`: ต้องเป็น integer และมากกว่าหรือเท่ากับ 0
- `exercise_date`: ต้องเป็นรูปแบบ YYYY-MM-DD
- `exercise_time`: ต้องเป็นรูปแบบ HH:MM:SS

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "ข้อความแสดงความสำเร็จ"
}
```

### Error Response
```json
{
  "success": false,
  "message": "ข้อความแสดงข้อผิดพลาด",
  "statusCode": 400
}
```

## การทดสอบ

### 1. Postman Collection
นำเข้าไฟล์ `Exercise-Log-API-Postman-Collection.json` ใน Postman

### 2. HTTP File
ใช้ไฟล์ `test-exercise-log-api.http` ใน VS Code

### 3. Environment Variables ใน Postman
- `base_url`: http://localhost:8080
- `auth_token`: JWT token ที่ได้จากการ login
