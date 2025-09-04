# Sleep Log API Documentation

## Overview

The Sleep Log API provides comprehensive functionality for tracking, analyzing, and managing sleep data. This API allows users to record detailed sleep information, track sleep patterns, and receive personalized recommendations for better sleep quality.

## Base URL

```
http://localhost:3000/sleep-log
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Test Public Endpoint
```http
GET /sleep-log/test/public
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Sleep Log API ทำงานได้ปกติ!",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "status": "active"
  },
  "message": "ทดสอบสำเร็จ"
}
```

#### 2. Health Check
```http
GET /sleep-log/test/health-check
```

**Response:**
```json
{
  "success": true,
  "data": {
    "service": "Sleep Log API",
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0",
    "endpoints": {
      "public": [...],
      "protected": [...]
    }
  }
}
```

#### 3. Get Sample Data
```http
GET /sleep-log/test/sample-data
```

#### 4. Create Sample Data
```http
POST /sleep-log/test/create-sample
```

### Protected Endpoints (Authentication Required)

#### 1. Create Sleep Log
```http
POST /sleep-log
```

**Request Body:**
```json
{
  "sleep_date": "2024-01-15",
  "bedtime": "22:30",
  "wake_time": "06:30",
  "sleep_duration_hours": 8,
  "sleep_quality": "good",
  "sleep_efficiency_percentage": 85,
  "time_to_fall_asleep_minutes": 15,
  "awakenings_count": 1,
  "deep_sleep_minutes": 120,
  "light_sleep_minutes": 300,
  "rem_sleep_minutes": 90,
  "awake_minutes": 30,
  "heart_rate_avg": 65,
  "heart_rate_min": 55,
  "heart_rate_max": 75,
  "oxygen_saturation_avg": 98,
  "room_temperature_celsius": 22,
  "noise_level_db": 35,
  "light_level_lux": 5,
  "caffeine_intake_mg": 0,
  "alcohol_intake_ml": 0,
  "exercise_before_bed_hours": 3,
  "screen_time_before_bed_minutes": 30,
  "sleep_aids_used": [],
  "medications_taken": [],
  "stress_level": 3,
  "mood_before_sleep": 7,
  "mood_after_wake": 8,
  "energy_level": 8,
  "notes": "นอนหลับได้ดี ตื่นขึ้นมาสดชื่น",
  "dreams_remembered": true,
  "nightmares": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "sleep_date": "2024-01-15T00:00:00.000Z",
    "bedtime": "22:30",
    "wake_time": "06:30",
    "sleep_duration_hours": 8,
    "sleep_quality": "good",
    "sleep_efficiency_percentage": 85,
    "time_to_fall_asleep_minutes": 15,
    "awakenings_count": 1,
    "deep_sleep_minutes": 120,
    "light_sleep_minutes": 300,
    "rem_sleep_minutes": 90,
    "awake_minutes": 30,
    "heart_rate_avg": 65,
    "heart_rate_min": 55,
    "heart_rate_max": 75,
    "oxygen_saturation_avg": 98,
    "room_temperature_celsius": 22,
    "noise_level_db": 35,
    "light_level_lux": 5,
    "caffeine_intake_mg": 0,
    "alcohol_intake_ml": 0,
    "exercise_before_bed_hours": 3,
    "screen_time_before_bed_minutes": 30,
    "sleep_aids_used": [],
    "medications_taken": [],
    "stress_level": 3,
    "mood_before_sleep": 7,
    "mood_after_wake": 8,
    "energy_level": 8,
    "notes": "นอนหลับได้ดี ตื่นขึ้นมาสดชื่น",
    "dreams_remembered": true,
    "nightmares": false,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "total_sleep_time_minutes": 480,
    "deep_sleep_percentage": 25,
    "light_sleep_percentage": 62.5,
    "rem_sleep_percentage": 18.75,
    "awake_percentage": 6.25,
    "sleep_duration_formatted": "8 ชม. 0 นาที",
    "bedtime_formatted": "22:30",
    "wake_time_formatted": "06:30",
    "sleep_date_formatted": "วันจันทร์ที่ 15 มกราคม 2567",
    "is_healthy_sleep_duration": true,
    "is_healthy_sleep_efficiency": true,
    "is_healthy_time_to_fall_asleep": true,
    "sleep_score": 78,
    "sleep_quality_description": "ดี",
    "sleep_score_description": "ดี"
  },
  "message": "สร้างบันทึกการนอนสำเร็จ"
}
```

#### 2. Get All Sleep Logs
```http
GET /sleep-log?page=1&limit=10&sleep_quality=good&min_sleep_duration=7&max_sleep_duration=9
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sleep_quality` (optional): Filter by sleep quality (excellent, good, fair, poor, very_poor)
- `min_sleep_duration` (optional): Minimum sleep duration in hours
- `max_sleep_duration` (optional): Maximum sleep duration in hours
- `sleep_date_from` (optional): Start date (YYYY-MM-DD)
- `sleep_date_to` (optional): End date (YYYY-MM-DD)
- `search` (optional): Search in notes

**Response:**
```json
{
  "success": true,
  "data": {
    "sleep_logs": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "total_pages": 3,
    "stats": {
      "average_sleep_duration": 7.8,
      "average_sleep_quality": 0,
      "average_sleep_score": 75,
      "total_sleep_logs": 25
    }
  },
  "message": "ดึงรายการบันทึกการนอนสำเร็จ"
}
```

#### 3. Get Sleep Log by ID
```http
GET /sleep-log/{id}
```

#### 4. Update Sleep Log
```http
PUT /sleep-log/{id}
```

**Request Body:** (Same structure as create, but all fields are optional)

#### 5. Delete Sleep Log
```http
DELETE /sleep-log/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "ลบบันทึกการนอนสำเร็จ"
  },
  "message": "ลบบันทึกการนอนสำเร็จ"
}
```

### Statistics & Analytics

#### 1. Get Sleep Statistics Overview
```http
GET /sleep-log/stats/overview?date=2024-01-15
```

**Query Parameters:**
- `date` (optional): Specific date for statistics (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_sleep_logs": 30,
    "average_sleep_duration_hours": 7.8,
    "average_sleep_efficiency_percentage": 82.5,
    "average_sleep_score": 75.2,
    "average_time_to_fall_asleep_minutes": 18.5,
    "average_awakenings_count": 1.2,
    "sleep_quality_distribution": {
      "excellent": 5,
      "good": 15,
      "fair": 8,
      "poor": 2,
      "very_poor": 0
    },
    "sleep_duration_distribution": {
      "under_6_hours": 2,
      "six_to_seven_hours": 8,
      "seven_to_eight_hours": 15,
      "eight_to_nine_hours": 4,
      "over_9_hours": 1
    },
    "sleep_score_distribution": {
      "excellent": 5,
      "good": 12,
      "fair": 10,
      "poor": 3,
      "very_poor": 0
    },
    "weekly_trends": [...],
    "bedtime_patterns": [...],
    "wake_time_patterns": [...],
    "health_insights": {
      "consistent_sleep_schedule": true,
      "adequate_sleep_duration": true,
      "good_sleep_efficiency": true,
      "low_awakenings": true,
      "recommendations": ["คุณภาพการนอนอยู่ในเกณฑ์ที่ดี"]
    }
  },
  "message": "ดึงสถิติสำเร็จ"
}
```

