# VITA WISE AI - Complete API Implementation Guide

## Overview
This document provides a comprehensive guide to the complete VITA WISE AI Health Tracking Application backend API, including all DTOs, controllers, and endpoints that have been implemented according to the database schema.

## Architecture
- **Framework**: NestJS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with AuthGuard
- **Validation**: class-validator decorators
- **Response Format**: Standardized ResponseDto wrapper

## Complete DTOs Implementation

### 1. Sleep Log DTOs
- `CreateSleepLogDto` - For creating new sleep logs
- `UpdateSleepLogDto` - For updating existing sleep logs
- `SleepLogResponseDto` - For API responses
- `SleepLogQueryDto` - For querying sleep logs
- **Enums**: `SleepQuality` (poor, fair, good, excellent)

### 2. Water Log DTOs
- `CreateWaterLogDto` - For creating new water logs
- `UpdateWaterLogDto` - For updating existing water logs
- `WaterLogResponseDto` - For API responses
- `WaterLogQueryDto` - For querying water logs
- `DailyWaterGoalDto` - For setting daily water goals

### 3. Health Metric DTOs
- `CreateHealthMetricDto` - For creating new health metrics
- `UpdateHealthMetricDto` - For updating existing health metrics
- `HealthMetricResponseDto` - For API responses
- `HealthMetricQueryDto` - For querying health metrics
- `HealthMetricTrendDto` - For trend analysis
- **Enums**: 
  - `MetricType` (blood_pressure, heart_rate, blood_sugar, etc.)
  - `MetricUnit` (mmHg, bpm, mg/dL, etc.)

### 4. Chat Session DTOs
- `CreateChatSessionDto` - For creating new chat sessions
- `UpdateChatSessionDto` - For updating existing chat sessions
- `ChatSessionResponseDto` - For API responses
- `ChatSessionQueryDto` - For querying chat sessions
- `ChatSessionSummaryDto` - For session summaries
- **Enums**: 
  - `ChatSessionStatus` (active, closed, archived)
  - `ChatSessionType` (general_health, nutrition, exercise, etc.)

### 5. Chat Message DTOs
- `CreateChatMessageDto` - For creating new chat messages
- `UpdateChatMessageDto` - For updating existing chat messages
- `ChatMessageResponseDto` - For API responses
- `ChatMessageQueryDto` - For querying chat messages
- `SendMessageDto` - For sending messages
- `AIAnalysisRequestDto` - For AI analysis requests
- **Enums**: 
  - `MessageRole` (user, assistant, system)
  - `MessageType` (text, image, file, quick_response)

### 6. Notification DTOs
- `CreateNotificationDto` - For creating new notifications
- `UpdateNotificationDto` - For updating existing notifications
- `NotificationResponseDto` - For API responses
- `NotificationQueryDto` - For querying notifications
- `MarkNotificationReadDto` - For marking notifications as read
- `NotificationPreferencesDto` - For notification preferences
- **Enums**: 
  - `NotificationType` (reminder, alert, achievement, etc.)
  - `NotificationPriority` (low, medium, high, urgent)
  - `NotificationStatus` (unread, read, archived)

### 7. AI Insight DTOs
- `CreateAIInsightDto` - For creating new AI insights
- `UpdateAIInsightDto` - For updating existing AI insights
- `AIInsightResponseDto` - For API responses
- `AIInsightQueryDto` - For querying AI insights
- `MarkInsightReadDto` - For marking insights as read
- `InsightFeedbackDto` - For providing feedback on insights
- **Enums**: 
  - `InsightType` (nutrition, exercise, sleep, mental_health, etc.)
  - `InsightPriority` (low, medium, high, critical)
  - `InsightStatus` (active, acknowledged, implemented, dismissed)

### 8. User Preference DTOs
- `CreateUserPreferenceDto` - For creating new user preferences
- `UpdateUserPreferenceDto` - For updating existing user preferences
- `UserPreferenceResponseDto` - For API responses
- `NotificationPreferenceDto` - For notification preferences
- `PrivacyPreferenceDto` - For privacy settings
- **Enums**: 
  - `ThemePreference` (light, dark, auto)
  - `LanguagePreference` (th, en)
  - `MeasurementUnit` (metric, imperial)
  - `PrivacyLevel` (private, friends_only, public)

### 9. Common DTOs
- `PaginationDto` - For pagination parameters
- `SearchDto` - For search and filtering
- `ResponseDto<T>` - Standardized API response wrapper
- `BulkOperationDto` - For bulk operations
- `FileUploadDto` - For file uploads
- `DateRangeDto` - For date range queries
- `ExportDataDto` - For data export
- `ImportDataDto` - For data import

## Complete Controllers Implementation

### 1. Sleep Log Controller (`/sleep-logs`)
- `POST /` - Create sleep log
- `GET /` - Get sleep logs with filtering
- `GET /:id` - Get specific sleep log
- `PUT /:id` - Update sleep log
- `DELETE /:id` - Delete sleep log
- `GET /stats/daily` - Get daily sleep statistics
- `GET /stats/weekly` - Get weekly sleep statistics
- `GET /trends/quality` - Get sleep quality trends
- `GET /insights/recommendations` - Get sleep recommendations

### 2. Water Log Controller (`/water-logs`)
- `POST /` - Create water log
- `GET /` - Get water logs with filtering
- `GET /:id` - Get specific water log
- `PUT /:id` - Update water log
- `DELETE /:id` - Delete water log
- `GET /stats/daily` - Get daily water statistics
- `GET /stats/weekly` - Get weekly water statistics
- `GET /goals/daily` - Get daily water goal
- `POST /goals/daily` - Set daily water goal
- `GET /progress/today` - Get today's water progress
- `GET /trends/consumption` - Get water consumption trends
- `GET /insights/hydration` - Get hydration insights

