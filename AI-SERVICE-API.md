# AI Service API Documentation

## Overview
AI Service เป็น API แยกต่างหากที่ให้บริการการวิเคราะห์สุขภาพและคำแนะนำแบบ AI โดยไม่ต้องพึ่งพา Database โดยตรง

## Base URL
```
http://localhost:3000/api/ai-service
```

## Authentication
ทุก endpoint ต้องใช้ JWT Token:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Health Check
```http
GET /api/ai-service/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "AI Service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 1.1. Test AI Service (Public - No Auth Required)
```http
GET /api/ai-service/test
```

**Response:**
```json
{
  "success": true,
  "message": "AI Service is working correctly",
  "data": {
    "user": "User found",
    "healthScores": "Health scores calculated",
    "aiAnalysis": "AI analysis generated",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. วิเคราะห์สุขภาพ
```http
POST /api/ai-service/analyze
```

**Request Body:**
```json
{
  "userId": 1,
  "analysisType": "complete",
  "timeframe": "month",
  "includeRecommendations": true,
  "includeInsights": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "healthScores": {
      "nutritionScore": 85,
      "exerciseScore": 70,
      "sleepScore": 90,
      "waterScore": 75,
      "overallScore": 80
    },
    "aiAnalysis": "การวิเคราะห์สุขภาพโดย AI...",
    "recommendations": { ... },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. สร้างคำแนะนำ
```http
POST /api/ai-service/recommendations
```

**Request Body:**
```json
{
  "userId": 1,
  "category": "nutrition",
  "priority": "high",
  "limit": 5
}
```

### 4. วิเคราะห์โภชนาการ
```http
GET /api/ai-service/nutrition/:userId?date=2024-01-01
```

### 5. วิเคราะห์การออกกำลังกาย
```http
GET /api/ai-service/exercise/:userId?date=2024-01-01
```

### 6. แนะนำอาหาร
```http
GET /api/ai-service/food-recommendations/:userId
```

### 7. แนะนำการออกกำลังกาย
```http
GET /api/ai-service/exercise-recommendations/:userId
```

### 8. บันทึก AI Insight
```http
POST /api/ai-service/insights
```

**Request Body:**
```json
{
  "userId": 1,
  "insightData": {
    "type": "health_analysis",
    "title": "การวิเคราะห์สุขภาพ",
    "description": "ข้อมูลเชิงลึกจาก AI",
    "confidence": 0.85
  }
}
```

## Error Handling

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Frontend Integration

### React/Vue Example
```typescript
// วิเคราะห์สุขภาพ
const analyzeHealth = async (userId: number) => {
  const response = await fetch('/api/ai-service/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      userId: userId,
      analysisType: 'complete',
      timeframe: 'month',
      includeRecommendations: true,
      includeInsights: true
    })
  });
  
  return await response.json();
};

// แนะนำอาหาร
const getFoodRecommendations = async (userId: number) => {
  const response = await fetch(`/api/ai-service/food-recommendations/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

## Architecture Benefits

1. **🔧 Separation of Concerns**: AI Service แยกต่างหาก
2. **⚡ Performance**: ไม่ต้องพึ่งพา Database
3. **🔄 Scalability**: Scale ได้อิสระ
4. **🛡️ Fault Tolerance**: AI ทำงานได้แม้ DB ล้มเหลว
5. **🔌 Flexibility**: เปลี่ยน AI provider ได้ง่าย

## Next Steps

1. ✅ สร้าง AI Service endpoints
2. ✅ ทดสอบ API endpoints
3. 🔄 เชื่อมต่อ Frontend
4. 🔄 เพิ่ม AI features เพิ่มเติม
5. 🔄 Optimize performance