#### 2. Get Sleep Trends
```http
GET /sleep-log/trends?days=7
```

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 7, max: 365)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "trends": [
      {
        "date": "2024-01-15",
        "sleep_duration_hours": 8,
        "sleep_score": 78,
        "sleep_quality": "good",
        "sleep_efficiency_percentage": 85
      }
    ],
    "summary": {
      "trend_direction": "stable",
      "average_change_percentage": 2.5,
      "key_insights": ["ระยะเวลาการนอนอยู่ในเกณฑ์ที่เหมาะสม"]
    }
  },
  "message": "ดึงแนวโน้มสำเร็จ"
}
```

#### 3. Get Sleep Analysis
```http
GET /sleep-log/analysis?days=30
```

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30, max: 365)

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_assessment": "คุณภาพการนอนโดยรวมดี",
    "strengths": [
      "ระยะเวลาการนอนอยู่ในเกณฑ์ที่เหมาะสม",
      "ประสิทธิภาพการนอนดี",
      "หลับได้เร็ว"
    ],
    "areas_for_improvement": [],
    "recommendations": [
      {
        "category": "sleep_improvement",
        "title": "ปรับปรุงสภาพแวดล้อมการนอน",
        "description": "ปรับปรุงสภาพแวดล้อมการนอนและกิจวัตรก่อนนอน",
        "priority": "medium",
        "actionable_steps": ["ปรับปรุงสภาพแวดล้อมการนอนและกิจวัตรก่อนนอน"],
        "expected_benefit": "ปรับปรุงคุณภาพการนอน",
        "confidence_score": 0.8
      }
    ],
    "sleep_score_trend": "stable",
    "key_metrics": [
      {
        "metric": "ระยะเวลาการนอน",
        "current_value": 7.8,
        "target_value": 8,
        "status": "good"
      },
      {
        "metric": "ประสิทธิภาพการนอน",
        "current_value": 82.5,
        "target_value": 85,
        "status": "needs_improvement"
      },
      {
        "metric": "เวลาที่ใช้ในการหลับ",
        "current_value": 18.5,
        "target_value": 15,
        "status": "good"
      },
      {
        "metric": "คะแนนการนอนโดยรวม",
        "current_value": 75.2,
        "target_value": 80,
        "status": "needs_improvement"
      }
    ]
  },
  "message": "วิเคราะห์สำเร็จ"
}
```