### 3. Health Metric Controller (`/health-metrics`)
- `POST /` - Create health metric
- `GET /` - Get health metrics with filtering
- `GET /:id` - Get specific health metric
- `PUT /:id` - Update health metric
- `DELETE /:id` - Delete health metric
- `GET /types/:metricType` - Get metrics by type
- `GET /stats/summary` - Get health metrics summary
- `GET /trends/:metricType` - Get metric trends
- `GET /latest/:metricType` - Get latest metric
- `GET /ranges/:metricType` - Get metric ranges
- `GET /insights/analysis` - Get health metrics analysis
- `POST /bulk` - Create bulk health metrics
- `GET /export/:format` - Export health metrics

### 4. Notification Controller (`/notifications`)
- `POST /` - Create notification
- `GET /` - Get notifications with filtering
- `GET /:id` - Get specific notification
- `PUT /:id` - Update notification
- `DELETE /:id` - Delete notification
- `POST /mark-read` - Mark notification as read
- `GET /unread/count` - Get unread notification count
- `GET /types/:type` - Get notifications by type
- `GET /priority/:priority` - Get notifications by priority
- `GET /preferences` - Get notification preferences
- `PUT /preferences` - Update notification preferences
- `POST /bulk/delete` - Delete bulk notifications
- `POST /bulk/mark-read` - Mark bulk notifications as read
- `GET /stats/summary` - Get notification statistics
- `GET /templates` - Get notification templates

### 5. AI Insight Controller (`/ai-insights`)
- `POST /` - Create AI insight
- `GET /` - Get AI insights with filtering
- `GET /:id` - Get specific AI insight
- `PUT /:id` - Update AI insight
- `DELETE /:id` - Delete AI insight
- `POST /generate` - Generate new AI insight
- `POST /analyze` - Analyze health data
- `POST /mark-read` - Mark insight as read
- `POST /feedback` - Provide insight feedback
- `GET /types/:type` - Get insights by type
- `GET /priority/:priority` - Get insights by priority
- `GET /unread/count` - Get unread insight count
- `GET /recommendations/personalized` - Get personalized recommendations
- `GET /trends/health-scores` - Get health score trends
- `GET /stats/summary` - Get AI insight statistics
- `POST /bulk/delete` - Delete bulk AI insights
- `POST /bulk/mark-read` - Mark bulk AI insights as read

### 6. User Preference Controller (`/user-preferences`)
- `POST /` - Create user preference
- `GET /` - Get user preference
- `PUT /` - Update user preference
- `DELETE /` - Delete user preference
- `GET /theme` - Get user theme
- `PUT /theme` - Update user theme
- `GET /language` - Get user language
- `PUT /language` - Update user language
- `GET /measurement-unit` - Get user measurement unit
- `PUT /measurement-unit` - Update user measurement unit
- `GET /privacy` - Get user privacy settings
- `PUT /privacy` - Update user privacy settings
- `GET /notifications` - Get user notification preferences
- `PUT /notifications` - Update user notification preferences
- `GET /health-focus-areas` - Get user health focus areas
- `PUT /health-focus-areas` - Update user health focus areas
- `GET /custom-goals` - Get user custom goals
- `PUT /custom-goals` - Update user custom goals
- `GET /timezone` - Get user timezone
- `PUT /timezone` - Update user timezone
- `GET /quiet-hours` - Get user quiet hours
- `PUT /quiet-hours` - Update user quiet hours
- `POST /reset-to-defaults` - Reset preferences to defaults
- `GET /export` - Export user preferences

## Authentication & Security

### JWT Authentication
All endpoints (except auth endpoints) are protected with `@UseGuards(AuthGuard)`

### User Context
Controllers use `@User('id')` decorator to extract authenticated user ID

### Input Validation
All DTOs use `class-validator` decorators for comprehensive validation

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Operation failed",
  "error": "Detailed error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (for deletions)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Types
- `ServiceError` - General service errors
- `ValidationError` - Input validation errors
- `NotFoundError` - Resource not found
- `ConflictError` - Resource conflicts
- `UnauthorizedError` - Authentication/authorization errors

## Database Integration

### Supabase Service
Centralized service for all database operations with methods for:
- CRUD operations on all entities
- Complex queries and filtering
- Bulk operations
- Data aggregation and statistics

### Entity Relationships
All entities maintain proper relationships as defined in the database schema:
- User as the central entity
- One-to-many relationships with health logs
- One-to-one relationship with user preferences
- Proper foreign key constraints

## Testing

### Unit Tests
Each controller and service should have corresponding unit tests

### Integration Tests
Test complete API endpoints with authentication

### E2E Tests
Test complete user workflows

## Future Enhancements

### Real-time Features
- WebSocket integration for live updates
- Real-time notifications
- Live chat functionality

### Advanced AI Features
- Integration with real AI models
- Machine learning for health predictions
- Personalized health recommendations

### Analytics & Reporting
- Advanced health analytics
- Custom report generation
- Data visualization endpoints

### Mobile App Support
- Push notification endpoints
- Offline data synchronization
- Mobile-specific optimizations

## Getting Started

### Prerequisites
- Node.js 18+
- NestJS CLI
- Supabase account and project

### Installation
```bash
npm install
```

### Environment Variables
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
```

### Running the Application
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

### API Documentation
The API is now fully implemented with comprehensive endpoints covering all aspects of the VITA WISE AI health tracking application. All DTOs and controllers have been created according to the database schema requirements, providing a robust and scalable backend system.
