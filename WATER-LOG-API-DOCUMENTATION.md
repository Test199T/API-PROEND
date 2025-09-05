# Water Log API Documentation

API สำหรับจัดการบันทึกการดื่มน้ำและเครื่องดื่มต่างๆ ในระบบ VITA WISE AI

## Overview

Water Log API ให้บริการครบครันสำหรับการบันทึก การติดตาม และการวิเคราะห์การดื่มน้ำของผู้ใช้ รวมถึงการตั้งเป้าหมายและดูสถิติการดื่มน้ำ

## Base URL
```
http://localhost:8080
```

## Authentication
ทุก endpoint ต้องมี JWT token:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Water Log CRUD Operations

#### POST /water-logs
สร้าง water log ใหม่

**Request Body:**
```json
{
  "amount_ml": 250,
  "drink_type": "water",
  "notes": "Morning hydration",
  "consumed_at": "2024-01-15T08:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Water log created successfully",
  "data": {
    "id": 1,
    "user_id": 123,
    "amount_ml": 250,
    "drink_type": "water",
    "notes": "Morning hydration",
    "consumed_at": "2024-01-15T08:30:00Z",
    "created_at": "2024-01-15T08:30:00Z"
  }
}
```

#### GET /water-logs
ดึงข้อมูล water logs พร้อม pagination และ filtering

**Query Parameters:**
- `start_date`: วันที่เริ่มต้น (YYYY-MM-DD)
- `end_date`: วันที่สิ้นสุด (YYYY-MM-DD)
- `drink_type`: ประเภทเครื่องดื่ม (water, tea, coffee, juice, sports_drink, other)
- `limit`: จำนวนรายการต่อหน้า (default: 20, max: 100)
- `offset`: จำนวนรายการที่ข้าม (default: 0)

**Example:**
```
GET /water-logs?start_date=2024-01-01&end_date=2024-01-31&drink_type=water&limit=20&offset=0
```

#### GET /water-logs/:id
ดึงข้อมูล water log ตาม ID

#### PUT /water-logs/:id
อัปเดตข้อมูล water log

**Request Body:**
```json
{
  "amount_ml": 300,
  "notes": "Updated - larger glass"
}
```

#### DELETE /water-logs/:id
ลบข้อมูล water log

### 2. Water Statistics

#### GET /water-logs/stats/daily
ดึงสถิติการดื่มน้ำรายวัน

