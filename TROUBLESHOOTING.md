# 🔧 Troubleshooting Guide

## ปัญหาที่พบบ่อยและการแก้ไข

### 1. Error: "fetch failed" และ "Bad Request"

#### สาเหตุ:
- การเชื่อมต่อกับ OpenRouter API ล้มเหลว
- API key ไม่ถูกต้องหรือหมดอายุ
- Network connectivity issues
- Rate limiting จาก OpenRouter

#### การแก้ไข:

##### 1. ตรวจสอบ Environment Variables
```bash
# ตรวจสอบว่าไฟล์ .env มีค่าถูกต้อง
SUPABASE_URL=https://your-project.supabase.co/
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=gpt-4o-mini
```

##### 2. ตรวจสอบ OpenRouter API Key
- เข้าไปที่ [OpenRouter Dashboard](https://openrouter.ai/keys)
- ตรวจสอบว่า API key ยังใช้งานได้
- ตรวจสอบ credit balance
- ตรวจสอบ rate limits

##### 3. ตรวจสอบ Network Connectivity
```bash
# ทดสอบการเชื่อมต่อ
curl -X GET "https://openrouter.ai/api/v1/models" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

##### 4. ตรวจสอบ Logs
```bash
# ดู logs ของ application
npm run start:dev
# หรือ
npm run start:prod
```

### 2. การจัดการ Error ที่ดีขึ้น

#### Features ที่เพิ่มเข้ามา:
1. **Global Exception Filter** - จัดการ error ทั้งหมดในระบบ
2. **Fallback Responses** - ให้คำตอบพื้นฐานเมื่อ AI ไม่สามารถตอบได้
3. **Better Error Messages** - ข้อความ error ที่ชัดเจนและเข้าใจง่าย
4. **Retry Logic** - ลองใหม่เมื่อเกิด network error

#### Error Response Format:
```json
{
  "success": false,
  "message": "ข้อความ error ที่เข้าใจง่าย",
  "error": "รายละเอียด technical error",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/ai/analyze"
}
```

### 3. การทดสอบ API

#### Health Check:
```bash
curl -X GET "http://localhost:3000/api/health"
```

#### Test AI Endpoint:
```bash
curl -X POST "http://localhost:3000/api/ai/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "focus_area": "overall",
    "time_period": "current"
  }'
```

### 4. การ Debug

#### 1. เปิด Debug Logs
```typescript
// ใน main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'debug', 'log', 'verbose'],
});
```

#### 2. ตรวจสอบ OpenRouter Service
```typescript
// ทดสอบการเชื่อมต่อ
const openRouterService = app.get(OpenRouterService);
const isHealthy = await openRouterService.healthCheck();
console.log('OpenRouter Health:', isHealthy);
```

### 5. Fallback Responses

เมื่อ AI ไม่สามารถตอบได้ ระบบจะให้คำตอบพื้นฐาน:

#### Health Analysis Fallback:
- วิเคราะห์ข้อมูลสุขภาพจากข้อมูลที่มีอยู่
- ให้คำแนะนำพื้นฐานตามมาตรฐานสุขภาพ
- ไม่ขึ้นกับการเชื่อมต่อ AI

#### Chat Fallback:
- ข้อความตอบกลับที่เหมาะสม
- แจ้งให้ผู้ใช้ทราบว่ามีปัญหาชั่วคราว
- แนะนำให้ลองใหม่อีกครั้ง

### 6. การปรับแต่ง Configuration

#### Timeout Settings:
```typescript
// ใน openrouter.service.ts
this.axiosInstance = axios.create({
  timeout: 30000, // 30 seconds
});
```

#### Retry Logic:
```typescript
// เพิ่ม retry logic ถ้าต้องการ
const maxRetries = 3;
let retryCount = 0;

while (retryCount < maxRetries) {
  try {
    // API call
    break;
  } catch (error) {
    retryCount++;
    if (retryCount === maxRetries) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
  }
}
```

### 7. การติดต่อ Support

หากยังมีปัญหา กรุณา:

1. ตรวจสอบ logs ของ application
2. ตรวจสอบ environment variables
3. ทดสอบการเชื่อมต่อ OpenRouter API
4. ตรวจสอบ credit balance และ rate limits
5. ส่ง error logs และ environment configuration (ไม่รวม sensitive data)

---

## 🚀 Quick Fix Checklist

- [ ] ตรวจสอบไฟล์ .env
- [ ] ตรวจสอบ OpenRouter API key
- [ ] ทดสอบการเชื่อมต่อ network
- [ ] ตรวจสอบ application logs
- [ ] ทดสอบ API endpoints
- [ ] ตรวจสอบ fallback responses

หากทำตามขั้นตอนทั้งหมดแล้วยังมีปัญหา กรุณาติดต่อทีมพัฒนา
