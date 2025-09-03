ส่ทำ# Exercise Log API - คู่มือการใช้งานสำหรับ Frontend

## การเชื่อมต่อ API

### Base URL
```
http://localhost:3000
```

### Authentication
ทุก request ต้องมี JWT token ใน header:
```javascript
headers: {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

## Endpoints หลัก

### 1. สร้าง Exercise Log
```javascript
// POST /exercise-log
const createExerciseLog = async (data) => {
  const response = await fetch('http://localhost:3000/exercise-log', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      exercise_name: "Running",
      exercise_type: "cardio",
      duration_minutes: 30,
      distance_km: 5.0,
      calories_burned: 300,
      intensity: "moderate",
      notes: "Morning run",
      exercise_date: "2024-01-15",
      exercise_time: "07:00:00"
    })
  });
  return response.json();
};
```

### 2. ดึงข้อมูล Exercise Logs
```javascript
// GET /exercise-log
const getExerciseLogs = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  });
  
  const response = await fetch(`http://localhost:3000/exercise-log?${params}`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  return response.json();
};

// ตัวอย่างการใช้งาน
const logs = await getExerciseLogs(1, 10, {
  exercise_type: 'cardio',
  intensity: 'moderate',
  exercise_date_from: '2024-01-01',
  exercise_date_to: '2024-01-31'
});
```

### 3. ดึงข้อมูล Exercise Log ตาม ID
```javascript
// GET /exercise-log/:id
const getExerciseLog = async (id) => {
  const response = await fetch(`http://localhost:3000/exercise-log/${id}`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  return response.json();
};
```

### 4. อัปเดต Exercise Log
```javascript
// PUT /exercise-log/:id
const updateExerciseLog = async (id, data) => {
  const response = await fetch(`http://localhost:3000/exercise-log/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

### 5. ลบ Exercise Log
```javascript
// DELETE /exercise-log/:id
const deleteExerciseLog = async (id) => {
  const response = await fetch(`http://localhost:3000/exercise-log/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  return response.json();
};
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "ข้อความแสดงความสำเร็จ",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "ข้อความแสดงข้อผิดพลาด",
  "error": "รายละเอียดข้อผิดพลาด",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

## Data Validation

### Exercise Types
- `cardio` - การออกกำลังกายแบบคาร์ดิโอ
- `strength` - การฝึกความแข็งแรง
- `flexibility` - การยืดกล้ามเนื้อ
- `balance` - การฝึกสมดุล
- `sports` - กีฬา
- `other` - อื่นๆ

### Exercise Intensity
- `low` - ต่ำ
- `moderate` - ปานกลาง
- `high` - สูง
- `very_high` - สูงมาก

### Required Fields
- `exercise_name` (string, max 200 characters)
- `exercise_date` (YYYY-MM-DD format)

### Optional Fields
- `exercise_type` (enum)
- `duration_minutes` (integer, 1-1440)
- `sets` (integer, 1-100)
- `reps` (integer, 1-1000)
- `weight_kg` (decimal, > 0)
- `distance_km` (decimal, > 0)
- `calories_burned` (integer, >= 0)
- `intensity` (enum)
- `notes` (text)
- `exercise_time` (HH:MM:SS format)

## ตัวอย่างการใช้งานใน React

```jsx
import React, { useState, useEffect } from 'react';

const ExerciseLogComponent = () => {
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('auth_token');

  const fetchExerciseLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/exercise-log?page=1&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setExerciseLogs(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const createExerciseLog = async (exerciseData) => {
    try {
      const response = await fetch('http://localhost:3000/exercise-log', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exerciseData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the list
        fetchExerciseLogs();
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchExerciseLogs();
  }, []);

  if (loading) return <div>กำลังโหลด...</div>;
  if (error) return <div>ข้อผิดพลาด: {error}</div>;

  return (
    <div>
      <h2>Exercise Logs</h2>
      {exerciseLogs.map(log => (
        <div key={log.id}>
          <h3>{log.exercise_name}</h3>
          <p>ประเภท: {log.exercise_type}</p>
          <p>ระยะเวลา: {log.duration_minutes} นาที</p>
          <p>แคลอรี่: {log.calories_burned}</p>
        </div>
      ))}
    </div>
  );
};

export default ExerciseLogComponent;
```

## Error Handling

### Common Error Messages
- `ข้อมูลไม่ถูกต้อง: exercise_type ต้องเป็นหนึ่งใน ["cardio", "strength", "flexibility", "balance", "sports", "other"]`
- `ไม่พบข้อมูล exercise log`
- `ไม่มีสิทธิ์เข้าถึง`
- `ข้อผิดพลาดภายในเซิร์ฟเวอร์`

### HTTP Status Codes
- `200` - สำเร็จ
- `201` - สร้างสำเร็จ
- `400` - ข้อมูลไม่ถูกต้อง
- `401` - ไม่มีสิทธิ์เข้าถึง (ไม่มี token)
- `403` - ไม่มีสิทธิ์เข้าถึงข้อมูล
- `404` - ไม่พบข้อมูล
- `500` - ข้อผิดพลาดภายในเซิร์ฟเวอร์

## Tips สำหรับ Frontend

1. **Token Management**: เก็บ JWT token ใน localStorage หรือ secure storage
2. **Error Handling**: แสดงข้อความ error ที่เหมาะสมกับผู้ใช้
3. **Loading States**: แสดง loading indicator ขณะรอ response
4. **Validation**: ตรวจสอบข้อมูลก่อนส่งไปยัง API
5. **Pagination**: ใช้ pagination สำหรับรายการข้อมูลจำนวนมาก
6. **Real-time Updates**: Refresh ข้อมูลหลังจากสร้าง/อัปเดต/ลบ
