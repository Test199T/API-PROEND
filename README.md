<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  <h1 align="center">VITA WISE AI</h1>
  <p align="center">AI-Powered Health Tracking Application Backend</p>
</p>

<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://img.shields.io/badge/NestJS-8.0.0-red.svg" alt="NestJS Version" /></a>
  <a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node.js Version" /></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg" alt="TypeScript" /></a>
  <a href="https://supabase.com/" target="_blank"><img src="https://img.shields.io/badge/Supabase-Backend%20as%20Service-purple.svg" alt="Supabase" /></a>
  <a href="https://jwt.io/" target="_blank"><img src="https://img.shields.io/badge/JWT-Authentication-orange.svg" alt="JWT" /></a>
</p>

## 📋 Description

**VITA WISE AI** เป็นแอปพลิเคชันติดตามสุขภาพที่ขับเคลื่อนด้วย AI ที่พัฒนาด้วย NestJS framework โดยมีจุดมุ่งหมายเพื่อช่วยให้ผู้ใช้ติดตามและปรับปรุงสุขภาพของตนเองผ่านการวิเคราะห์ข้อมูลสุขภาพแบบอัจฉริยะ

### 🚀 Key Features

- **🤖 AI-Powered Health Analysis**: วิเคราะห์ข้อมูลสุขภาพและให้คำแนะนำส่วนบุคคล
- **📊 Comprehensive Health Tracking**: ติดตามอาหาร, การออกกำลังกาย, การนอน, การดื่มน้ำ
- **🎯 Goal Management**: จัดการเป้าหมายสุขภาพและติดตามความคืบหน้า
- **💬 AI Chat Assistant**: แชทกับ AI เพื่อรับคำแนะนำด้านสุขภาพ
- **📱 Real-time Notifications**: การแจ้งเตือนแบบเรียลไทม์
- **🔐 Secure Authentication**: ระบบความปลอดภัยด้วย JWT
- **🌐 RESTful API**: API ที่ออกแบบตามมาตรฐาน REST

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication & Authorization
├── config/               # Configuration files
├── controllers/          # API Controllers
│   ├── ai.controller.ts           # AI Integration APIs
│   ├── ai-insight.controller.ts   # AI Insights Management
│   ├── chat.controller.ts         # Chat Management
│   ├── dashboard.controller.ts    # Dashboard APIs
│   ├── exercise-log.controller.ts # Exercise Logging
│   ├── food-log.controller.ts     # Food Logging
│   ├── health-goal.controller.ts  # Health Goals
│   ├── health-metric.controller.ts # Health Metrics
│   ├── notification.controller.ts  # Notifications
│   ├── sleep-log.controller.ts    # Sleep Logging
│   ├── user.controller.ts         # User Management
│   ├── user-preference.controller.ts # User Preferences
│   └── water-log.controller.ts    # Water Logging
├── dto/                  # Data Transfer Objects
├── entities/             # Database Entities
├── services/             # Business Logic Services
│   ├── ai.service.ts             # AI Analysis Service
│   ├── chat.service.ts           # Chat Management Service
│   ├── dashboard.service.ts      # Dashboard Data Service
│   ├── supabase.service.ts       # Database Operations
│   └── user.service.ts           # User Management Service
└── main.ts               # Application Entry Point
```

## 🗄️ Database Schema

ระบบใช้ **Supabase** เป็น Backend-as-a-Service โดยมีตารางหลักดังนี้:

- **users**: ข้อมูลผู้ใช้
- **health_goals**: เป้าหมายสุขภาพ
- **food_log**: บันทึกการรับประทานอาหาร
- **exercise_log**: บันทึกการออกกำลังกาย
- **sleep_log**: บันทึกการนอน
- **water_log**: บันทึกการดื่มน้ำ
- **health_metrics**: ข้อมูลสุขภาพทั่วไป
- **chat_sessions**: เซสชันการแชท
- **chat_messages**: ข้อความในแชท
- **ai_insights**: ข้อมูลเชิงลึกจาก AI
- **notifications**: การแจ้งเตือน
- **user_preferences**: การตั้งค่าผู้ใช้

## 🔌 API Endpoints

### 🤖 AI Integration APIs (`/api/ai`)

#### AI Data Access
- `GET /api/ai/user-profile/{user_id}` - ข้อมูลโปรไฟล์ผู้ใช้
- `GET /api/ai/health-summary/{user_id}` - สรุปสุขภาพรวม
- `GET /api/ai/food-analysis/{user_id}` - วิเคราะห์โภชนาการ
- `GET /api/ai/exercise-analysis/{user_id}` - วิเคราะห์การออกกำลังกาย
- `GET /api/ai/sleep-analysis/{user_id}` - วิเคราะห์การนอน
- `GET /api/ai/goals-progress/{user_id}` - ความคืบหน้าเป้าหมาย
- `GET /api/ai/health-trends/{user_id}` - แนวโน้มสุขภาพ

#### AI Chat
- `POST /api/ai/chat/start` - เริ่มเซสชันแชทใหม่
- `POST /api/ai/chat/message` - ส่งข้อความไปยัง AI
- `GET /api/ai/chat/history/{session_id}` - ประวัติการแชท
- `POST /api/ai/chat/feedback` - ให้คะแนนการตอบกลับของ AI

#### AI Insights
- `POST /api/ai/analyze` - AI วิเคราะห์ข้อมูลสุขภาพ
- `GET /api/ai/recommendations/{user_id}` - คำแนะนำจาก AI
- `POST /api/ai/insights/save` - บันทึกข้อมูลเชิงลึกจาก AI

### 📊 Core Health APIs
- `GET /api/dashboard/{user_id}` - ข้อมูลแดชบอร์ด
- `GET /api/health-goals/{user_id}` - เป้าหมายสุขภาพ
- `POST /api/food-log` - บันทึกอาหาร
- `POST /api/exercise-log` - บันทึกการออกกำลังกาย
- `POST /api/sleep-log` - บันทึกการนอน
- `POST /api/water-log` - บันทึกการดื่มน้ำ

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm หรือ yarn
- Supabase account และ project

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd API-PROEND
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development
```