#### 4. Get Sleep Recommendations
```http
GET /sleep-log/recommendations
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "sleep_duration",
      "title": "เพิ่มระยะเวลาการนอน",
      "description": "ระยะเวลาการนอนเฉลี่ย 6.5 ชั่วโมง น้อยกว่าเกณฑ์ที่แนะนำ (7-9 ชั่วโมง)",
      "priority": "high",
      "actionable_steps": [
        "เข้านอนเร็วขึ้น 30-60 นาที",
        "หลีกเลี่ยงการใช้อุปกรณ์อิเล็กทรอนิกส์ก่อนนอน",
        "สร้างกิจวัตรก่อนนอนที่ผ่อนคลาย"
      ],
      "expected_benefit": "ปรับปรุงคุณภาพการนอนและพลังงานในตอนเช้า",
      "confidence_score": 0.9
    }
  ],
  "message": "ดึงคำแนะนำสำเร็จ"
}
```

### Search & Filter Endpoints

#### 1. Search by Sleep Quality
```http
GET /sleep-log/search/quality/{quality}
```

**Path Parameters:**
- `quality`: Sleep quality (excellent, good, fair, poor, very_poor)

#### 2. Search by Sleep Duration
```http
GET /sleep-log/search/duration/{min}/{max}
```

**Path Parameters:**
- `min`: Minimum sleep duration in hours
- `max`: Maximum sleep duration in hours

#### 3. Search by Date Range
```http
GET /sleep-log/search/date-range?from=2024-01-01&to=2024-01-31
```

**Query Parameters:**
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)

## Data Models

### Sleep Quality Enum
- `excellent`: ยอดเยี่ยม
- `good`: ดี
- `fair`: ปานกลาง
- `poor`: แย่
- `very_poor`: แย่มาก

### Sleep Log Fields

#### Required Fields
- `sleep_date`: Date of sleep (YYYY-MM-DD)
- `bedtime`: Bedtime (HH:MM)
- `wake_time`: Wake time (HH:MM)
- `sleep_duration_hours`: Sleep duration in hours (0-24)
- `sleep_quality`: Sleep quality (enum)

