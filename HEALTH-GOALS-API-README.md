# Health Goals API - Vita Wise AI

## ภาพรวม
Health Goals API เป็นส่วนหนึ่งของระบบ Vita Wise AI ที่ใช้สำหรับจัดการเป้าหมายสุขภาพของผู้ใช้ โดยมีฟีเจอร์ครบถ้วนสำหรับการสร้าง อัพเดท ลบ และติดตามความคืบหน้าของเป้าหมายสุขภาพ

## Base URL
```
http://localhost:3000
```

## การยืนยันตัวตน (Authentication)
API นี้ใช้ JWT Bearer Token สำหรับการยืนยันตัวตน

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## Endpoints

### 1. CRUD Operations

#### GET /health-goals
ดึงรายการเป้าหมายสุขภาพทั้งหมดของผู้ใช้

**Query Parameters:**
- `goal_type`: ประเภทเป้าหมาย (weight_loss, weight_gain, muscle_gain, endurance, flexibility, stress_reduction, sleep_improvement, nutrition, other)
- `status`: สถานะ (active, completed, paused, cancelled)
- `priority`: ความสำคัญ (low, medium, high, urgent)
- `search`: ค้นหาตามชื่อหรือคำอธิบาย
- `start_date_from`: วันที่เริ่มต้นจาก (YYYY-MM-DD)
- `start_date_to`: วันที่เริ่มต้นถึง (YYYY-MM-DD)
- `target_date_from`: วันที่เป้าหมายจาก (YYYY-MM-DD)
- `target_date_to`: วันที่เป้าหมายถึง (YYYY-MM-DD)
- `page`: หน้าปัจจุบัน (เริ่มต้นที่ 1)
- `limit`: จำนวนรายการต่อหน้า (เริ่มต้นที่ 10)

**Response:**
```json
{
  "success": true,
  "message": "ดึงรายการเป้าหมายสำเร็จ",
  "data": {
    "goals": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    },
    "stats": {...}
  }
}
```

#### GET /health-goals/:id
ดึงข้อมูลเป้าหมายสุขภาพตาม ID

#### POST /health-goals
สร้างเป้าหมายสุขภาพใหม่

**Request Body:**
```json
{
  "goal_type": "weight_loss",
  "title": "ลดน้ำหนัก 5 กิโลกรัม",
  "description": "ลดน้ำหนักเพื่อสุขภาพที่ดีขึ้น",
  "target_value": 5,
  "current_value": 0,
  "unit": "kg",
  "start_date": "2024-01-01",
  "target_date": "2024-06-01",
  "priority": "medium"
}
```

#### PUT /health-goals/:id
อัพเดทข้อมูลเป้าหมายสุขภาพ

#### DELETE /health-goals/:id
ลบเป้าหมายสุขภาพ

### 2. Goal Progress & Updates

#### PUT /health-goals/:id/progress
อัพเดทความคืบหน้าของเป้าหมาย

**Request Body:**
```json
{
  "current_value": 3
}
```

#### GET /health-goals/:id/progress
ดึงข้อมูลความคืบหน้าของเป้าหมาย

### 3. Goal Status Management

#### PUT /health-goals/:id/complete
ทำเป้าหมายให้เสร็จสิ้น

#### PUT /health-goals/:id/pause
หยุดเป้าหมายชั่วคราว

#### PUT /health-goals/:id/resume
กลับมาเริ่มเป้าหมายที่หยุดไว้

#### PUT /health-goals/:id/cancel
ยกเลิกเป้าหมาย

### 4. Search & Filter

#### GET /health-goals/search/active
ดึงเป้าหมายที่กำลังดำเนินการอยู่

#### GET /health-goals/search/completed
ดึงเป้าหมายที่เสร็จสิ้นแล้ว

#### GET /health-goals/search/overdue
ดึงเป้าหมายที่เกินกำหนดแล้ว

#### GET /health-goals/search/priority/:priority
ดึงเป้าหมายตามระดับความสำคัญ

#### GET /health-goals/search/type/:type
ดึงเป้าหมายตามประเภท

### 5. Templates & Recommendations

#### GET /health-goals/templates
ดึงเทมเพลตเป้าหมายสุขภาพที่แนะนำ

#### GET /health-goals/recommendations
ดึงคำแนะนำเป้าหมายสุขภาพที่เหมาะสมกับผู้ใช้

### 6. Statistics & Analytics

#### GET /health-goals/stats/overview
ดึงสถิติภาพรวมของเป้าหมายสุขภาพ