**Query Parameters:**
- `date`: วันที่ต้องการดู (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Daily water stats retrieved successfully",
  "data": {
    "date": "2024-01-15",
    "total_ml": 1500,
    "total_liters": 1.5,
    "total_oz": 50.7,
    "entries_count": 6,
    "drink_types": {
      "water": 1200,
      "coffee": 200,
      "tea": 100
    },
    "hourly_breakdown": [
      {"hour": 7, "amount_ml": 250},
      {"hour": 8, "amount_ml": 200},
      {"hour": 12, "amount_ml": 300}
    ]
  }
}
```

#### GET /water-logs/stats/weekly
ดึงสถิติการดื่มน้ำรายสัปดาห์

**Query Parameters:**
- `start_date`: วันที่เริ่มต้น (YYYY-MM-DD)
- `end_date`: วันที่สิ้นสุด (YYYY-MM-DD)

### 3. Water Goals

#### GET /water-logs/goals/daily
ดึงเป้าหมายการดื่มน้ำรายวัน

**Response:**
```json
{
  "success": true,
  "message": "Daily water goal retrieved successfully",
  "data": {
    "daily_goal_ml": 2000,
    "daily_goal_liters": 2.0,
    "daily_goal_oz": 67.6,
    "notes": "Recommended daily intake",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /water-logs/goals/daily
ตั้งเป้าหมายการดื่มน้ำรายวัน

**Request Body:**
```json
{
  "daily_goal_ml": 2000,
  "notes": "Recommended daily intake"
}
```

### 4. Water Progress & Trends

#### GET /water-logs/progress/today
ดึงความคืบหน้าการดื่มน้ำวันนี้

**Response:**
```json
{
  "success": true,
  "message": "Today's water progress retrieved successfully",
  "data": {
    "date": "2024-01-15",
    "consumed_ml": 1200,
    "goal_ml": 2000,
    "remaining_ml": 800,
    "progress_percentage": 60,
    "entries_count": 4,
    "last_entry": "2024-01-15T15:30:00Z",
    "recommendations": [
      "You're on track! Keep hydrating throughout the day.",
      "Consider drinking more water in the evening."
    ]
  }
}
```

#### GET /water-logs/trends/consumption
ดึงแนวโน้มการดื่มน้ำ

**Query Parameters:**
- `days`: จำนวนวันที่ต้องการดู (default: 30)

**Response:**
```json
{
  "success": true,
  "message": "Water consumption trends retrieved successfully",
  "data": {
    "period_days": 30,
    "average_daily_ml": 1850,
    "total_ml": 55500,
    "trend_direction": "increasing",
    "daily_data": [
      {
        "date": "2024-01-01",
        "total_ml": 1800,
        "entries_count": 5
      },
      {
        "date": "2024-01-02",
        "total_ml": 1900,
        "entries_count": 6
      }
    ],
    "insights": [
      "Your water consumption has increased by 5% this week",
      "You're consistently meeting your daily goals"
    ]
  }
}
```

### 5. Water Insights

#### GET /water-logs/insights/hydration
ดึงข้อมูลเชิงลึกเกี่ยวกับการดื่มน้ำ

**Response:**
```json
{
  "success": true,
  "message": "Hydration insights retrieved successfully",
  "data": {
    "overall_score": 85,
    "hydration_level": "good",
    "recommendations": [
      "Try to drink water more consistently throughout the day",
      "Consider reducing caffeine intake in the afternoon"
    ],
    "patterns": {
      "peak_hours": [8, 12, 15],
      "low_hours": [22, 23, 0],
      "preferred_drink_types": ["water", "coffee"]
    },
    "health_tips": [
      "Drink a glass of water first thing in the morning",
      "Keep a water bottle nearby while working"
    ]
  }
}
```

## Data Models

### Water Log Entity
```typescript
{
  id: number;
  user_id: number;
  amount_ml: number;
  drink_type: DrinkType;
  consumed_at: Date;
  notes?: string;
  created_at: Date;
}
```

### Drink Types
```typescript
enum DrinkType {
  WATER = 'water',
  TEA = 'tea',
  COFFEE = 'coffee',
  JUICE = 'juice',
  SPORTS_DRINK = 'sports_drink',
  OTHER = 'other'
}
```

### Computed Properties
- `amount_liters`: ปริมาณเป็นลิตร
- `amount_oz`: ปริมาณเป็นออนซ์
- `drink_type_text`: ชื่อประเภทเครื่องดื่มเป็นภาษาไทย
- `drink_type_icon`: ไอคอนสำหรับประเภทเครื่องดื่ม
- `consumed_time`: เวลาที่ดื่ม (HH:MM)
- `consumed_date`: วันที่ที่ดื่ม
- `is_water`: ตรวจสอบว่าเป็นน้ำเปล่าหรือไม่
- `is_caffeinated`: ตรวจสอบว่ามีคาเฟอีนหรือไม่

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount_ml",
      "message": "Amount must be between 0 and 10000 ml"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Water log not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Frontend Integration Examples

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const WaterLogComponent = () => {
  const [waterLogs, setWaterLogs] = useState([]);
  const [todayProgress, setTodayProgress] = useState(null);

  useEffect(() => {
    fetchWaterLogs();
    fetchTodayProgress();
  }, []);

  const fetchWaterLogs = async () => {
    try {
      const response = await fetch('/api/water-logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      const data = await response.json();
      setWaterLogs(data.data);
    } catch (error) {
      console.error('Error fetching water logs:', error);
    }
  };

  const addWaterLog = async (amount, drinkType, notes) => {
    try {
      const response = await fetch('/api/water-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({
          amount_ml: amount,
          drink_type: drinkType,
          notes: notes,
          consumed_at: new Date().toISOString()
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchWaterLogs();
        fetchTodayProgress();
      }
    } catch (error) {
      console.error('Error adding water log:', error);
    }
  };

  return (
    <div className="water-log-container">
      <h2>Water Log</h2>
      
      {/* Today's Progress */}
      {todayProgress && (
        <div className="progress-section">
          <h3>Today's Progress</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${todayProgress.progress_percentage}%` }}
            ></div>
          </div>
          <p>{todayProgress.consumed_ml}ml / {todayProgress.goal_ml}ml</p>
        </div>
      )}

      {/* Add Water Log */}
      <div className="add-water-section">
        <h3>Add Water Intake</h3>
        <button onClick={() => addWaterLog(250, 'water', 'Glass of water')}>
          +250ml Water
        </button>
        <button onClick={() => addWaterLog(200, 'coffee', 'Morning coffee')}>
          +200ml Coffee
        </button>
      </div>

      {/* Water Logs List */}
      <div className="water-logs-list">
        <h3>Recent Entries</h3>
        {waterLogs.map(log => (
          <div key={log.id} className="water-log-item">
            <span className="drink-icon">{log.drink_type_icon}</span>
            <span className="amount">{log.amount_ml}ml</span>
            <span className="type">{log.drink_type_text}</span>
            <span className="time">{log.consumed_time}</span>
            {log.notes && <span className="notes">{log.notes}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaterLogComponent;
```

### JavaScript API Usage
```javascript
class WaterLogAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    return await response.json();
  }

  // Create water log
  async createWaterLog(data) {
    return await this.request('/water-logs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Get water logs
  async getWaterLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/water-logs?${queryString}`);
  }

  // Get today's progress
  async getTodayProgress() {
    return await this.request('/water-logs/progress/today');
  }

  // Get daily stats
  async getDailyStats(date) {
    return await this.request(`/water-logs/stats/daily?date=${date}`);
  }

  // Set daily goal
  async setDailyGoal(goalMl, notes = '') {
    return await this.request('/water-logs/goals/daily', {
      method: 'POST',
      body: JSON.stringify({
        daily_goal_ml: goalMl,
        notes: notes
      })
    });
  }

  // Get hydration insights
  async getHydrationInsights() {
    return await this.request('/water-logs/insights/hydration');
  }
}

// Usage example
const waterAPI = new WaterLogAPI('http://localhost:8080', 'your_jwt_token');

// Add a water log
waterAPI.createWaterLog({
  amount_ml: 250,
  drink_type: 'water',
  notes: 'Morning hydration',
  consumed_at: new Date().toISOString()
}).then(response => {
  console.log('Water log created:', response);
});

// Get today's progress
waterAPI.getTodayProgress().then(progress => {
  console.log('Today\'s progress:', progress);
});
```

## Testing Guide

### 1. Import Postman Collection
1. เปิด Postman
2. คลิก Import
3. เลือกไฟล์ `Water-Log-API-Postman-Collection.json`
4. ตั้งค่า environment variables:
   - `base_url`: http://localhost:8080
   - `jwt_token`: your_jwt_token_here

### 2. Authentication
1. เรียกใช้ "Login to get JWT Token" request
2. คัดลอก token จาก response
3. ตั้งค่า `jwt_token` variable ใน Postman

### 3. Test Sequence
1. **Create Sample Data**: ใช้ requests ใน "Sample Data Creation" folder
2. **Test CRUD Operations**: ทดสอบ create, read, update, delete
3. **Test Statistics**: ดู daily และ weekly stats
4. **Test Goals**: ตั้งและดู daily goals
5. **Test Progress**: ดู today's progress
6. **Test Trends**: ดู consumption trends
7. **Test Insights**: ดู hydration insights

## Best Practices

### 1. Data Validation
- ตรวจสอบ `amount_ml` ต้องอยู่ระหว่าง 0-10000
- ตรวจสอบ `drink_type` ต้องเป็นค่าที่อนุญาต
- ตรวจสอบ `consumed_at` ต้องเป็น ISO date string

### 2. Error Handling
- ใช้ try-catch สำหรับ API calls
- ตรวจสอบ response.success ก่อนใช้ data
- แสดง error messages ที่เหมาะสม

### 3. Performance
- ใช้ pagination สำหรับ large datasets
- Cache frequently accessed data
- ใช้ debouncing สำหรับ real-time updates

### 4. User Experience
- แสดง progress indicators
- ให้ feedback ทันทีเมื่อเพิ่มข้อมูล
- ใช้ icons และ colors ที่เหมาะสม
- แสดง recommendations และ tips

## Database Schema

```sql
CREATE TABLE water_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL CHECK (amount_ml > 0 AND amount_ml <= 10000),
  drink_type VARCHAR(20) NOT NULL DEFAULT 'water' CHECK (drink_type IN ('water', 'tea', 'coffee', 'juice', 'sports_drink', 'other')),
  consumed_at TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_water_log_user_id ON water_log(user_id);
CREATE INDEX idx_water_log_consumed_at ON water_log(consumed_at);
CREATE INDEX idx_water_log_drink_type ON water_log(drink_type);
```

## Support

หากมีปัญหาหรือคำถามเกี่ยวกับ Water Log API กรุณาติดต่อทีมพัฒนา หรือดู documentation เพิ่มเติมในไฟล์อื่นๆ ของโปรเจค
