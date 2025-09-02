# 🍽️ Food Log API Documentation

## Overview
Complete API documentation for the Food Log system running on `http://localhost:8080/food-log`. This API provides comprehensive food logging, nutrition tracking, and dashboard functionality for the VITA WISE AI health platform.

## Base URL
```
http://localhost:8080
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <your_jwt_token>
```

## 📋 Available Endpoints

### 🔐 Authentication Required
All food-log endpoints require valid JWT authentication. Get your token from `/auth/login` first.

---

## 🍽️ Core Food Log Operations

### 1. Create Food Log Entry
**POST** `/food-log`

Creates a new food log entry for the authenticated user.

**Request Body:**
```json
{
  "meal_type": "breakfast|lunch|dinner|snack",
  "food_name": "ข้าวผัดกุ้ง",
  "quantity": 1,
  "unit": "จาน",
  "calories": 450,
  "protein_g": 25,
  "carbs_g": 65,
  "fat_g": 12,
  "fiber_g": 3,
  "sugar_g": 8,
  "sodium_mg": 800,
  "notes": "อาหารเช้าที่บ้าน ใส่กุ้งเยอะ",
  "consumed_at": "2025-02-09T07:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Food log created successfully",
  "data": {
    "id": 123,
    "userId": 1,
    "meal_type": "breakfast",
    "food_name": "ข้าวผัดกุ้ง",
    "quantity": 1,
    "unit": "จาน",
    "calories": 450,
    "protein_g": 25,
    "carbs_g": 65,
    "fat_g": 12,
    "fiber_g": 3,
    "sugar_g": 8,
    "sodium_mg": 800,
    "notes": "อาหารเช้าที่บ้าน ใส่กุ้งเยอะ",
    "consumed_at": "2025-02-09T07:30:00.000Z",
    "created_at": "2025-02-09T07:35:00.000Z",
    "total_nutrition": {
      "calories": 450,
      "protein": 25,
      "carbs": 65,
      "fat": 12,
      "fiber": 3,
      "sugar": 8,
      "sodium": 800
    },
    "is_complete_nutrition": true,
    "meal_time": "07:30",
    "meal_date": "9/2/2025"
  }
}
```

### 2. Get Food Logs
**GET** `/food-log`

Retrieves food logs for the authenticated user with optional filtering.

**Query Parameters:**
- `meal_type` (optional): Filter by meal type (breakfast, lunch, dinner, snack)
- `start_date` (optional): Start date filter (YYYY-MM-DD)
- `end_date` (optional): End date filter (YYYY-MM-DD)
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```
GET /food-log?meal_type=breakfast&start_date=2025-02-01&end_date=2025-02-09&limit=10
```

### 3. Get Single Food Log
**GET** `/food-log/{id}`

Retrieves a specific food log entry by ID.

### 4. Update Food Log Entry
**PUT** `/food-log/{id}`

Updates an existing food log entry. Only provided fields will be updated.

**Request Body (partial update):**
```json
{
  "food_name": "ข้าวผัดกุ้งใหญ่",
  "quantity": 1.5,
  "calories": 520,
  "notes": "อัปเดต: เพิ่มกุ้งใหญ่และไข่"
}
```

### 5. Delete Food Log Entry
**DELETE** `/food-log/{id}`

Deletes a food log entry.

---

## 📊 Analytics & Statistics

### 6. Get Food Log Statistics
**GET** `/food-log/stats`

Get nutrition statistics for a specific date (default: today).

