# Frontend Integration Guide

## การเชื่อมต่อ Frontend กับ AI Service

### 1. สร้าง AI Service Class

```typescript
// src/services/aiService.ts
export class AIService {
  private baseURL = 'http://localhost:3000/api/ai-service';
  
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  // วิเคราะห์สุขภาพ
  async analyzeHealth(userId: number, options: {
    analysisType?: 'complete' | 'nutrition' | 'exercise' | 'sleep' | 'quick';
    timeframe?: 'week' | 'month' | 'quarter';
    includeRecommendations?: boolean;
    includeInsights?: boolean;
  } = {}) {
    // ตรวจสอบ userId
    if (!userId || userId <= 0) {
      throw new Error('User ID not found. Please login again.');
    }

    return this.makeRequest('/analyze', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        analysisType: options.analysisType || 'complete',
        timeframe: options.timeframe || 'month',
        includeRecommendations: options.includeRecommendations ?? true,
        includeInsights: options.includeInsights ?? true,
      }),
    });
  }
  
  // แนะนำอาหาร
  async getFoodRecommendations(userId: number) {
    return this.makeRequest(`/food-recommendations/${userId}`);
  }
  
  // แนะนำการออกกำลังกาย
  async getExerciseRecommendations(userId: number) {
    return this.makeRequest(`/exercise-recommendations/${userId}`);
  }
  
  // วิเคราะห์โภชนาการ
  async analyzeNutrition(userId: number, date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.makeRequest(`/nutrition/${userId}${params}`);
  }
  
  // วิเคราะห์การออกกำลังกาย
  async analyzeExercise(userId: number, date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.makeRequest(`/exercise/${userId}${params}`);
  }
  
  // บันทึก AI Insight
  async saveAIInsight(userId: number, insightData: any) {
    return this.makeRequest('/insights', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        insightData,
      }),
    });
  }
  
  // Health Check
  async healthCheck() {
    return this.makeRequest('/health');
  }
  
  // Test AI Service
  async testAIService() {
    return this.makeRequest('/test');
  }
}
```

### 2. React Component Example

```typescript
// src/components/HealthDashboard.tsx
import React, { useState, useEffect } from 'react';
import { AIService } from '../services/aiService';

interface HealthData {
  user: any;
  healthScores: {
    nutritionScore: number;
    exerciseScore: number;
    sleepScore: number;
    waterScore: number;
    overallScore: number;
  };
  aiAnalysis: string;
  recommendations: any;
}

const HealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(161); // หรือดึงจาก auth context
  
  const aiService = new AIService();
  
  const loadHealthData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiService.analyzeHealth(userId);
      setHealthData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadHealthData();
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!healthData) return <div>No data available</div>;
  
  return (
    <div className="health-dashboard">
      <h2>AI Health Analysis</h2>
      
      <div className="health-scores">
        <h3>Health Scores</h3>
        <div className="score-grid">
          <div className="score-item">
            <span>Overall Score</span>
            <span className="score">{healthData.healthScores.overallScore}</span>
          </div>
          <div className="score-item">
            <span>Nutrition</span>
            <span className="score">{healthData.healthScores.nutritionScore}</span>
          </div>
          <div className="score-item">
            <span>Exercise</span>
            <span className="score">{healthData.healthScores.exerciseScore}</span>
          </div>
          <div className="score-item">
            <span>Sleep</span>
            <span className="score">{healthData.healthScores.sleepScore}</span>
          </div>
          <div className="score-item">
            <span>Water</span>
            <span className="score">{healthData.healthScores.waterScore}</span>
          </div>
        </div>
      </div>
      
      <div className="ai-analysis">
        <h3>AI Analysis</h3>
        <p>{healthData.aiAnalysis}</p>
      </div>
      
      <div className="recommendations">
        <h3>Recommendations</h3>
        <pre>{JSON.stringify(healthData.recommendations, null, 2)}</pre>
      </div>
      
      <button onClick={loadHealthData}>Refresh Analysis</button>
    </div>
  );
};

export default HealthDashboard;
```

### 3. Vue Component Example