4. **Database Setup**
- สร้าง project ใน Supabase
- รัน SQL schema จาก `database/schema.sql`
- อัพเดท environment variables

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Build the application
npm run build
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔒 Security Features

- **JWT Authentication**: ระบบยืนยันตัวตนด้วย JWT tokens
- **Route Guards**: ป้องกันการเข้าถึง API ที่ไม่ได้รับอนุญาต
- **Input Validation**: ตรวจสอบและทำความสะอาดข้อมูลที่รับเข้ามา
- **Rate Limiting**: จำกัดจำนวนคำขอเพื่อป้องกันการใช้งานมากเกินไป
- **CORS Configuration**: ตั้งค่าการเข้าถึงข้ามโดเมน

## 📚 Documentation

- **API Documentation**: `AI_API_ENDPOINTS.md`
- **Implementation Summary**: `AI_API_IMPLEMENTATION_SUMMARY.md`
- **Database Schema**: `หลังบ้าน เจคจบ.txt`

## 🛠️ Technologies Used

- **Backend Framework**: NestJS
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT
- **API Documentation**: OpenAPI/Swagger
- **Testing**: Jest
- **Package Manager**: npm

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

หากมีคำถามหรือต้องการความช่วยเหลือ:

- สร้าง Issue ใน GitHub repository
- ติดต่อทีมพัฒนา
- อ่านเอกสารในโฟลเดอร์ `docs/`

## 🎯 Roadmap

- [ ] Real-time AI analysis
- [ ] Predictive health analytics
- [ ] Voice chat integration
- [ ] Image analysis for food logging
- [ ] Multi-language support
- [ ] Mobile app integration
- [ ] Advanced health metrics
- [ ] Social features

---

<p align="center">
  <strong>Built with ❤️ using NestJS</strong>
</p>