**Query Parameters:**
- `date` (optional): Target date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_calories": 1250,
    "total_protein": 65,
    "total_carbs": 150,
    "total_fat": 45,
    "total_fiber": 18,
    "meal_count": 4,
    "meals_by_type": {
      "breakfast": 1,
      "lunch": 1,
      "dinner": 1,
      "snack": 1
    }
  }
}
```

### 7. Get Food Log Trends
**GET** `/food-log/trends`

Get nutrition trends over multiple days.

**Query Parameters:**
- `days` (optional): Number of days (default: 7)

### 8. Get Calories Summary
**GET** `/food-log/calories/summary`

Get detailed calorie summary with date range.

**Query Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date

---

## 🎯 New Dashboard Endpoints

### 9. Get Food Log Summary
**GET** `/food-log/summary`

**✨ NEW ENDPOINT** - Comprehensive summary with nutrition, weight trends, and goal progress.

**Query Parameters:**
- `period` (optional): "day", "week", "month" (default: "week")
- `startDate` (optional): Custom start date (YYYY-MM-DD)
- `endDate` (optional): Custom end date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "start_date": "2025-02-03",
    "end_date": "2025-02-09",
    "nutrition_summary": {
      "total_calories": 8750,
      "total_protein": 455,
      "total_carbs": 1050,
      "total_fat": 315,
      "total_fiber": 126,
      "total_sugar": 168,
      "total_sodium": 5600,
      "meal_count": 28,
      "days_logged": 7
    },
    "daily_averages": {
      "daily_calories": 1250,
      "daily_protein": 65,
      "daily_carbs": 150,
      "daily_fat": 45
    },
    "daily_breakdown": [
      {
        "date": "2025-02-03",
        "calories": 1200,
        "protein": 60,
        "carbs": 140,
        "fat": 40,
        "fiber": 18,
        "sugar": 24,
        "sodium": 800
      }
    ],
    "weight_trend": {
      "current_weight": 70.5,
      "weight_change": -0.5,
      "trend_direction": "decreasing"
    },
    "goal_progress": [
      {
        "id": 1,
        "title": "ลดน้ำหนัก 5 กิโลกรัม",
        "goal_type": "weight_loss",
        "target_value": 5,
        "current_value": 2.5,
        "progress_percentage": 50,
        "status": "active",
        "target_date": "2025-04-01"
      }
    ],
    "insights": {
      "most_logged_meal": "breakfast",
      "average_meals_per_day": 4
    }
  }
}
```

### 10. Get Food Log Dashboard
**GET** `/food-log/dashboard`

