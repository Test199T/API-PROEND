# VITA WISE AI - API Endpoints Documentation

## 🚀 AI Integration API Endpoints

API endpoints สำหรับการเชื่อมต่อกับ AI และการวิเคราะห์ข้อมูลสุขภาพ

---

## 📊 AI Data Access Endpoints

### 1. Get User Profile
**GET** `/api/ai/user-profile/{user_id}`

ดึงข้อมูลโปรไฟล์ผู้ใช้สำหรับ AI analysis

**Parameters:**
- `user_id` (path): ID ของผู้ใช้

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "first_name": "ทดสอบ",
      "last_name": "ผู้ใช้",
      "email": "test@example.com",
      "date_of_birth": "1990-01-01",
      "gender": "male",
      "height_cm": 170.0,
      "weight_kg": 70.0,
      "activity_level": "moderately_active"
    },
    "health_goals": [...],
    "preferences": {...}
  }
}
```

### 2. Get Health Summary
**GET** `/api/ai/health-summary/{user_id}?date={date}`

ดึงสรุปสุขภาพประจำวันสำหรับ AI analysis

**Parameters:**
- `user_id` (path): ID ของผู้ใช้
- `date` (query): วันที่ (optional, default: today)

**Response:**
```json
{
  "success": true,
  "message": "Health summary retrieved successfully",
  "data": {
    "date": "2024-01-15",
    "daily_summary": {...},
    "health_metrics": [...],
    "food_logs": [...],
    "exercise_logs": [...]
  }
}
```

### 3. Get Food Analysis
**GET** `/api/ai/food-analysis/{user_id}?date={date}`

วิเคราะห์ข้อมูลโภชนาการสำหรับ AI

**Parameters:**
- `user_id` (path): ID ของผู้ใช้
- `date` (query): วันที่ (optional)

**Response:**
```json
{
  "success": true,
  "message": "Food analysis completed successfully",
  "data": {
    "analysis": {
      "total_calories": 1800,
      "total_protein": 85,
      "total_carbs": 220,
      "total_fat": 65,
      "nutrition_score": 85,
      "recommendations": [...],
      "insights": [...]
    },
    "recommendations": {
      "daily_calories": 2000,
      "meal_suggestions": {...},
      "food_groups": [...]
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Get Exercise Analysis
**GET** `/api/ai/exercise-analysis/{user_id}?date={date}`

วิเคราะห์ข้อมูลการออกกำลังกายสำหรับ AI

**Parameters:**
- `user_id` (path): ID ของผู้ใช้
- `date` (query): วันที่ (optional)

**Response:**
```json
{
  "success": true,
  "message": "Exercise analysis completed successfully",
  "data": {
    "analysis": {
      "total_exercises": 3,
      "total_duration": 90,
      "total_calories_burned": 450,
      "exercise_score": 85,
      "recommendations": [...],
      "insights": [...]
    },
    "recommendations": {
      "weekly_plan": {...},
      "exercise_types": [...],
      "safety_tips": [...]
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Get Sleep Analysis
**GET** `/api/ai/sleep-analysis/{user_id}?date={date}`

วิเคราะห์ข้อมูลการนอนสำหรับ AI

**Parameters:**
- `user_id` (path): ID ของผู้ใช้
- `date` (query): วันที่ (optional)

**Response:**
```json
{
  "success": true,
  "message": "Sleep analysis completed successfully",
  "data": {
    "total_sleep_hours": 7.5,
    "average_sleep_quality": 8.2,
    "sleep_pattern": {...},
    "recommendations": [
      "ควรนอนให้ได้ 7-9 ชั่วโมงต่อคืน"
    ],
    "insights": [
      "นอนเฉลี่ย 7.5 ชั่วโมงต่อคืน",
      "คุณภาพการนอนเฉลี่ย 8.2/10"
    ]
  }
}
```

### 6. Get Goals Progress
**GET** `/api/ai/goals-progress/{user_id}`

ดึงความคืบหน้าเป้าหมายสุขภาพสำหรับ AI

**Parameters:**
- `user_id` (path): ID ของผู้ใช้

**Response:**
```json
{
  "success": true,
  "message": "Goals progress retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "ลดน้ำหนัก 5 กิโลกรัม",
      "goal_type": "weight_loss",
      "target_value": 5.0,
      "current_value": 2.5,
      "unit": "kg",
      "progress_percentage": 50,
      "status": "active",
      "priority": "high"
    }
  ]
}
```

### 7. Get Health Trends
**GET** `/api/ai/health-trends/{user_id}?days={days}`

วิเคราะห์แนวโน้มสุขภาพสำหรับ AI

**Parameters:**
- `user_id` (path): ID ของผู้ใช้
- `days` (query): จำนวนวัน (default: 30)

**Response:**
```json
{
  "success": true,
  "message": "Health trends analyzed successfully",
  "data": {
    "period": "30 days",
    "start_date": "2023-12-16",
    "end_date": "2024-01-15",
    "nutrition_trend": {
      "trend": "improving",
      "average_calories": 1850,
      "data_points": 25,
      "message": "Average daily calories: 1850"
    },
    "exercise_trend": {
      "trend": "stable",
      "average_duration": 45,
      "data_points": 20,
      "message": "Average daily exercise duration: 45 minutes"
    },
    "overall_health_score": 85
  }
}
```

---

## 💬 AI Chat Endpoints

### 1. Start Chat Session
**POST** `/ai/chat/start`

เริ่มเซสชันแชทใหม่กับ AI พร้อมสร้างหัวข้ออัตโนมัติ

**Request Body:**
```json
{
  "title": "คำแนะนำด้านสุขภาพ", // optional - ถ้าไม่ระบุ AI จะสร้างหัวข้ออัตโนมัติ
  "initial_message": "ฉันต้องการคำแนะนำเรื่องการออกกำลังกาย" // optional - ข้อความเริ่มต้น
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat session started successfully",
  "data": {
    "session": {
      "id": 1,
      "user_id": 1,
      "session_title": "คำแนะนำการออกกำลังกาย", // หัวข้อที่ AI สร้างอัตโนมัติ
      "ai_model": "OpenRouter AI",
      "created_at": "2024-01-15T10:30:00Z",
      "is_active": true
    },
    "userMessage": {
      "id": 1,
      "session_id": 1,
      "message_text": "ฉันต้องการคำแนะนำเรื่องการออกกำลังกาย",
      "is_user_message": true,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "aiMessage": {
      "id": 2,
      "session_id": 1,
      "message_text": "ยินดีให้คำแนะนำเรื่องการออกกำลังกายครับ...",
      "is_user_message": false,
      "timestamp": "2024-01-15T10:30:05Z"
    }
  }
}
```

**หมายเหตุ:**
- ถ้าไม่ระบุ `title` และมี `initial_message` AI จะสร้างหัวข้ออัตโนมัติตามเนื้อหาข้อความ
- หัวข้ออัตโนมัติจะสั้น กระชับ และสื่อความหมายในภาษาไทย
- ถ้าไม่มีทั้ง `title` และ `initial_message` จะใช้หัวข้อเริ่มต้น: "แชทสุขภาพ [วันที่]"

### 2. Send Chat Message
**POST** `/ai/chat/message`

ส่งข้อความไปยัง AI และรับการตอบกลับ

**Request Body:**
```json
{
  "session_id": 1,
  "message": "ฉันควรออกกำลังกายอย่างไร?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": "การออกกำลังกายที่ดีควรเริ่มต้นจาก...",
    "suggestions": [
      "เริ่มด้วยการเดินเร็ว 30 นาทีต่อวัน",
      "เพิ่มการออกกำลังกายแบบ bodyweight exercises"
    ],
    "healthInsights": [
      "การออกกำลังกายช่วยลดความเสี่ยงโรคหัวใจ"
    ],
    "followUpQuestions": [
      "คุณชอบการออกกำลังกายแบบไหน?"
    ]
  }
}
```

### 3. Get Chat History
**GET** `/ai/chat/history/{session_id}`

ดึงประวัติการแชทในเซสชัน

**Parameters:**
- `session_id` (path): ID ของเซสชันแชท

**Response:**
```json
{
  "success": true,
  "message": "Chat history retrieved successfully",
  "data": [
    {
      "id": 1,
      "session_id": 1,
      "user_id": 1,
      "message_text": "ฉันควรออกกำลังกายอย่างไร?",
      "is_user_message": true,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "session_id": 1,
      "user_id": 1,
      "message_text": "การออกกำลังกายที่ดีควรเริ่มต้นจาก...",
      "is_user_message": false,
      "timestamp": "2024-01-15T10:30:05Z"
    }
  ]
}
```

### 4. Submit Chat Feedback
**POST** `/ai/chat/feedback`

ให้คะแนนการตอบกลับของ AI

**Request Body:**
```json
{
  "message_id": 2,
  "rating": 5,
  "feedback": "คำแนะนำดีมาก ใช้งานได้จริง"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {}
}
```

---

## 🤖 AI Insights Endpoints

### 1. Analyze Health Data
**POST** `/api/ai/analyze`

วิเคราะห์ข้อมูลสุขภาพโดย AI

**Request Body:**
```json
{
  "focus_area": "nutrition",
  "time_period": "weekly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Health data analysis completed successfully",
  "data": {
    "health_analysis": {
      "nutritionScore": 85,
      "exerciseScore": 78,
      "sleepScore": 82,
      "waterScore": 75,
      "overallScore": 80,
      "recommendations": [...],
      "insights": [...],
      "riskFactors": [...]
    },
    "ai_recommendations": [
      {
        "type": "nutrition",
        "title": "ปรับปรุงโภชนาการ",
        "description": "ควรเพิ่มการรับประทานผักผลไม้",
        "priority": "medium",
        "actionable": true,
        "estimatedImpact": 0.8,
        "timeToImplement": "1-2 สัปดาห์"
      }
    ],
    "focus_area": "nutrition",
    "time_period": "weekly",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get AI Recommendations
**GET** `/api/ai/recommendations/{user_id}`

ดึงคำแนะนำจาก AI

**Parameters:**
- `user_id` (path): ID ของผู้ใช้

**Response:**
```json
{
  "success": true,
  "message": "AI recommendations retrieved successfully",
  "data": [
    {
      "type": "exercise",
      "title": "เพิ่มการออกกำลังกาย",
      "description": "ควรเพิ่มความถี่การออกกำลังกาย",
      "priority": "high",
      "actionable": true,
      "estimatedImpact": 0.9,
      "timeToImplement": "2-3 สัปดาห์"
    }
  ]
}
```

### 3. Save AI Insight
**POST** `/api/ai/insights/save`

บันทึกข้อมูลเชิงลึกจาก AI

**Request Body:**
```json
{
  "type": "health_trend",
  "title": "แนวโน้มสุขภาพดีขึ้น",
  "description": "สุขภาพโดยรวมดีขึ้น 10% ในเดือนที่ผ่านมา",
  "confidence": 0.85,
  "data_sources": ["food_logs", "exercise_logs"],
  "actionable_items": [
    "รักษาพฤติกรรมที่ดี",
    "เพิ่มการออกกำลังกาย"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI insight saved successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "insight_type": "health_trend",
    "title": "แนวโน้มสุขภาพดีขึ้น",
    "description": "สุขภาพโดยรวมดีขึ้น 10% ในเดือนที่ผ่านมา",
    "confidence_score": 0.85,
    "data_sources": ["food_logs", "exercise_logs"],
    "actionable_items": [...],
    "created_at": "2024-01-15T10:30:00Z",
    "expires_at": "2024-02-14T10:30:00Z",
    "is_implemented": false
  }
}
```

---

## 🎯 ตัวอย่างการสร้างหัวข้ออัตโนมัติ

### ตัวอย่างที่ 1: เริ่มแชทโดยไม่ระบุหัวข้อ
**Request:**
```json
POST /ai/chat/start
{
  "initial_message": "ฉันต้องการคำแนะนำเรื่องการลดน้ำหนัก"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "session_title": "คำแนะนำการลดน้ำหนัก" // AI สร้างอัตโนมัติ
    }
  }
}
```

### ตัวอย่างที่ 2: เริ่มแชทพร้อมระบุหัวข้อ
**Request:**
```json
POST /ai/chat/start
{
  "title": "ปรึกษาปัญหาการนอน",
  "initial_message": "ฉันนอนไม่หลับมาหลายวันแล้ว"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "session_title": "ปรึกษาปัญหาการนอน" // ใช้หัวข้อที่ระบุ
    }
  }
}
```

### ตัวอย่างที่ 3: เริ่มแชทแบบง่าย
**Request:**
```json
POST /ai/chat/start
{}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "session_title": "แชทสุขภาพ 31/8/2568" // หัวข้อเริ่มต้น
    }
  }
}
```

---

## 📝 การใช้งานใน Postman

---

## 🔐 Authentication & Authorization

ทุก endpoints ต้องใช้ JWT token ใน Authorization header:

```
Authorization: Bearer <jwt_token>
```

**Security Features:**
- User ID validation - ผู้ใช้สามารถเข้าถึงข้อมูลของตัวเองเท่านั้น
- JWT token verification
- Rate limiting (ในอนาคต)
- Input validation และ sanitization

---

## 📊 Response Format

ทุก endpoints ใช้ response format เดียวกัน:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🚀 Usage Examples

### 1. การวิเคราะห์สุขภาพแบบครบถ้วน
```bash
# 1. ดึงข้อมูลสุขภาพ
GET /api/ai/health-summary/1

# 2. วิเคราะห์ข้อมูล
POST /api/ai/analyze
{
  "focus_area": "overall",
  "time_period": "monthly"
}

# 3. ดึงคำแนะนำ
GET /api/ai/recommendations/1
```

### 2. การแชทกับ AI
```bash
# 1. เริ่มเซสชัน (สร้างหัวข้ออัตโนมัติ)
POST /ai/chat/start
{
  "initial_message": "ฉันต้องการคำแนะนำเรื่องการออกกำลังกาย"
}

# 2. ส่งข้อความ
POST /ai/chat/message
{
  "session_id": 1,
  "message": "ฉันควรรับประทานอาหารอย่างไร?"
}

# 3. ดึงประวัติ
GET /ai/chat/history/1
```

### 3. การติดตามแนวโน้มสุขภาพ
```bash
# วิเคราะห์แนวโน้ม 7 วัน
GET /api/ai/health-trends/1?days=7

# วิเคราะห์แนวโน้ม 30 วัน
GET /api/ai/health-trends/1?days=30
```

---

## 🔧 Error Handling

### Common Error Codes
- `400` - Bad Request (ข้อมูลไม่ถูกต้อง)
- `401` - Unauthorized (ไม่มี token หรือ token หมดอายุ)
- `403` - Forbidden (ไม่มีสิทธิ์เข้าถึง)
- `404` - Not Found (ไม่พบข้อมูล)
- `500` - Internal Server Error (ข้อผิดพลาดภายในระบบ)

### Error Response Example
```json
{
  "success": false,
  "message": "Failed to retrieve user profile",
  "error": "User not found",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 📈 Performance Considerations

### Caching
- ข้อมูลสุขภาพประจำวัน cache ไว้ 1 ชั่วโมง
- ข้อมูลแนวโน้ม cache ไว้ 6 ชั่วโมง
- คำแนะนำจาก AI cache ไว้ 24 ชั่วโมง

### Rate Limiting
- 100 requests ต่อ minute ต่อ user
- 1000 requests ต่อ hour ต่อ user

### Data Pagination
- รองรับ pagination สำหรับข้อมูลจำนวนมาก
- Default limit: 50 items per page
- Maximum limit: 200 items per page

---

## 🔮 Future Enhancements

### Planned Features
1. **Real-time AI Analysis** - การวิเคราะห์แบบ real-time
2. **Predictive Analytics** - การทำนายแนวโน้มสุขภาพ
3. **Personalized AI Models** - AI model เฉพาะบุคคล
4. **Voice Chat Integration** - การแชทด้วยเสียง
5. **Image Analysis** - การวิเคราะห์รูปภาพอาหาร
6. **Multi-language Support** - รองรับหลายภาษา

### API Versioning
- รองรับ API versioning (v1, v2, etc.)
- Backward compatibility
- Deprecation warnings

---

## 📞 Support & Documentation

### Technical Support
- Email: tech-support@vitawise.com
- Documentation: https://docs.vitawise.com/api
- GitHub Issues: https://github.com/vitawise/api/issues

### API Status
- Status Page: https://status.vitawise.com
- Uptime: 99.9%
- Response Time: < 200ms (95th percentile)

---

## 📝 Changelog

### Version 1.0.0 (2024-01-15)
- ✅ Initial AI API endpoints
- ✅ User profile access
- ✅ Health data analysis
- ✅ AI chat functionality
- ✅ AI insights generation
- ✅ Health trends analysis

### Upcoming Versions
- Version 1.1.0 - Enhanced AI models
- Version 1.2.0 - Real-time analysis
- Version 2.0.0 - Predictive analytics

---

**© 2024 VITA WISE AI. All rights reserved.**
