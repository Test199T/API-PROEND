#!/bin/bash

# Test Profile API Endpoints
# Make sure to replace YOUR_JWT_TOKEN with a real token

echo "🚀 Testing Profile API Endpoints"
echo "=================================="

# Get JWT token first (you need to have this from login)
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

if [ "$JWT_TOKEN" = "YOUR_JWT_TOKEN_HERE" ]; then
    echo "❌ Please replace JWT_TOKEN with a real token from login"
    echo "Run this to get a token:"
    echo "curl -X POST http://localhost:3000/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"your@email.com\",\"password\":\"yourpassword\"}'"
    exit 1
fi

echo ""
echo "1️⃣ Testing GET /users/profile"
echo "------------------------------"
curl -X GET "http://localhost:3000/users/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo ""
echo "2️⃣ Testing PUT /users/profile"
echo "------------------------------"
curl -X PUT "http://localhost:3000/users/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "ชื่อใหม่",
    "last_name": "นามสกุลใหม่", 
    "height_cm": 175,
    "weight_kg": 70,
    "activity_level": "moderate"
  }' \
  | jq '.'

echo ""
echo ""
echo "3️⃣ Verifying update with GET"
echo "-----------------------------"
curl -X GET "http://localhost:3000/users/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "✅ Profile API testing completed!"