**✨ NEW ENDPOINT** - Complete dashboard data including today's nutrition, weekly trends, health metrics, and notifications.

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "date": "2025-02-09",
      "nutrition": {
        "calories": 1250,
        "protein": 65,
        "carbs": 150,
        "fat": 45,
        "fiber": 18,
        "meals_logged": 4
      },
      "meal_distribution": {
        "breakfast": 450,
        "lunch": 380,
        "dinner": 320,
        "snack": 100
      },
      "recent_meals": [
        {
          "id": 123,
          "meal_type": "breakfast",
          "food_name": "ข้าวผัดกุ้ง",
          "calories": 450,
          "consumed_at": "2025-02-09T07:30:00.000Z"
        }
      ]
    },
    "weekly_trends": [
      {
        "date": "2025-02-03",
        "calories": 1200,
        "meals": 4
      },
      {
        "date": "2025-02-04",
        "calories": 1300,
        "meals": 4
      }
    ],
    "health_metrics": {
      "weight": 70.5,
      "bmi": 22.8,
      "body_fat": 15.2
    },
    "active_goals": [
      {
        "id": 1,
        "title": "ลดน้ำหนัก 5 กิโลกรัม",
        "goal_type": "weight_loss",
        "progress_percentage": 50,
        "target_date": "2025-04-01"
      }
    ],
    "notifications": [
      {
        "id": 1,
        "type": "nutrition",
        "title": "เป้าหมายโปรตีน",
        "message": "คุณได้รับโปรตีนเพียงพอแล้ววันนี้",
        "created_at": "2025-02-09T08:00:00.000Z",
        "is_read": false
      }
    ],
    "insights": [
      {
        "type": "suggestion",
        "message": "คุณบันทึกอาหาร 4 มื้อแล้ววันนี้ ดีมาก!",
        "priority": "low"
      }
    ],
    "quick_stats": {
      "total_meals_this_week": 28,
      "average_daily_calories": 1250,
      "most_active_meal_time": "breakfast"
    }
  }
}
```

---

## 🔍 Meal Type Filtering

### 11. Get Food Logs by Meal Type
**GET** `/food-log/meal-types/{mealType}`

Get food logs filtered by specific meal type.

**Path Parameters:**
- `mealType`: breakfast, lunch, dinner, snack

**Query Parameters:**
- `date_from` (optional): Start date filter
- `date_to` (optional): End date filter

---

## 🤖 AI & Recommendations

### 12. Get Nutrition Analysis
**GET** `/food-log/nutrition-analysis`

AI-powered nutrition analysis and recommendations.

**Query Parameters:**
- `date` (optional): Target date for analysis

### 13. Get Food Recommendations
**GET** `/food-log/recommendations`

Get personalized food recommendations based on user's history and goals.

---

## 📝 Sample Data for Testing

### Thai Food Examples

#### Breakfast Options:
```json
{
  "meal_type": "breakfast",
  "food_name": "โจ๊กหมู",
  "quantity": 1,
  "unit": "ชาม",
  "calories": 320,
  "protein_g": 18,
  "carbs_g": 45,
  "fat_g": 8,
  "consumed_at": "2025-02-09T07:00:00.000Z"
}
```

#### Lunch Options:
```json
{
  "meal_type": "lunch",
  "food_name": "ส้มตำไทย",
  "quantity": 1,
  "unit": "จาน",
  "calories": 280,
  "protein_g": 8,
  "carbs_g": 35,
  "fat_g": 12,
  "consumed_at": "2025-02-09T12:30:00.000Z"
}
```

#### Dinner Options:
```json
{
  "meal_type": "dinner",
  "food_name": "แกงเขียวหวานไก่",
  "quantity": 1,
  "unit": "ถ้วย",
  "calories": 380,
  "protein_g": 28,
  "carbs_g": 15,
  "fat_g": 25,
  "consumed_at": "2025-02-09T19:00:00.000Z"
}
```

#### Snack Options:
```json
{
  "meal_type": "snack",
  "food_name": "มะม่วงน้ำดอกไม้",
  "quantity": 1,
  "unit": "ลูก",
  "calories": 150,
  "protein_g": 2,
  "carbs_g": 35,
  "fat_g": 1,
  "consumed_at": "2025-02-09T15:30:00.000Z"
}
```

---

## 🚨 Error Handling

### Common Error Responses:

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "meal_type must be one of: breakfast, lunch, dinner, snack"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid or missing authentication token"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Food log not found",
  "error": "No food log found with the specified ID"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create food log",
  "error": "Database connection error"
}
```

---

## 📊 Response Data Structures

### Food Log Response Structure
```typescript
interface FoodLogResponse {
  id: number;
  userId: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  notes?: string;
  consumed_at: Date;
  created_at: Date;
  total_nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  is_complete_nutrition: boolean;
  meal_time: string;
  meal_date: string;
}
```

---

## 🧪 Testing Scenarios

### 1. Complete Day Logging
Test logging a full day of meals:
1. Create breakfast entry
2. Create lunch entry  
3. Create dinner entry
4. Create snack entries
5. Get daily summary via `/food-log/stats`
6. Get dashboard data via `/food-log/dashboard`

### 2. Weekly Analysis
Test weekly nutrition tracking:
1. Create multiple entries across 7 days
2. Get weekly summary via `/food-log/summary?period=week`
3. Get trends via `/food-log/trends?days=7`

### 3. Goal Tracking Integration
Test integration with health goals:
1. Create food entries
2. Check goal progress in summary endpoint
3. Verify weight trend analysis

### 4. Error Handling
Test various error scenarios:
1. Invalid meal_type values
2. Missing required fields
3. Invalid date formats
4. Unauthorized access
5. Non-existent IDs

---

## 🔧 Postman Collection Usage

### Import Instructions:
1. Open Postman
2. Click "Import"
3. Select `Food-Log-API-Postman-Collection.json`
4. Set environment variables:
   - `base_url`: http://localhost:8080
   - `auth_token`: (will be auto-set after login)