### 7. Bulk Operations

#### PUT /health-goals/bulk-update
อัพเดทเป้าหมายหลายรายการพร้อมกัน

**Request Body:**
```json
{
  "goal_ids": [1, 2, 3],
  "updates": {
    "status": "active",
    "priority": "medium"
  }
}
```

## Data Models

### Goal Types
- `weight_loss`: ลดน้ำหนัก
- `weight_gain`: เพิ่มน้ำหนัก
- `muscle_gain`: เพิ่มกล้ามเนื้อ
- `endurance`: เพิ่มความทนทาน
- `flexibility`: เพิ่มความยืดหยุ่น
- `stress_reduction`: ลดความเครียด
- `sleep_improvement`: ปรับปรุงการนอน
- `nutrition`: โภชนาการ
- `other`: อื่นๆ

### Goal Status
- `active`: กำลังดำเนินการ
- `completed`: เสร็จสิ้น
- `paused`: หยุดชั่วคราว
- `cancelled`: ยกเลิก

### Goal Priority
- `low`: ต่ำ
- `medium`: ปานกลาง
- `high`: สูง
- `urgent`: เร่งด่วน

## การใช้งานกับ Frontend

### ตัวอย่างการเรียก API ใน JavaScript

```javascript
// ดึงรายการเป้าหมายทั้งหมด
const getHealthGoals = async () => {
  try {
    const response = await fetch('http://localhost:3000/health-goals', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching health goals:', error);
  }
};

// สร้างเป้าหมายใหม่
const createHealthGoal = async (goalData) => {
  try {
    const response = await fetch('http://localhost:3000/health-goals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(goalData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating health goal:', error);
  }
};

// อัพเดทความคืบหน้า
const updateProgress = async (goalId, currentValue) => {
  try {
    const response = await fetch(`http://localhost:3000/health-goals/${goalId}/progress`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ current_value: currentValue })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating progress:', error);
  }
};
```

### ตัวอย่างการใช้งานใน React

```jsx
import React, { useState, useEffect } from 'react';

const HealthGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('http://localhost:3000/health-goals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setGoals(data.data.goals);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>เป้าหมายสุขภาพ</h2>
      {goals.map(goal => (
        <div key={goal.id}>
          <h3>{goal.title}</h3>
          <p>{goal.description}</p>
          <p>ความคืบหน้า: {goal.current_value}/{goal.target_value} {goal.unit}</p>
          <p>สถานะ: {goal.status}</p>
        </div>
      ))}
    </div>
  );
};

export default HealthGoals;
```

## การทดสอบ

### 1. ใช้ Postman Collection
นำเข้าไฟล์ `Health-Goals-API-Postman-Collection.json` ไปยัง Postman

### 2. ใช้ไฟล์ HTTP
ใช้ไฟล์ `test-health-goals-api.http` กับ VS Code REST Client extension

### 3. ใช้ cURL
```bash
# ดึงรายการเป้าหมาย
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/health-goals

# สร้างเป้าหมายใหม่
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"goal_type":"weight_loss","title":"ลดน้ำหนัก","start_date":"2024-01-01"}' \
     http://localhost:3000/health-goals
```

## หมายเหตุสำคัญ

1. **Authentication**: ทุก endpoint ต้องการ JWT token ยกเว้น endpoint ที่ระบุไว้เป็น public
2. **CORS**: API รองรับ CORS สำหรับ frontend ที่รันที่ localhost:5173
3. **Validation**: ข้อมูลที่ส่งมาจะถูก validate ตาม DTO ที่กำหนดไว้
4. **Error Handling**: API จะส่ง error response ที่มีโครงสร้างมาตรฐาน
5. **Pagination**: endpoint ที่ดึงรายการจะรองรับการแบ่งหน้า

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **401 Unauthorized**: ตรวจสอบ JWT token ว่าถูกต้องและยังไม่หมดอายุ
2. **400 Bad Request**: ตรวจสอบข้อมูลที่ส่งว่าตรงตาม schema ที่กำหนด
3. **404 Not Found**: ตรวจสอบ ID ของเป้าหมายว่ามีอยู่จริง
4. **500 Internal Server Error**: ตรวจสอบ log ของ server

### การ Debug

1. ตรวจสอบ Network tab ใน Developer Tools
2. ตรวจสอบ log ของ NestJS server
3. ใช้ Postman หรือ cURL เพื่อทดสอบ API โดยตรง
4. ตรวจสอบ database connection และ schema
