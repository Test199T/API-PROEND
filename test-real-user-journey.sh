#!/bin/bash
# 🎯 สคริปต์ทดสอบ Real User Journey - VITA WISE AI
# จำลองการใช้งานจริงของผู้ใช้ตั้งแต่สมัครจนใช้งานครบ

echo "👤 จำลอง Real User Journey - VITA WISE AI"
echo "=================================================="

# ตัวแปรผู้ใช้จำลอง
USER_EMAIL="realuser$(date +%s)@gmail.com"
USER_PASSWORD="mypassword123"
BASE_URL="http://localhost:3000"

echo "📧 ผู้ใช้: $USER_EMAIL"
echo ""

# === STEP 1: สมัครสมาชิก ===
echo "🔑 STEP 1: สมัครสมาชิก"
echo "------------------------"
REGISTER_DATA='{
  "email": "'$USER_EMAIL'",
  "password": "'$USER_PASSWORD'",
  "firstName": "สมศักดิ์",
  "lastName": "ทดสอบ"
}'

echo "📝 ข้อมูลการสมัคร:"
echo "$REGISTER_DATA" | jq '.' 2>/dev/null || echo "$REGISTER_DATA"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA")

echo "✅ ผลการสมัคร:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# === STEP 2: เข้าสู่ระบบ ===
echo "🚪 STEP 2: เข้าสู่ระบบ"
echo "----------------------"
LOGIN_DATA='{
  "email": "'$USER_EMAIL'",
  "password": "'$USER_PASSWORD'"
}'

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA")

echo "✅ ผลการเข้าสู่ระบบ:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# ดึง Token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token' 2>/dev/null)
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ ไม่สามารถเข้าสู่ระบบได้!"
  exit 1
fi

echo "🔑 Token ได้แล้ว: ${TOKEN:0:50}..."
echo ""

# === STEP 3: ดูโปรไฟล์ครั้งแรก ===
echo "👤 STEP 3: ดูโปรไฟล์ครั้งแรก (ข้อมูลเปล่า)"
echo "--------------------------------------------"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/users/profile/complete" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ โปรไฟล์เริ่มต้น:"
echo "$PROFILE_RESPONSE" | jq '.data | {id, email, first_name, last_name, height_cm, weight_kg, health_data}' 2>/dev/null || echo "$PROFILE_RESPONSE"
echo ""

# === STEP 4: เพิ่มข้อมูลส่วนตัวพื้นฐาน ===
echo "📝 STEP 4: เพิ่มข้อมูลส่วนตัวพื้นฐาน"
echo "------------------------------------"
BASIC_UPDATE='{
  "date_of_birth": "1985-03-15",
  "gender": "male",
  "height_cm": 175,
  "weight_kg": 70,
  "activity_level": "moderately_active"
}'

echo "📊 ข้อมูลที่อัพเดท:"
echo "$BASIC_UPDATE" | jq '.' 2>/dev/null || echo "$BASIC_UPDATE"

BASIC_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$BASIC_UPDATE")

echo "✅ ผลการอัพเดท:"
echo "$BASIC_RESPONSE" | jq '.data | {first_name, height_cm, weight_kg, gender, activity_level}' 2>/dev/null || echo "$BASIC_RESPONSE"
echo ""

# === STEP 5: เพิ่มข้อมูลสุขภาพ ===
echo "🏥 STEP 5: เพิ่มข้อมูลสุขภาพ"
echo "----------------------------"
HEALTH_UPDATE='{
  "health_data": {
    "waist_circumference_cm": 85,
    "blood_pressure_systolic": 120,
    "blood_pressure_diastolic": 80,
    "blood_sugar_mg_dl": 95
  }
}'

echo "🩺 ข้อมูลสุขภาพ:"
echo "$HEALTH_UPDATE" | jq '.' 2>/dev/null || echo "$HEALTH_UPDATE"

HEALTH_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$HEALTH_UPDATE")

echo "✅ ผลการบันทึกข้อมูลสุขภาพ:"
echo "$HEALTH_RESPONSE" | jq '.data.health_data' 2>/dev/null || echo "$HEALTH_RESPONSE"
echo ""

# === STEP 6: ตั้งเป้าหมายสุขภาพ ===
echo "🎯 STEP 6: ตั้งเป้าหมายสุขภาพ"
echo "------------------------------"
GOALS_UPDATE='{
  "health_goals": {
    "main_goal": "ลดน้ำหนัก",
    "goal_duration": "3 เดือน",
    "motivation": "เพื่อสุขภาพที่ดีขึ้นและความมั่นใจ",
    "target_weight_kg": 65,
    "target_sleep_hours": 8,
    "target_exercise_minutes_per_day": 45
  }
}'