#### Optional Fields
- `sleep_efficiency_percentage`: Sleep efficiency percentage (0-100)
- `time_to_fall_asleep_minutes`: Time to fall asleep in minutes
- `awakenings_count`: Number of awakenings during night
- `deep_sleep_minutes`: Deep sleep duration in minutes
- `light_sleep_minutes`: Light sleep duration in minutes
- `rem_sleep_minutes`: REM sleep duration in minutes
- `awake_minutes`: Awake time during night in minutes
- `heart_rate_avg`: Average heart rate during sleep
- `heart_rate_min`: Minimum heart rate during sleep
- `heart_rate_max`: Maximum heart rate during sleep
- `oxygen_saturation_avg`: Average oxygen saturation
- `room_temperature_celsius`: Room temperature in Celsius
- `noise_level_db`: Noise level in decibels
- `light_level_lux`: Light level in lux
- `caffeine_intake_mg`: Caffeine intake in mg before sleep
- `alcohol_intake_ml`: Alcohol intake in ml before sleep
- `exercise_before_bed_hours`: Hours between last exercise and bedtime
- `screen_time_before_bed_minutes`: Screen time before bed in minutes
- `sleep_aids_used`: Array of sleep aids used
- `medications_taken`: Array of medications taken
- `stress_level`: Stress level (1-10 scale)
- `mood_before_sleep`: Mood before sleep (1-10 scale)
- `mood_after_wake`: Mood after waking (1-10 scale)
- `energy_level`: Energy level (1-10 scale)
- `notes`: Additional notes
- `dreams_remembered`: Whether dreams were remembered (boolean)
- `nightmares`: Whether nightmares occurred (boolean)

### Computed Properties

The API automatically calculates and returns these computed properties:

- `total_sleep_time_minutes`: Total sleep time in minutes
- `deep_sleep_percentage`: Percentage of deep sleep
- `light_sleep_percentage`: Percentage of light sleep
- `rem_sleep_percentage`: Percentage of REM sleep
- `awake_percentage`: Percentage of awake time
- `sleep_duration_formatted`: Formatted sleep duration (e.g., "8 ชม. 0 นาที")
- `bedtime_formatted`: Formatted bedtime
- `wake_time_formatted`: Formatted wake time
- `sleep_date_formatted`: Formatted sleep date in Thai
- `is_healthy_sleep_duration`: Whether sleep duration is healthy (7-9 hours)
- `is_healthy_sleep_efficiency`: Whether sleep efficiency is healthy (≥85%)
- `is_healthy_time_to_fall_asleep`: Whether time to fall asleep is healthy (10-20 minutes)
- `sleep_score`: Overall sleep score (0-100)
- `sleep_quality_description`: Sleep quality description in Thai
- `sleep_score_description`: Sleep score description in Thai

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "ข้อมูลไม่ถูกต้อง: sleep_duration_hours ต้องอยู่ระหว่าง 0-24"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "ไม่ได้รับอนุญาต"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "ไม่พบบันทึกการนอนนี้"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "ข้อผิดพลาดภายในเซิร์ฟเวอร์"
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- 100 requests per minute per user
- 1000 requests per hour per user

## Frontend Integration

### React Component Example

See `frontend-examples/SleepLogComponent.jsx` for a complete React component implementation.

### JavaScript Usage Example

See `frontend-examples/sleep-log-example.js` for JavaScript usage examples.

### Key Integration Points

1. **Authentication**: Store JWT token and include in all requests
2. **Error Handling**: Implement proper error handling for all API calls
3. **Loading States**: Show loading indicators during API calls
4. **Data Validation**: Validate data before sending to API
5. **Real-time Updates**: Refresh data after create/update/delete operations

## Testing

### Postman Collection

Import the `Sleep-Log-API-Postman-Collection.json` file into Postman for comprehensive API testing.

### Test Data

Use the sample data endpoints to create test data for development and testing.

## Best Practices

1. **Data Validation**: Always validate data on the frontend before sending to the API
2. **Error Handling**: Implement comprehensive error handling for all API calls
3. **Loading States**: Show appropriate loading states during API operations
4. **Caching**: Consider caching frequently accessed data like statistics
5. **Offline Support**: Implement offline support for better user experience
6. **Data Privacy**: Ensure sensitive sleep data is handled securely
7. **Performance**: Use pagination for large datasets
8. **User Feedback**: Provide clear feedback for all user actions

## Support

For technical support or questions about the Sleep Log API, please contact the development team or refer to the main API documentation.
