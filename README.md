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

- **🤖 AI-Powered Health Analysis**: วิเคราะห์ข้อมูลสุขภาพและให้คำแนะนำส่วนบุคคลด้วย OpenRouter AI
- **📊 Comprehensive Health Tracking**: ติดตามอาหาร, การออกกำลังกาย, การนอน, การดื่มน้ำ
- **🎯 Goal Management**: จัดการเป้าหมายสุขภาพและติดตามความคืบหน้า
- **💬 AI Chat Assistant**: แชทกับ AI เพื่อรับคำแนะนำด้านสุขภาพแบบเรียลไทม์
- **📱 Real-time Notifications**: การแจ้งเตือนแบบเรียลไทม์
- **🔐 Secure Authentication**: ระบบความปลอดภัยด้วย JWT
- **🌐 RESTful API**: API ที่ออกแบบตามมาตรฐาน REST
- **🧠 Advanced AI Integration**: เชื่อมต่อกับ OpenRouter สำหรับ LLM capabilities

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
│   ├── openrouter.service.ts     # OpenRouter AI Integration Service
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

**System Requirements:**
- **Operating System**: Windows 10/11, macOS 10.15+, หรือ Linux (Ubuntu 18.04+)
- **Node.js**: เวอร์ชัน 18.0.0 หรือสูงกว่า
- **npm**: เวอร์ชัน 8.0.0 หรือสูงกว่า (มาพร้อมกับ Node.js)
- **Git**: สำหรับ clone repository