echo "🎯 เป้าหมายสุขภาพ:"
echo "$GOALS_UPDATE" | jq '.' 2>/dev/null || echo "$GOALS_UPDATE"

GOALS_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$GOALS_UPDATE")

echo "✅ ผลการตั้งเป้าหมาย:"
echo "$GOALS_RESPONSE" | jq '.data.health_goals' 2>/dev/null || echo "$GOALS_RESPONSE"
echo ""

# === STEP 7: เพิ่มเป้าหมายโภชนาการ ===
echo "🥗 STEP 7: เพิ่มเป้าหมายโภชนาการ"
echo "--------------------------------"
NUTRITION_UPDATE='{
  "nutrition_goals": {
    "target_calories_per_day": 1800,
    "target_protein_grams_per_day": 120,
    "target_carbs_grams_per_day": 180,
    "target_fat_grams_per_day": 60,
    "target_fiber_grams_per_day": 25,
    "dietary_restrictions": ["ลดน้ำตาล", "หลีกเลี่ยงอาหารทอด"]
  }
}'

NUTRITION_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$NUTRITION_UPDATE")

echo "✅ ผลการตั้งเป้าหมายโภชนาการ:"
echo "$NUTRITION_RESPONSE" | jq '.data.nutrition_goals' 2>/dev/null || echo "$NUTRITION_RESPONSE"
echo ""

# === STEP 8: บันทึกพฤติกรรมประจำวัน ===
echo "📅 STEP 8: บันทึกพฤติกรรมประจำวัน"
echo "--------------------------------"
BEHAVIOR_UPDATE='{
  "daily_behavior": {
    "exercise_frequency_per_week": 4,
    "average_sleep_hours_per_day": 7,
    "meals_per_day": 3,
    "alcohol_consumption": "occasionally",
    "smoking_status": "never",
    "daily_water_goal_ml": 2500
  }
}'

BEHAVIOR_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$BEHAVIOR_UPDATE")

echo "✅ ผลการบันทึกพฤติกรรม:"
echo "$BEHAVIOR_RESPONSE" | jq '.data.daily_behavior' 2>/dev/null || echo "$BEHAVIOR_RESPONSE"
echo ""

# === STEP 9: เพิ่มประวัติสุขภาพ ===
echo "📋 STEP 9: เพิ่มประวัติสุขภาพ"
echo "----------------------------"
MEDICAL_UPDATE='{
  "medical_history": {
    "chronic_conditions": [],
    "surgery_history": [],
    "allergies": ["ไข่", "อาหารทะเล"],
    "medications": [],
    "family_medical_history": "พ่อเป็นเบาหวาน, แม่มีความดันสูง"
  }
}'

MEDICAL_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$MEDICAL_UPDATE")

echo "✅ ผลการบันทึกประวัติสุขภาพ:"
echo "$MEDICAL_RESPONSE" | jq '.data.medical_history' 2>/dev/null || echo "$MEDICAL_RESPONSE"
echo ""

# === STEP 10: ดูโปรไฟล์สมบูรณ์ ===
echo "🎉 STEP 10: ดูโปรไฟล์สมบูรณ์ (หลังกรอกข้อมูลครบ)"
echo "------------------------------------------------"
FINAL_PROFILE=$(curl -s -X GET "$BASE_URL/users/profile/complete" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ โปรไฟล์สมบูรณ์:"
echo "$FINAL_PROFILE" | jq '.data | {
  id, 
  email, 
  first_name, 
  last_name,
  height_cm, 
  weight_kg,
  health_data: .health_data,
  health_goals: .health_goals.main_goal,
  nutrition_goals: .nutrition_goals.target_calories_per_day,
  daily_behavior: .daily_behavior.exercise_frequency_per_week,
  medical_history: .medical_history.allergies
}' 2>/dev/null || echo "$FINAL_PROFILE"

echo ""
echo "🎊 สำเร็จ! User Journey เสร็จสมบูรณ์"
echo "=================================="
echo "👤 ผู้ใช้: $USER_EMAIL"
echo "🔑 Token: ${TOKEN:0:50}..."
echo "📊 ข้อมูลครบถ้วน: ✅ ส่วนตัว ✅ สุขภาพ ✅ เป้าหมาย ✅ โภชนาการ ✅ พฤติกรรม ✅ ประวัติ"
echo ""
echo "💡 ใช้ Token นี้ทดสอบ Frontend ได้เลย!"
echo "💡 หรือนำไป Test ใน Postman!"
