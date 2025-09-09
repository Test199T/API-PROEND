# Frontend Debug Guide

## 🔍 **ปัญหาที่พบบ่อยและวิธีแก้ไข**

### **1. JWT Token ไม่ถูกต้อง**

#### **อาการ:**
```
ERROR [AuthGuard] JsonWebTokenError: invalid token
UnauthorizedException: Invalid token
```

#### **วิธีแก้ไข:**
```typescript
// 1. ตรวจสอบ token ใน localStorage
const token = localStorage.getItem('token');
console.log('Token:', token);

// 2. ตรวจสอบ token format
if (!token || !token.startsWith('eyJ')) {
  console.error('Invalid token format');
  localStorage.removeItem('token');
  window.location.href = '/login';
  return;
}

// 3. ตรวจสอบ token หมดอายุ
const tokenData = JSON.parse(atob(token.split('.')[1]));
const now = Date.now() / 1000;
if (tokenData.exp < now) {
  console.error('Token expired');
  localStorage.removeItem('token');
  window.location.href = '/login';
  return;
}
```

### **2. API Endpoints ผิด**

#### **อาการ:**
```
Cannot GET /users/profile
Cannot GET /profile
Cannot GET /user/me
Cannot GET /health
```

#### **วิธีแก้ไข:**
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

### **3. เรียก AI Analysis หลายครั้ง**

#### **อาการ:**
- เรียก OpenRouter API หลายครั้งติดๆ กัน
- ใช้ tokens มากเกินไป

#### **วิธีแก้ไข:**
```typescript
// ❌ ผิด - เรียกใน useEffect โดยไม่มี dependency
useEffect(() => {
  loadHealthData(); // จะเรียกทุกครั้งที่ re-render
});

// ✅ ถูก - ใช้ dependency array
useEffect(() => {
  loadHealthData();
}, [userId]); // เรียกเฉพาะเมื่อ userId เปลี่ยน

// ✅ ถูก - ใช้ loading state
const [loading, setLoading] = useState(false);

const loadHealthData = async () => {
  if (loading) return; // ป้องกันการเรียกซ้ำ
  
  setLoading(true);
  try {
    const result = await aiService.analyzeHealth(userId);
    setHealthData(result.data);
  } finally {
    setLoading(false);
  }
};
```

### **4. User ID ไม่ถูกต้อง**

#### **อาการ:**
```
AI Analysis Error: Error: User ID not found. Please login again.
```

#### **วิธีแก้ไข:**
```typescript
// 1. ตรวจสอบ userId จาก auth
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userId = user.id;

if (!userId || userId <= 0) {
  console.error('Invalid user ID:', userId);
  window.location.href = '/login';
  return;
}

// 2. ใช้ userId ที่ถูกต้อง
const result = await aiService.analyzeHealth(userId);
```

### **5. ข้อมูลสุขภาพว่างเปล่า**

#### **อาการ:**
```json
{
  "foodLogs": [],
  "exerciseLogs": [],
  "sleepLogs": [],
  "waterLogs": [],
  "healthGoals": []
}
```

#### **วิธีแก้ไข:**
```typescript
// ตรวจสอบข้อมูลก่อนเรียก AI
if (healthData.foodLogs.length === 0 && 
    healthData.exerciseLogs.length === 0) {
  // แสดงข้อความแนะนำให้บันทึกข้อมูล
  setMessage('กรุณาบันทึกข้อมูลสุขภาพก่อนวิเคราะห์');
  return;
}
```

## 🛠️ **Debug Tools**

### **1. Network Tab**
- เปิด Developer Tools > Network
- ดู API calls ที่ส่งไป
- ตรวจสอบ status codes และ response

### **2. Console Logs**
```typescript
// เพิ่ม logs เพื่อ debug
console.log('User ID:', userId);
console.log('Token:', token);
console.log('API Response:', response);
```

### **3. API Testing**
```typescript
// ทดสอบ API endpoints
const testEndpoints = async () => {
  try {
    // Test health check
    const health = await fetch('/api/health');
    console.log('Health check:', await health.json());
    
    // Test AI service health
    const aiHealth = await fetch('/api/ai-service/health');
    console.log('AI Health check:', await aiHealth.json());
    
    // Test AI service test
    const aiTest = await fetch('/api/ai-service/test');
    console.log('AI Test:', await aiTest.json());
  } catch (error) {
    console.error('API Test failed:', error);
  }
};
```

## 📋 **Checklist**

### **ก่อนเรียก AI Service:**
- [ ] User ต้อง login แล้ว
- [ ] มี JWT token ใน localStorage
- [ ] Token ยังไม่หมดอายุ
- [ ] User ID ถูกต้อง
- [ ] ใช้ API endpoints ที่ถูกต้อง

### **หลังเรียก AI Service:**
- [ ] ตรวจสอบ response.success
- [ ] Handle errors อย่างเหมาะสม
- [ ] แสดง loading state
- [ ] Cache results เพื่อลด API calls

## 🚨 **Emergency Fixes**

### **ถ้า Token หมดอายุ:**
```typescript
// ลบ token และ redirect
localStorage.removeItem('token');
localStorage.removeItem('user');
window.location.href = '/login';
```

### **ถ้า API ไม่ตอบสนอง:**
```typescript
// ใช้ fallback data
const fallbackData = {
  healthScores: { overallScore: 50 },
  aiAnalysis: 'ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้',
  recommendations: ['กรุณาลองใหม่อีกครั้ง']
};
```

### **ถ้า User ID ไม่ถูกต้อง:**
```typescript
// ใช้ default user ID สำหรับ testing
const defaultUserId = 161; // จาก terminal logs
const result = await aiService.analyzeHealth(defaultUserId);
```