```vue
<!-- src/components/HealthDashboard.vue -->
<template>
  <div class="health-dashboard">
    <h2>AI Health Analysis</h2>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">Error: {{ error }}</div>
    <div v-else-if="healthData" class="content">
      <div class="health-scores">
        <h3>Health Scores</h3>
        <div class="score-grid">
          <div class="score-item">
            <span>Overall Score</span>
            <span class="score">{{ healthData.healthScores.overallScore }}</span>
          </div>
          <div class="score-item">
            <span>Nutrition</span>
            <span class="score">{{ healthData.healthScores.nutritionScore }}</span>
          </div>
          <div class="score-item">
            <span>Exercise</span>
            <span class="score">{{ healthData.healthScores.exerciseScore }}</span>
          </div>
          <div class="score-item">
            <span>Sleep</span>
            <span class="score">{{ healthData.healthScores.sleepScore }}</span>
          </div>
          <div class="score-item">
            <span>Water</span>
            <span class="score">{{ healthData.healthScores.waterScore }}</span>
          </div>
        </div>
      </div>
      
      <div class="ai-analysis">
        <h3>AI Analysis</h3>
        <p>{{ healthData.aiAnalysis }}</p>
      </div>
      
      <div class="recommendations">
        <h3>Recommendations</h3>
        <pre>{{ JSON.stringify(healthData.recommendations, null, 2) }}</pre>
      </div>
      
      <button @click="loadHealthData">Refresh Analysis</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AIService } from '../services/aiService';

const healthData = ref(null);
const loading = ref(false);
const error = ref(null);
const userId = ref(161); // หรือดึงจาก auth store

const aiService = new AIService();

const loadHealthData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const result = await aiService.analyzeHealth(userId.value);
    healthData.value = result.data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadHealthData();
});
</script>
```

### 4. Error Handling

```typescript
// src/utils/errorHandler.ts
export class AIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export const handleAIError = (error: any) => {
  if (error instanceof AIError) {
    console.error(`AI Service Error [${error.statusCode}]: ${error.message}`);
    
    switch (error.statusCode) {
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        // Show permission denied message
        alert('You do not have permission to access this feature');
        break;
      case 500:
        // Show server error message
        alert('Server error. Please try again later.');
        break;
      default:
        alert(`Error: ${error.message}`);
    }
  } else {
    console.error('Unexpected error:', error);
    alert('An unexpected error occurred');
  }
};
```

### 5. Testing

```typescript
// src/services/__tests__/aiService.test.ts
import { AIService } from '../aiService';

describe('AIService', () => {
  let aiService: AIService;
  
  beforeEach(() => {
    aiService = new AIService();
  });
  
  test('should perform health check', async () => {
    const result = await aiService.healthCheck();
    expect(result.status).toBe('healthy');
  });
  
  test('should test AI service', async () => {
    const result = await aiService.testAIService();
    expect(result.success).toBe(true);
  });
  
  test('should handle errors gracefully', async () => {
    // Mock fetch to return error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    await expect(aiService.analyzeHealth(999)).rejects.toThrow('Network error');
  });
});
```

## การใช้งาน

1. **Copy AI Service class** ไปใส่ใน frontend project
2. **Import และใช้** ใน components ตามตัวอย่าง
3. **Handle errors** ตาม error handling guide
4. **Test** ด้วย test cases ที่ให้ไว้

## ⚠️ **สำคัญ: Authentication**

### **AI Service Endpoints (ไม่ต้องใช้ Auth):**
- `GET /api/ai-service/health` - Health check
- `GET /api/ai-service/test` - Test AI functionality

### **Protected Endpoints (ต้องใช้ JWT Token):**
- `POST /api/ai-service/analyze` - วิเคราะห์สุขภาพ
- `GET /api/me` - ข้อมูลผู้ใช้ (ต้องมี `/api` prefix)
- `POST /api/ai-service/recommendations` - คำแนะนำ

### **❌ API Endpoints ที่ไม่มี:**
- `/users/profile` (ไม่มี endpoint นี้)
- `/profile` (ไม่มี endpoint นี้)
- `/user/me` (ไม่มี endpoint นี้)
- `/health` (ไม่มี endpoint นี้)

### **✅ API Endpoints ที่มี:**
- `/api/me` - ข้อมูลผู้ใช้
- `/api/health` - Health check
- `/api/ai-service/health` - AI Service health check

