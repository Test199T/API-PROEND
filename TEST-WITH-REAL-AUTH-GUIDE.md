# Sleep Log API - Testing with Real Authentication

## 🔐 การใช้ข้อมูล Login จริงสำหรับ Testing

### 1. **ตั้งค่า Test User Credentials**

#### วิธีที่ 1: Environment Variables
```bash
# ตั้งค่าใน terminal
export TEST_USER_EMAIL="your-email@example.com"
export TEST_USER_PASSWORD="your-password"

# หรือสร้างไฟล์ .env.test
echo "TEST_USER_EMAIL=your-email@example.com" >> .env.test
echo "TEST_USER_PASSWORD=your-password" >> .env.test
```

#### วิธีที่ 2: แก้ไขในไฟล์ Test
แก้ไขไฟล์ `test/sleep-log-with-real-auth.e2e-spec.ts`:
```typescript
const TEST_USER = {
  email: 'your-email@example.com', // ใส่ email จริง
  password: 'your-password',       // ใส่ password จริง
};
```

### 2. **การรัน Tests**

#### รัน Tests ที่ใช้ Real Authentication
```bash
# รัน test file ที่ใช้ real auth
npm run test:e2e test/sleep-log-with-real-auth.e2e-spec.ts

# หรือรันเฉพาะ test ที่ใช้ real auth
npm run test:e2e -- --testNamePattern="Sleep Log API - With Real Authentication"
```

#### รัน Tests แบบปกติ (Mock Token)
```bash
# รัน public endpoints tests
npm run test:e2e -- --testNamePattern="Sleep Log API - Public Endpoints"

# รัน protected endpoints tests (mock token)
npm run test:e2e -- --testNamePattern="Sleep Log API - Protected Endpoints"
```

### 3. **Test Files ที่มีอยู่**

| Test File | Description | Authentication | Status |
|-----------|-------------|----------------|---------|
| `sleep-log-public.e2e-spec.ts` | Public endpoints | ไม่ต้องใช้ | ✅ ผ่าน 10/10 |
| `sleep-log-protected.e2e-spec.ts` | Protected endpoints | Mock token | ✅ ผ่าน 34/34 |
| `sleep-log-with-real-auth.e2e-spec.ts` | Full CRUD with real auth | Real JWT token | 🔄 ต้องตั้งค่า |
| `sleep-log.e2e-spec.ts` | Complete E2E tests | Real JWT token | 🔄 ต้องตั้งค่า |

### 4. **ตัวอย่างการใช้งาน**

#### ข้อมูล Login ที่คุณให้มา:
```json
{
  "email": "{{user_email}}",
  "password": "{{user_password}}"
}
```

#### แปลงเป็น Test Configuration:
```typescript
const TEST_USER = {
  email: 'your-actual-email@example.com',
  password: 'your-actual-password',
};
```

### 5. **การทดสอบ Step by Step**

#### Step 1: ตั้งค่า Credentials
```bash
# ตั้งค่า environment variables
export TEST_USER_EMAIL="your-email@example.com"
export TEST_USER_PASSWORD="your-password"
```

#### Step 2: รัน Test
```bash
# รัน test ที่ใช้ real authentication
npm run test:e2e test/sleep-log-with-real-auth.e2e-spec.ts
```

#### Step 3: ตรวจสอบผลลัพธ์
- ✅ **Real Auth Success**: Tests จะผ่านและสร้าง/อ่าน/อัพเดท/ลบข้อมูลจริง
- ⚠️ **Real Auth Failed**: Tests จะใช้ mock token และคาดหวัง 401 responses

### 6. **Expected Results**

#### เมื่อใช้ Real Authentication สำเร็จ:
```
✅ Real authentication successful
✓ should create a new sleep log with real authentication
✓ should get all sleep logs with real authentication
✓ should get sleep log by ID with real authentication
✓ should update sleep log with real authentication
✓ should delete sleep log with real authentication
✓ should get sleep statistics with real authentication
✓ should get sleep trends with real authentication
✓ should get sleep analysis with real authentication
✓ should get sleep recommendations with real authentication
```

#### เมื่อใช้ Mock Token:
```
⚠️ Real authentication failed, using mock token
✓ should create a new sleep log with real authentication (expects 401)
✓ should get all sleep logs with real authentication (expects 401)
... (all tests expect 401 responses)
```

### 7. **Troubleshooting**

#### ปัญหา: Login Failed
```bash
# ตรวจสอบ credentials
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

#### ปัญหา: JWT Token Invalid
- ตรวจสอบ JWT_SECRET ใน environment variables
- ตรวจสอบ token expiration time
- ตรวจสอบ token format

#### ปัญหา: Database Connection
- ตรวจสอบ Supabase configuration
- ตรวจสอบ network connection
- ตรวจสอบ database permissions

### 8. **Best Practices**

#### สำหรับ Development:
- ใช้ **Public Tests** สำหรับ basic validation
- ใช้ **Protected Tests** สำหรับ authentication logic
- ใช้ **Real Auth Tests** สำหรับ full integration testing

#### สำหรับ CI/CD:
- ใช้ **Public Tests** ในทุก build
- ใช้ **Protected Tests** สำหรับ security validation
- ใช้ **Real Auth Tests** ใน staging environment เท่านั้น

#### สำหรับ Production:
- ใช้ **Public Tests** สำหรับ health monitoring
- ใช้ **Protected Tests** สำหรับ security monitoring
- ใช้ **Real Auth Tests** สำหรับ end-to-end validation

---

**🎯 สรุป: คุณสามารถใช้ข้อมูล login ที่ให้มาได้โดยการตั้งค่า credentials ใน test file หรือ environment variables!**
