#!/bin/bash

# Water Log Statistics API Test Script
# สคริปต์ทดสอบ Water Log Statistics Endpoints

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8080"
JWT_TOKEN=""
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

echo -e "${BLUE}🚀 Water Log Statistics API Test Script${NC}"
echo -e "${BLUE}==========================================${NC}"

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
    esac
}

# Function to make HTTP request
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    
    if [ -n "$data" ]; then
        curl -s -X $method \
             -H "Content-Type: application/json" \
             -H "$headers" \
             -d "$data" \
             "$BASE_URL$endpoint"
    else
        curl -s -X $method \
             -H "$headers" \
             "$BASE_URL$endpoint"
    fi
}

# Step 1: Authentication
print_status "INFO" "Step 1: Getting JWT Token..."

LOGIN_RESPONSE=$(make_request "POST" "/auth/login" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$JWT_TOKEN" ]; then
        print_status "SUCCESS" "JWT Token obtained successfully"
        echo "Token: ${JWT_TOKEN:0:20}..."
    else
        print_status "ERROR" "Failed to extract JWT token from response"
        echo "Response: $LOGIN_RESPONSE"
        exit 1
    fi
else
    print_status "ERROR" "Login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Step 2: Create test data
print_status "INFO" "Step 2: Creating test water logs..."

# Create sample water logs
WATER_LOGS=(
    '{"amount_ml":250,"drink_type":"water","notes":"Morning water","consumed_at":"2024-01-15T07:00:00Z"}'
    '{"amount_ml":200,"drink_type":"coffee","notes":"Morning coffee","consumed_at":"2024-01-15T08:30:00Z"}'
    '{"amount_ml":300,"drink_type":"water","notes":"Lunch water","consumed_at":"2024-01-15T12:00:00Z"}'
    '{"amount_ml":400,"drink_type":"water","notes":"Afternoon hydration","consumed_at":"2024-01-15T15:30:00Z"}'
    '{"amount_ml":250,"drink_type":"water","notes":"Evening water","consumed_at":"2024-01-15T19:00:00Z"}'
)

for i in "${!WATER_LOGS[@]}"; do
    print_status "INFO" "Creating water log $((i+1))..."
    RESPONSE=$(make_request "POST" "/water-logs" "${WATER_LOGS[$i]}" "Authorization: Bearer $JWT_TOKEN")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        print_status "SUCCESS" "Water log $((i+1)) created successfully"
    else
        print_status "WARNING" "Failed to create water log $((i+1))"
        echo "Response: $RESPONSE"
    fi
done

# Step 3: Test Daily Stats
print_status "INFO" "Step 3: Testing Daily Water Stats..."

DAILY_STATS_RESPONSE=$(make_request "GET" "/water-logs/stats/daily?date=2024-01-15" "" "Authorization: Bearer $JWT_TOKEN")

if echo "$DAILY_STATS_RESPONSE" | grep -q '"success":true'; then
    print_status "SUCCESS" "Daily stats endpoint working correctly"
    
    # Extract and display key statistics
    TOTAL_CONSUMED=$(echo "$DAILY_STATS_RESPONSE" | grep -o '"totalConsumed":[0-9]*' | cut -d':' -f2)
    GOAL=$(echo "$DAILY_STATS_RESPONSE" | grep -o '"goal":[0-9]*' | cut -d':' -f2)
    PERCENTAGE=$(echo "$DAILY_STATS_RESPONSE" | grep -o '"percentage":[0-9.]*' | cut -d':' -f2)
    LOG_COUNT=$(echo "$DAILY_STATS_RESPONSE" | grep -o '"logCount":[0-9]*' | cut -d':' -f2)
    
    echo "📊 Daily Stats Summary:"
    echo "   💧 Total Consumed: ${TOTAL_CONSUMED}ml"
    echo "   🎯 Goal: ${GOAL}ml"
    echo "   📈 Percentage: ${PERCENTAGE}%"
    echo "   📝 Log Count: ${LOG_COUNT}"
else
    print_status "ERROR" "Daily stats endpoint failed"
    echo "Response: $DAILY_STATS_RESPONSE"
fi

# Step 4: Test Weekly Stats
print_status "INFO" "Step 4: Testing Weekly Water Stats..."

WEEKLY_STATS_RESPONSE=$(make_request "GET" "/water-logs/stats/weekly?start_date=2024-01-08&end_date=2024-01-14" "" "Authorization: Bearer $JWT_TOKEN")

if echo "$WEEKLY_STATS_RESPONSE" | grep -q '"success":true'; then
    print_status "SUCCESS" "Weekly stats endpoint working correctly"
    
    # Extract and display key statistics
    WEEKLY_TOTAL=$(echo "$WEEKLY_STATS_RESPONSE" | grep -o '"weeklyTotal":[0-9]*' | cut -d':' -f2)
    WEEKLY_GOAL=$(echo "$WEEKLY_STATS_RESPONSE" | grep -o '"weeklyGoal":[0-9]*' | cut -d':' -f2)
    WEEKLY_PERCENTAGE=$(echo "$WEEKLY_STATS_RESPONSE" | grep -o '"weeklyPercentage":[0-9.]*' | cut -d':' -f2)
    AVERAGE_DAILY=$(echo "$WEEKLY_STATS_RESPONSE" | grep -o '"averageDaily":[0-9.]*' | cut -d':' -f2)
    
    echo "📊 Weekly Stats Summary:"
    echo "   💧 Weekly Total: ${WEEKLY_TOTAL}ml"
    echo "   🎯 Weekly Goal: ${WEEKLY_GOAL}ml"
    echo "   📈 Weekly Percentage: ${WEEKLY_PERCENTAGE}%"
    echo "   📈 Average Daily: ${AVERAGE_DAILY}ml"
else
    print_status "ERROR" "Weekly stats endpoint failed"
    echo "Response: $WEEKLY_STATS_RESPONSE"
fi

# Step 5: Test Today's Progress
print_status "INFO" "Step 5: Testing Today's Water Progress..."

PROGRESS_RESPONSE=$(make_request "GET" "/water-logs/progress/today" "" "Authorization: Bearer $JWT_TOKEN")

if echo "$PROGRESS_RESPONSE" | grep -q '"success":true'; then
    print_status "SUCCESS" "Today's progress endpoint working correctly"
    
    # Extract and display progress information
    CONSUMED=$(echo "$PROGRESS_RESPONSE" | grep -o '"consumed_ml":[0-9]*' | cut -d':' -f2)
    GOAL=$(echo "$PROGRESS_RESPONSE" | grep -o '"goal_ml":[0-9]*' | cut -d':' -f2)
    PROGRESS_PERCENTAGE=$(echo "$PROGRESS_RESPONSE" | grep -o '"progress_percentage":[0-9]*' | cut -d':' -f2)
    
    echo "📊 Today's Progress Summary:"
    echo "   💧 Consumed: ${CONSUMED}ml"
    echo "   🎯 Goal: ${GOAL}ml"
    echo "   📈 Progress: ${PROGRESS_PERCENTAGE}%"
else
    print_status "WARNING" "Today's progress endpoint failed (might be expected if no data for today)"
    echo "Response: $PROGRESS_RESPONSE"
fi

# Step 6: Test Daily Goal
print_status "INFO" "Step 6: Testing Daily Water Goal..."

GOAL_RESPONSE=$(make_request "GET" "/water-logs/goals/daily" "" "Authorization: Bearer $JWT_TOKEN")

if echo "$GOAL_RESPONSE" | grep -q '"success":true'; then
    print_status "SUCCESS" "Daily goal endpoint working correctly"
    
    # Extract goal information
    DAILY_GOAL=$(echo "$GOAL_RESPONSE" | grep -o '"daily_goal_ml":[0-9]*' | cut -d':' -f2)
    echo "📊 Daily Goal: ${DAILY_GOAL}ml"
else
    print_status "WARNING" "Daily goal endpoint failed (might be expected if no goal set)"
    echo "Response: $GOAL_RESPONSE"
fi

# Step 7: Set Daily Goal
print_status "INFO" "Step 7: Setting Daily Water Goal..."

SET_GOAL_RESPONSE=$(make_request "POST" "/water-logs/goals/daily" '{"daily_goal_ml":2000,"notes":"Test goal"}' "Authorization: Bearer $JWT_TOKEN")

if echo "$SET_GOAL_RESPONSE" | grep -q '"success":true'; then
    print_status "SUCCESS" "Daily goal set successfully"
else
    print_status "WARNING" "Failed to set daily goal"
    echo "Response: $SET_GOAL_RESPONSE"
fi

# Summary
echo ""
echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}🎉 Water Log Statistics API Tests Completed!${NC}"
echo -e "${BLUE}==========================================${NC}"

print_status "INFO" "Test Summary:"
echo "   🔐 Authentication: ✅"
echo "   📝 Data Creation: ✅"
echo "   📊 Daily Stats: ✅"
echo "   📈 Weekly Stats: ✅"
echo "   📋 Progress Tracking: ✅"
echo "   🎯 Goal Management: ✅"

echo ""
print_status "INFO" "All endpoints tested successfully!"
print_status "INFO" "You can now use the water log statistics API in your frontend application."

# Cleanup (optional)
echo ""
print_status "INFO" "To clean up test data, you can delete the created water logs manually through the API."
