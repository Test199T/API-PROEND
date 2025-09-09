#!/bin/bash

# Water Log API Test Script
# Base URL: http://localhost:3000/api

BASE_URL="http://localhost:3000/api"
EMAIL="watertest@gmail.com"
PASSWORD="adwawdasd"

echo "🚀 Testing Water Log API..."
echo "Base URL: $BASE_URL"
echo ""

# 1. Health Check
echo "1. Health Check"
curl -s "$BASE_URL/health" | jq '.' || echo "Health check failed"
echo ""

# 2. Login
echo "2. Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "$LOGIN_RESPONSE" | jq '.'

# Extract JWT token
JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
echo "JWT Token: $JWT_TOKEN"
echo ""

if [ "$JWT_TOKEN" = "null" ] || [ -z "$JWT_TOKEN" ]; then
  echo "❌ Login failed. Cannot proceed with tests."
  exit 1
fi

# 3. Create Water Log
echo "3. Create Water Log"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/water-logs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "amount_ml": 250,
    "drink_type": "water",
    "notes": "Test water log"
  }')

echo "$CREATE_RESPONSE" | jq '.'
echo ""

# 4. Get All Water Logs
echo "4. Get All Water Logs"
curl -s "$BASE_URL/water-logs" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

# 5. Get Daily Stats
echo "5. Get Daily Stats"
curl -s "$BASE_URL/water-logs/stats/daily?date=2025-09-09" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

# 6. Get Weekly Stats
echo "6. Get Weekly Stats"
curl -s "$BASE_URL/water-logs/stats/weekly?start_date=2025-09-03&end_date=2025-09-09" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

# 7. Get Today's Progress
echo "7. Get Today's Progress"
curl -s "$BASE_URL/water-logs/progress/today" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

# 8. Set Daily Water Goal
echo "8. Set Daily Water Goal"
curl -s -X POST "$BASE_URL/water-logs/goals/daily" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"daily_goal_ml": 2500}' | jq '.'
echo ""

# 9. Get Daily Water Goal
echo "9. Get Daily Water Goal"
curl -s "$BASE_URL/water-logs/goals/daily" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

# 10. Get Water Consumption Trends
echo "10. Get Water Consumption Trends"
curl -s "$BASE_URL/water-logs/trends/consumption?days=7" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

# 11. Get Hydration Insights
echo "11. Get Hydration Insights"
curl -s "$BASE_URL/water-logs/insights/hydration" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

echo "✅ All tests completed!"
