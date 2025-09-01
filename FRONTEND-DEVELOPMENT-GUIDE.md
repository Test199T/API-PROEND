# 📋 Frontend Development Guide - VITA WISE AI

## 🎯 **API Endpoints ที่ Frontend ต้องใช้**

### Authentication APIs
```javascript
// 1. Register User
POST /auth/register
Body: {
  "email": "user@example.com",
  "password": "password123", 
  "firstName": "ชื่อ",
  "lastName": "นามสกุล"
}

// 2. Login User  
POST /auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
Response: { "access_token": "JWT_TOKEN", "user": {...} }
```

### Profile APIs
```javascript
// 3. Get Complete Profile
GET /users/profile/complete
Headers: { "Authorization": "Bearer JWT_TOKEN" }

// 4. Update Profile
PUT /users/profile  
Headers: { "Authorization": "Bearer JWT_TOKEN" }
Body: {
  // ข้อมูลส่วนตัว
  "first_name": "ชื่อ",
  "last_name": "นามสกุล", 
  "date_of_birth": "1985-03-15",
  "gender": "male",
  "height_cm": 175,
  "weight_kg": 70,
  "activity_level": "moderately_active",
  
  // ข้อมูลสุขภาพ
  "health_data": {
    "waist_circumference_cm": 85,
    "blood_pressure_systolic": 120,
    "blood_pressure_diastolic": 80,
    "blood_sugar_mg_dl": 95
  },
  
  // เป้าหมายสุขภาพ
  "health_goals": {
    "main_goal": "ลดน้ำหนัก",
    "goal_duration": "3 เดือน", 
    "target_weight_kg": 65,
    "target_sleep_hours": 8
  },
  
  // เป้าหมายโภชนาการ
  "nutrition_goals": {
    "target_calories_per_day": 1800,
    "target_protein_grams_per_day": 120,
    "dietary_restrictions": ["ลดน้ำตาล"]
  },
  
  // พฤติกรรมประจำวัน
  "daily_behavior": {
    "exercise_frequency_per_week": 4,
    "average_sleep_hours_per_day": 7,
    "meals_per_day": 3
  },
  
  // ประวัติสุขภาพ
  "medical_history": {
    "allergies": ["ไข่", "อาหารทะเล"],
    "family_medical_history": "พ่อเป็นเบาหวาน"
  }
}
```

## 🔧 **Frontend Code Examples**

### React + Axios Setup
```javascript
// src/api/config.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Authentication Service
```javascript
// src/services/authService.js
import { api } from '../api/config';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
};
```

### Profile Service
```javascript
// src/services/profileService.js
import { api } from '../api/config';

export const profileService = {
  async getCompleteProfile() {
    const response = await api.get('/users/profile/complete');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  async updateBasicInfo(basicData) {
    const response = await api.put('/users/profile', {
      first_name: basicData.firstName,
      last_name: basicData.lastName,
      date_of_birth: basicData.dateOfBirth,
      gender: basicData.gender,
      height_cm: basicData.height,
      weight_kg: basicData.weight,
      activity_level: basicData.activityLevel
    });
    return response.data;
  },

  async updateHealthData(healthData) {
    const response = await api.put('/users/profile', {
      health_data: healthData
    });
    return response.data;
  },

  async updateHealthGoals(goals) {
    const response = await api.put('/users/profile', {
      health_goals: goals
    });
    return response.data;
  }
};
```

## 📱 **Recommended Frontend Structure**

### Pages/Components Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── profile/
│   │   ├── BasicInfoForm.jsx
│   │   ├── HealthDataForm.jsx
│   │   ├── HealthGoalsForm.jsx
│   │   ├── NutritionGoalsForm.jsx
│   │   └── ProfileSummary.jsx
│   └── shared/
│       ├── Header.jsx
│       ├── Navigation.jsx
│       └── LoadingSpinner.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── ProfilePage.jsx
│   └── SettingsPage.jsx
├── services/
│   ├── authService.js
│   ├── profileService.js
│   └── api/
├── hooks/
│   ├── useAuth.js
│   └── useProfile.js
└── utils/
    ├── validation.js
    └── formatters.js
```

### Example Login Component
```jsx
// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { authService } from '../../services/authService';

export const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.login(formData.email, formData.password);
      onLoginSuccess(result);
    } catch (error) {
      setError(error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>อีเมล:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      <div>
        <label>รหัสผ่าน:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </button>
    </form>
  );
};
```

## 🧪 **Testing with Real Data**

### Use this Token for Frontend Testing:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE5LCJlbWFpbCI6InJlYWx1c2VyMTc1NjY3ODIxNUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6InJlYWx1c2VyMTc1NjY3ODIxNSIsImlhdCI6MTc1NjY3ODIxOCwiZXhwIjoxNzU2NzY0NjE4fQ.abNF70oNPx27YuQ8qkBPlk3zearn6VvROcwj-AF_nzo
```

### Test User Credentials:
```
Email: realuser1756678215@gmail.com
Password: mypassword123
```

## 🎨 **UI/UX Recommendations**

### Suggested Pages Flow:
1. **Landing Page** → Login/Register
2. **Dashboard** → Overview + Quick Actions  
3. **Profile Setup** → Step-by-step onboarding
4. **Health Tracking** → Daily logs
5. **Goals & Progress** → Analytics
6. **Settings** → Preferences

### Data Visualization:
- **Charts**: Weight progress, BMI trends
- **Progress Bars**: Goal completion
- **Cards**: Health metrics summary
- **Calendar**: Activity tracking

## 🚀 **Next Steps**

1. **Create Frontend Project**:
   ```bash
   npx create-vite@latest vita-wise-frontend --template react-ts
   cd vita-wise-frontend
   npm install axios react-router-dom
   ```

2. **Test API Integration**:
   - Use the provided token
   - Test all profile endpoints
   - Handle loading/error states

3. **Build UI Components**:
   - Start with authentication
   - Add profile forms
   - Create dashboard

4. **Add Features**:
   - Data visualization
   - Real-time updates
   - Offline support
