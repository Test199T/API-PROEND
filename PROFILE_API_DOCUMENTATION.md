# 🚀 Profile API Endpoints Documentation

## ✅ Successfully Created Profile UPDATE Endpoints

### 📁 Files Created:
- `/src/profile/profile.controller.ts` - Controller with GET and PUT endpoints
- `/src/profile/profile.service.ts` - Service using existing SupabaseService 
- `/src/profile/profile.module.ts` - Module configuration
- Updated `/src/app.module.ts` - Added ProfileModule import

### 🛠️ Technical Implementation:

#### 1. **Controller** (`profile.controller.ts`)
- Uses existing `AuthGuard` from `/src/auth/guards/auth.guard.ts`
- Extracts `userId` from JWT token via `req.user.id`
- Proper error handling with HTTP exceptions
- TypeScript linting compliant

#### 2. **Service** (`profile.service.ts`)  
- Leverages existing `SupabaseService` methods:
  - `getUserById()` for profile retrieval
  - `updateUser()` for profile updates
- Includes proper error handling and logging
- No duplicate Supabase client creation

#### 3. **Module** (`profile.module.ts`)
- Imports existing `SupabaseService`
- Exports `ProfileService` for potential reuse
- Clean module architecture

## 📍 API Endpoints

### 🔍 GET `/users/profile`
**Description:** Retrieve user profile with all related data

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response:**
```json
{
  "data": {
    "id": 123,
    "username": "user123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "height_cm": 175,
    "weight_kg": 70,
    "activity_level": "moderate",
    "health_data": {...},
    "health_goals": {...},
    "nutrition_goals": {...},
    "daily_behavior": {...},
    "medical_history": {...},
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Profile retrieved successfully"
}
```

### ✏️ PUT `/users/profile`
**Description:** Update user profile information

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "ชื่อใหม่",
  "last_name": "นามสกุลใหม่",
  "height_cm": 175,
  "weight_kg": 70,
  "activity_level": "moderate",
  "gender": "male"
}
```

**Response:**
```json
{
  "data": {
    "id": 123,
    "username": "user123",
    "email": "user@example.com",
    "first_name": "ชื่อใหม่",
    "last_name": "นามสกุลใหม่",
    "height_cm": 175,
    "weight_kg": 70,
    "activity_level": "moderate",
    "updated_at": "2024-01-01T12:30:00Z"
  },
  "message": "Profile updated successfully"
}
```

## 🧪 Testing

### Option 1: Using curl commands
```bash
# Get JWT token first
JWT_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}' | jq -r '.access_token')

# Test GET profile
curl -X GET "http://localhost:3000/users/profile" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Test PUT profile update  
curl -X PUT "http://localhost:3000/users/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "ชื่อใหม่",
    "last_name": "นามสกุลใหม่",
    "height_cm": 175,
    "weight_kg": 70
  }'
```

### Option 2: Using VS Code REST Client
Open `test-profile-endpoints.http` and replace `YOUR_JWT_TOKEN` with actual token.

### Option 3: Using test script
```bash
./test-profile-endpoints.sh
```

## 🔧 Features & Capabilities

### ✅ What Works:
- **Authentication:** JWT token validation via AuthGuard
- **Profile Retrieval:** Get complete user profile with related data
- **Profile Updates:** Update any user profile fields
- **Error Handling:** Proper HTTP status codes and error messages
- **Logging:** Console logs for debugging
- **TypeScript:** Full type safety (using any temporarily for flexibility)
- **Database Integration:** Uses existing Supabase service methods

### 🎯 Supported Update Fields:
- `first_name`, `last_name` - Personal information
- `height_cm`, `weight_kg` - Physical metrics  
- `activity_level` - Fitness level
- `gender`, `date_of_birth` - Demographics
- `health_data` - JSON health information
- `health_goals` - JSON goals data
- `nutrition_goals` - JSON nutrition targets
- `daily_behavior` - JSON behavior patterns
- `medical_history` - JSON medical records

### 🔐 Security:
- JWT authentication required
- User can only access/update their own profile
- Input validation through NestJS decorators
- Error messages don't expose sensitive information

## 🚀 Server Status
✅ **Server Running:** http://localhost:3000  
✅ **Profile Endpoints:** Available and mapped  
✅ **ProfileModule:** Loaded successfully  

## 🎉 Ready for Frontend Integration!

Your Profile UPDATE endpoints are now ready. The frontend can:

1. **Fetch user profile:** `GET /users/profile`
2. **Update profile:** `PUT /users/profile` 
3. **Handle responses:** Structured JSON with data and messages
4. **Error handling:** HTTP status codes and error messages

The backend now supports the profile editing functionality that was missing! 🎊