### Testing Workflow:
1. **Authentication**: Run "Login" request first
2. **CRUD Operations**: Test create, read, update, delete
3. **Analytics**: Test stats, trends, and summary endpoints
4. **Dashboard**: Test new dashboard endpoint
5. **Error Cases**: Test invalid requests

### Environment Variables:
- `{{base_url}}`: API base URL
- `{{auth_token}}`: JWT authentication token
- `{{user_id}}`: Current user ID
- `{{food_log_id}}`: Last created food log ID

---

## 🌟 Key Features

### ✅ Implemented Features:
- ✅ Complete CRUD operations for food logs
- ✅ Meal type filtering (breakfast, lunch, dinner, snack)
- ✅ Date range filtering
- ✅ Nutrition statistics and analytics
- ✅ Weekly/monthly trend analysis
- ✅ Dashboard summary with health metrics integration
- ✅ Goal progress tracking
- ✅ AI-powered nutrition analysis
- ✅ Personalized food recommendations
- ✅ JWT authentication
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Pagination support

### 🔄 Integration Points:
- **Users Table**: User authentication and profile data
- **Health Goals**: Goal progress tracking and recommendations
- **Health Metrics**: Weight trends and BMI calculations
- **Notifications**: Nutrition-related alerts and reminders
- **AI Service**: Nutrition analysis and food recommendations

---

## 🚀 Quick Start Guide

### 1. Start the Server
```bash
npm run start:dev
```
Server runs on: `http://localhost:8080`

### 2. Get Authentication Token
```bash
POST /auth/login
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

### 3. Create Your First Food Log
```bash
POST /food-log
Authorization: Bearer <your-token>
{
  "meal_type": "breakfast",
  "food_name": "ข้าวต้มกุ้ง",
  "quantity": 1,
  "unit": "ชาม",
  "calories": 300,
  "protein_g": 20,
  "carbs_g": 40,
  "fat_g": 8,
  "consumed_at": "2025-02-09T07:30:00.000Z"
}
```

### 4. View Your Dashboard
```bash
GET /food-log/dashboard
Authorization: Bearer <your-token>
```

---

## 📱 Frontend Integration

### For FoodLog.tsx Component:
- Use CRUD endpoints for meal logging
- Implement real-time nutrition tracking
- Show meal type distribution
- Display daily/weekly summaries

### For Dashboard.tsx Component:
- Use `/food-log/dashboard` for main dashboard
- Use `/food-log/summary` for detailed analytics
- Integrate with health goals and metrics
- Show nutrition insights and recommendations

---

## 🔒 Security Features

- **JWT Authentication**: All endpoints protected
- **User Isolation**: Users can only access their own data
- **Input Validation**: Comprehensive validation using class-validator
- **SQL Injection Protection**: Parameterized queries via Supabase
- **CORS Configuration**: Proper CORS setup for frontend integration

---

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries on user_id and consumed_at
- **Pagination**: Built-in pagination for large datasets
- **Caching**: Consider implementing Redis for frequently accessed data
- **Rate Limiting**: Implement rate limiting for production use

---

## 🛠️ Development Notes

### Database Schema:
- Uses PostgreSQL via Supabase
- Supports decimal precision for nutrition values
- Includes computed properties for convenience
- Proper foreign key relationships

### Code Structure:
- **Controller**: [`src/controllers/food-log.controller.ts`](src/controllers/food-log.controller.ts)
- **Service**: [`src/services/food-log.service.ts`](src/services/food-log.service.ts)
- **DTOs**: [`src/dto/food-log.dto.ts`](src/dto/food-log.dto.ts)
- **Entity**: [`src/entities/food-log.entity.ts`](src/entities/food-log.entity.ts)

### Testing:
- Use Postman collection for manual testing
- Implement unit tests for service methods
- Add e2e tests for complete workflows
- Test error scenarios thoroughly

---

*Last Updated: February 9, 2025*
*API Version: 1.0.0*
*Server: http://localhost:8080*