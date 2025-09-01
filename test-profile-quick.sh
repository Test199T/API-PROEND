#!/bin/bash
# 🚀 สคริปต์ทดสอบระบบ Profile - VITA WISE AI
# รันด้วยคำสั่ง: bash test-profile-quick.sh

echo "🔥 เริ่มทดสอบระบบ Profile..."
echo "=================================="

# ตัวแปรพื้นฐาน
BASE_URL="http://localhost:3000"
EMAIL="quicktest$(date +%s)@gmail.com"  # Email ไม่ซ้ำ
PASSWORD="password123"

echo "📧 Email สำหรับทดสอบ: $EMAIL"
echo ""

# 1. สร้างผู้ใช้ใหม่
echo "1️⃣ สร้างผู้ใช้ใหม่..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"ทดสอบ\",
    \"lastName\": \"ระบบ\"
  }")

echo "✅ Register Response:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# 2. เข้าสู่ระบบเพื่อรับ Token
echo "2️⃣ เข้าสู่ระบบ..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "✅ Login Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# ดึง access_token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token' 2>/dev/null)
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ ไม่สามารถรับ Token ได้! ตรวจสอบการ Login"
  exit 1
fi

echo "🔑 Token: ${TOKEN:0:50}..."
echo ""

# 3. ดูข้อมูล Profile ครบถ้วน
echo "3️⃣ ดูข้อมูล Profile ครบถ้วน..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/users/profile/complete" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Complete Profile Response:"
echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
echo ""

# 4. อัพเดท Profile
echo "4️⃣ อัพเดท Profile..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "ทดสอบอัพเดท",
    "height_cm": 175,
    "weight_kg": 70,
    "health_data": {
      "waist_circumference_cm": 80,
      "blood_pressure_systolic": 120,
      "blood_pressure_diastolic": 80
    }
  }')

echo "✅ Update Profile Response:"
echo "$UPDATE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPDATE_RESPONSE"
echo ""

# 5. ดูข้อมูล Profile อีกครั้งหลังอัพเดท
echo "5️⃣ ดูข้อมูล Profile หลังอัพเดท..."
UPDATED_PROFILE=$(curl -s -X GET "$BASE_URL/users/profile/complete" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Updated Complete Profile:"
echo "$UPDATED_PROFILE" | jq '.' 2>/dev/null || echo "$UPDATED_PROFILE"

echo ""
echo "🎉 การทดสอบเสร็จสิ้น!"
echo "💡 Token สำหรับทดสอบต่อ: $TOKEN"