### **Login Flow:**
```typescript
// 1. Login เพื่อรับ JWT token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'your_email@example.com',
    password: 'your_password'
  })
});

const { token } = await loginResponse.json();

// 2. เก็บ token ใน localStorage
localStorage.setItem('token', token);

// 3. ใช้ token สำหรับ protected endpoints
const aiService = new AIService(); // จะใช้ token จาก localStorage
```

## หมายเหตุ

- ต้องมี JWT token ใน localStorage
- User ID ต้องถูกต้อง (จาก auth system)
- AI Service มี caching 30 วินาที เพื่อป้องกันการเรียก API หลายครั้ง
- ข้อมูลสุขภาพว่างเปล่าจะได้คำแนะนำพื้นฐานจาก AI

## ⚠️ **ปัญหาที่พบบ่อย:**

### **1. เรียก AI Analysis หลายครั้ง:**
```typescript
// ❌ ผิด - เรียกใน useEffect โดยไม่มี dependency
useEffect(() => {
  loadHealthData(); // จะเรียกทุกครั้งที่ component re-render
});

// ✅ ถูก - ใช้ dependency array
useEffect(() => {
  loadHealthData();
}, [userId]); // เรียกเฉพาะเมื่อ userId เปลี่ยน

// ✅ ถูก - เพิ่ม loading state และ debounce
const [loading, setLoading] = useState(false);
const [lastAnalysis, setLastAnalysis] = useState(null);

const loadHealthData = async () => {
  if (loading) return; // ป้องกันการเรียกซ้ำ
  
  // ตรวจสอบ cache (5 นาที)
  const now = Date.now();
  if (lastAnalysis && (now - lastAnalysis.timestamp) < 300000) {
    console.log('Using cached analysis');
    return lastAnalysis.data;
  }
  
  setLoading(true);
  try {
    const result = await aiService.analyzeHealth(userId);
    setLastAnalysis({ data: result, timestamp: now });
    return result;
  } finally {
    setLoading(false);
  }
};
```

### **2. ข้อมูลสุขภาพว่างเปล่า:**
```typescript
// ตรวจสอบข้อมูลก่อนเรียก AI
if (healthData.foodLogs.length === 0 && 
    healthData.exerciseLogs.length === 0) {
  // แสดงข้อความแนะนำให้บันทึกข้อมูล
  setMessage('กรุณาบันทึกข้อมูลสุขภาพก่อนวิเคราะห์');
  return;
}
```

### **3. JWT Token ไม่ถูกต้อง:**
```typescript
// ตรวจสอบ token ก่อนเรียก API
const token = localStorage.getItem('token');
if (!token) {
  // Redirect to login
  window.location.href = '/login';
  return;
}

// ตรวจสอบ token หมดอายุ
try {
  const response = await fetch('/api/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.status === 401) {
    // Token หมดอายุ - ลบ token และ redirect
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }
} catch (error) {
  console.error('Token validation failed:', error);
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

### **4. ใช้ API Endpoints ที่ถูกต้อง:**
```typescript
// ❌ ผิด - ใช้ endpoints ที่ไม่มี
fetch('/users/profile')
fetch('/profile')
fetch('/user/me')
fetch('/health')

// ✅ ถูก - ใช้ endpoints ที่มี
fetch('/api/me')
fetch('/api/health')
fetch('/api/ai-service/health')
```

### **5. เพิ่ม Debounce เพื่อลดการเรียก API:**
```typescript
// สร้าง debounce function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ใช้ใน component
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500); // รอ 500ms

useEffect(() => {
  if (debouncedSearchTerm) {
    loadHealthData();
  }
}, [debouncedSearchTerm]);
```

### **6. ใช้ Loading States:**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const loadHealthData = async () => {
  if (loading) return; // ป้องกันการเรียกซ้ำ
  
  setLoading(true);
  setError(null);
  
  try {
    const result = await aiService.analyzeHealth(userId);
    setHealthData(result.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// แสดง loading state
if (loading) {
  return <div>กำลังวิเคราะห์ข้อมูล...</div>;
}
```
- API endpoints ต้อง accessible จาก frontend