**External Services:**
- **Supabase Account**: สร้าง account ที่ [supabase.com](https://supabase.com)
- **OpenRouter Account**: สร้าง account ที่ [openrouter.ai](https://openrouter.ai) สำหรับ AI API

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd API-PROEND
```

2. **Install Node.js Dependencies**
```bash
# Install all required packages
npm install

# หรือใช้ yarn (ถ้าต้องการ)
yarn install
```

3. **Required Packages ที่จะติดตั้งอัตโนมัติ:**
```bash
# Core Framework
@nestjs/common @nestjs/core @nestjs/platform-express
@nestjs/config @nestjs/typeorm

# Database & ORM
@supabase/supabase-js
typeorm pg

# Authentication
jsonwebtoken @types/jsonwebtoken
bcrypt @types/bcrypt

# AI Integration
axios

# Validation & Security
class-validator class-transformer
helmet

# Development Tools
@nestjs/cli
typescript @types/node
jest @types/jest
```

4. **Environment Configuration**
สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=gpt-4o-mini  # หรือ model อื่นๆ ที่ต้องการ

# Application Configuration
PORT=3000
NODE_ENV=development
```

5. **Database Setup**
```sql
-- สร้าง project ใน Supabase แล้วรัน SQL schema นี้:

-- ตารางผู้ใช้
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- ตารางอื่นๆ (health_goals, food_log, exercise_log, etc.)
-- ดูรายละเอียดในไฟล์ database/schema.sql
```

6. **Supabase Project Setup**
- ไปที่ [supabase.com](https://supabase.com)
- สร้าง project ใหม่
- ไปที่ Settings > API
- คัดลอก URL และ API Keys
- อัพเดทไฟล์ `.env`

7. **OpenRouter API Setup**
- ไปที่ [openrouter.ai](https://openrouter.ai)
- สร้าง account และ API key
- อัพเดท `OPENROUTER_API_KEY` ในไฟล์ `.env`

### Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod

# Build the application
npm run build

# Start built application
npm run start
```

### Verification Steps

1. **ตรวจสอบการเชื่อมต่อ Database:**
```bash
# เรียก API endpoint
GET http://localhost:3000/health
```

2. **ทดสอบ Authentication:**
```bash
# ทดสอบการสมัครสมาชิก
POST http://localhost:3000/auth/register
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "ทดสอบ",
  "lastName": "ผู้ใช้"
}
```

3. **ทดสอบ AI Integration:**
```bash
# ทดสอบ Health Analysis
POST http://localhost:3000/ai/analyze
Authorization: Bearer <your_jwt_token>
{
  "focus_area": "overall",
  "time_period": "current"
}
```

### Troubleshooting

**ปัญหาที่พบบ่อย:**

1. **"fetch failed" error:**
   - ตรวจสอบ `OPENROUTER_API_KEY` ใน `.env`
   - ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต

2. **"Cannot connect to database":**
   - ตรวจสอบ `SUPABASE_URL` และ `SUPABASE_ANON_KEY`
   - ตรวจสอบ Supabase project status

3. **"Invalid token" error:**
   - ตรวจสอบ `JWT_SECRET` ใน `.env`
   - ตรวจสอบ token expiration

4. **Port already in use:**
   - เปลี่ยน `PORT` ใน `.env` หรือ
   - หยุด process ที่ใช้ port 3000

### Development Tools

**แนะนำให้ติดตั้ง:**
- **Postman** หรือ **Insomnia**: สำหรับทดสอบ API
- **VS Code**: Editor ที่แนะนำ พร้อม extensions:
  - NestJS Snippets
  - TypeScript Importer
  - REST Client
- **Git GUI**: เช่น SourceTree, GitKraken

## 🧪 Testing

### Testing Framework

ระบบใช้ **Jest** เป็น testing framework หลัก พร้อมกับ **Supertest** สำหรับ API testing

### Test Types

#### 1. **Unit Tests** (`*.spec.ts`)
- ทดสอบ individual functions และ methods
- ใช้ `@nestjs/testing` สำหรับ mocking
- รันด้วย `npm run test`

#### 2. **E2E Tests** (`*.e2e-spec.ts`)
- ทดสอบ API endpoints แบบ end-to-end
- ใช้ `supertest` สำหรับ HTTP requests
- รันด้วย `npm run test:e2e`

### Running Tests

```bash
# Unit Tests
npm run test              # รัน unit tests ครั้งเดียว
npm run test:watch        # รัน tests แบบ watch mode
npm run test:cov          # รัน tests พร้อม coverage report
npm run test:debug        # รัน tests แบบ debug mode

# E2E Tests
npm run test:e2e          # รัน end-to-end tests

# All Tests
npm run test && npm run test:e2e  # รันทั้ง unit และ e2e tests
```

### Test Structure

```
test/
├── app.e2e-spec.ts       # E2E tests สำหรับ AppController
└── jest-e2e.json         # Jest configuration สำหรับ E2E tests

src/
├── app.controller.spec.ts # Unit tests สำหรับ AppController
├── auth/
│   ├── auth.controller.spec.ts
│   └── auth.service.spec.ts
└── services/
    ├── ai.service.spec.ts
    └── chat.service.spec.ts
```

### Writing Unit Tests

#### Example: Service Test
```typescript
// src/services/ai.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { OpenRouterService } from './openrouter.service';

describe('AiService', () => {
  let service: AiService;
  let openRouterService: OpenRouterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: OpenRouterService,
          useValue: {
            analyzeHealthData: jest.fn(),
            generateRecommendations: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    openRouterService = module.get<OpenRouterService>(OpenRouterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeUserHealth', () => {
    it('should return health analysis', async () => {
      const mockAnalysis = 'สุขภาพของคุณดีมาก';
      jest.spyOn(openRouterService, 'analyzeHealthData')
        .mockResolvedValue(mockAnalysis);

      const result = await service.analyzeUserHealth(1, 'overall');
      expect(result).toContain(mockAnalysis);
    });

    it('should use fallback when AI fails', async () => {
      jest.spyOn(openRouterService, 'analyzeHealthData')
        .mockRejectedValue(new Error('API Error'));

      const result = await service.analyzeUserHealth(1, 'overall');
      expect(result).toContain('ขออภัย');
    });
  });
});
```

#### Example: Controller Test
```typescript
// src/controllers/ai.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from '../services/ai.service';

describe('AiController', () => {
  let controller: AiController;
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: {
            analyzeUserHealth: jest.fn(),
            generateAIRecommendations: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('analyze', () => {
    it('should return health analysis', async () => {
      const mockResult = { analysis: 'สุขภาพดี' };
      jest.spyOn(service, 'analyzeUserHealth').mockResolvedValue(mockResult);

      const result = await controller.analyze(1, { focus_area: 'overall' });
      expect(result).toEqual(mockResult);
    });
  });
});
```

### Writing E2E Tests

#### Example: Authentication E2E Test
```typescript
// test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'ทดสอบ',
          lastName: 'ผู้ใช้'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'ทดสอบ',
          lastName: 'ผู้ใช้'
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login existing user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });
});
```

#### Example: AI API E2E Test
```typescript
// test/ai.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AI API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token for testing
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/ai/analyze (POST)', () => {
    it('should analyze health data', () => {
      return request(app.getHttpServer())
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          focus_area: 'overall',
          time_period: 'current'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.analysis).toBeDefined();
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/ai/analyze')
        .send({
          focus_area: 'overall',
          time_period: 'current'
        })
        .expect(401);
    });
  });

  describe('/ai/chat/start (POST)', () => {
    it('should start chat session', () => {
      return request(app.getHttpServer())
        .post('/ai/chat/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          initial_message: 'สวัสดีครับ'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.session_id).toBeDefined();
          expect(res.body.ai_response).toBeDefined();
        });
    });
  });
});
```

### Test Configuration

#### Jest Configuration (package.json)
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

#### E2E Jest Configuration (test/jest-e2e.json)
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

### Test Coverage

```bash
# รัน tests พร้อม coverage report
npm run test:cov

# ดู coverage report ใน browser
open coverage/lcov-report/index.html
```

**Coverage Goals:**
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### Testing Best Practices

1. **Test Naming**: ใช้ชื่อที่อธิบายพฤติกรรมที่ต้องการทดสอบ
2. **Arrange-Act-Assert**: จัดระเบียบ test code ให้ชัดเจน
3. **Mocking**: Mock external dependencies และ services
4. **Test Isolation**: แต่ละ test ต้องเป็นอิสระต่อกัน
5. **Edge Cases**: ทดสอบกรณีผิดปกติและ boundary conditions
6. **Integration Tests**: ทดสอบการทำงานร่วมกันของ components

### Debugging Tests

```bash
# Debug unit tests
npm run test:debug

# Debug specific test file
npm run test -- --testNamePattern="should register new user"

# Run tests with verbose output
npm run test -- --verbose
```

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
      - run: npm run test:cov
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
- **AI Integration**: OpenRouter API
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
