# 🚀 คู่มือการรันและทดสอบระบบ VITA WISE AI ครบวงจร

## 📌 **ขั้นตอนที่ 1: รัน Backend (NestJS API)**

### 1.1 เริ่มต้น Backend Server
```bash
cd /Volumes/P1Back/API-PROEND

# รันในโหมด Development (แนะนำ)
npm run start:dev

# หรือรันปกติ
npm run start

# หรือรัน Production build
npm run build && npm run start:prod
```

### 1.2 ตรวจสอบ Backend ทำงาน
```bash
# ตรวจสอบว่า Server รันบน Port 3000
curl http://localhost:3000

# ทดสอบ Health Check
curl http://localhost:3000/auth/login

# ดู Logs ของ Server
tail -f logs/application.log  # ถ้ามี logging file
```

### 1.3 Backend URLs สำคัญ
- **API Base URL**: `http://localhost:3000`
- **Authentication**: `POST /auth/login`, `POST /auth/register`
- **Profile API**: `GET /users/profile/complete`, `PUT /users/profile`
- **Health APIs**: `/health-goals`, `/food-log`, `/exercise-log`, `/sleep-log`

---

## 🌐 **ขั้นตอนที่ 2: สร้างและรัน Frontend**

### 2.1 สร้าง Frontend Project ใหม่

#### **ตัวเลือก A: React + Vite (แนะนำ)**
```bash
# สร้าง React project
cd /Volumes/P1Back/
npx create-vite@latest VITA-WISE-FRONTEND --template react-ts
cd VITA-WISE-FRONTEND

# ติดตั้ง dependencies
npm install

# เพิ่ม libraries สำหรับ UI และ HTTP
npm install axios react-router-dom @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material date-fns recharts

# รัน Frontend
npm run dev
```

#### **ตัวเลือก B: Next.js (Full-stack)**
```bash
cd /Volumes/P1Back/
npx create-next-app@latest vita-wise-frontend --typescript --tailwind --eslint --app
cd vita-wise-frontend

npm install axios @mui/material @emotion/react @emotion/styled
npm run dev
```

#### **ตัวเลือก C: Vue.js**
```bash
cd /Volumes/P1Back/
npm create vue@latest vita-wise-frontend
cd vita-wise-frontend

npm install
npm install axios vue-router@4 @vue/composition-api
npm run dev
```

### 2.2 Frontend Configuration

#### **Axios API Configuration (src/api/config.js)**
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

#### **Auth Service (src/services/authService.js)**
```javascript
import apiClient from '../api/config';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
  }
};
```

#### **Profile Service (src/services/profileService.js)**
```javascript
import apiClient from '../api/config';

export const profileService = {
  async getCompleteProfile() {
    const response = await apiClient.get('/users/profile/complete');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  }
};
```

### 2.3 Frontend URLs
- **Development Server**: `http://localhost:5173` (Vite) หรือ `http://localhost:3001` (Next.js)
- **Production Build**: `npm run build` แล้ว serve จาก `dist/` folder

---

## 🧪 **ขั้นตอนที่ 3: การทดสอบระบบครบวงจร**

### 3.1 ทดสอบ Backend อย่างเดียว

#### **A. ใช้ REST Client (VS Code)**
```bash
# เปิดไฟล์ test-profile-api.http
# คลิก "Send Request" เหนือแต่ละ request
```

#### **B. ใช้ Terminal/cURL**
```bash
# รันสคริปต์ทดสอบอัตโนมัติ
cd /Volumes/P1Back/API-PROEND
bash test-profile-quick.sh
```

#### **C. ใช้ Postman**
```bash
# Import VITA-WISE-AI-Postman-Collection.json ใน Postman
# ตั้งค่า Environment variables
# รัน Collection tests
```

### 3.2 ทดสอบ Frontend + Backend Integration

#### **A. Manual Testing**
1. เปิด Backend: `http://localhost:3000`
2. เปิด Frontend: `http://localhost:5173`
3. ทดสอบ User Flow:
   - Register → Login → View Profile → Update Profile

#### **B. E2E Testing**
```bash
# ติดตั้ง Cypress หรือ Playwright
npm install --save-dev cypress
npx cypress open

# หรือ Playwright
npm install --save-dev @playwright/test
npx playwright test
```

### 3.3 ทดสอบ Performance
```bash
# Load Testing ด้วย Artillery
npm install -g artillery
artillery quick --count 10 --num 5 http://localhost:3000/auth/login

# หรือ ab (Apache Bench)
ab -n 100 -c 10 http://localhost:3000/users/profile/complete
```

---

## 🐳 **ขั้นตอนที่ 4: การ Deploy (Production)**

### 4.1 Backend Deployment

#### **Docker Configuration**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

```bash
# Build และรัน Docker
docker build -t vita-wise-backend .
docker run -p 3000:3000 vita-wise-backend
```

#### **Heroku Deployment**
```bash
# ติดตั้ง Heroku CLI
heroku create vita-wise-api
heroku config:set NODE_ENV=production
git push heroku main
```

### 4.2 Frontend Deployment

#### **Vercel (แนะนำสำหรับ React/Next.js)**
```bash
npm install -g vercel
vercel --prod
```

#### **Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

### 4.3 Database (Supabase Production)
- ใช้ Supabase Production URL
- อัพเดท Environment Variables
- รัน Migration Scripts

---

## 📊 **ขั้นตอนที่ 5: Monitoring และ Maintenance**

### 5.1 Logging
```bash
# Backend Logs
tail -f logs/application.log

# Frontend Logs (Browser Console)
# Network Tab ใน Developer Tools
```

### 5.2 Health Checks
```bash
# Backend Health
curl http://localhost:3000/health

# Database Health  
curl http://localhost:3000/db/health
```

### 5.3 Error Monitoring
- **Sentry** สำหรับ Error Tracking
- **LogRocket** สำหรับ User Session Recording
- **New Relic** สำหรับ Performance Monitoring

---

## 🎯 **Quick Start Commands**

### รัน Development Environment
```bash
# Terminal 1: Backend
cd /Volumes/P1Back/API-PROEND
npm run start:dev

# Terminal 2: Frontend  
cd /Volumes/P1Back/VITA-WISE-FRONTEND
npm run dev

# Terminal 3: Testing
cd /Volumes/P1Back/API-PROEND  
bash test-profile-quick.sh
```

### URLs สำคัญ
- **Backend API**: http://localhost:3000
- **Frontend Dev**: http://localhost:5173 
- **Supabase Dashboard**: https://supabase.com/dashboard
- **API Documentation**: http://localhost:3000/api (ถ้าใช้ Swagger)

---

## 🛠️ **Troubleshooting**

### ปัญหาที่พบบ่อย
| ปัญหา | วิธีแก้ |
|-------|---------|
| CORS Error | เพิ่ม CORS config ใน main.ts |
| Connection Refused | ตรวจสอบ Backend รันอยู่หรือไม่ |
| 401 Unauthorized | ตรวจสอบ JWT Token |
| Database Error | ตรวจสอบ Supabase connection |

### Commands แก้ปัญหา
```bash
# ล้าง Cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# ตรวจสอบ Port ที่ใช้
lsof -i :3000
lsof -i :5173

# Kill Process
kill -9 $(lsof -t -i:3000)
```

**Happy Coding! 🚀**
