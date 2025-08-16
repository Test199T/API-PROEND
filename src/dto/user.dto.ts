import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Gender, ActivityLevel } from '../entities/user.entity';

// =====================================================
// USER DTOs - สำหรับจัดการข้อมูลผู้ใช้
// =====================================================

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  height_cm?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight_kg?: number;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activity_level?: ActivityLevel;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  height_cm?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight_kg?: number;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activity_level?: ActivityLevel;
}

export class UpdatePasswordDto {
  @IsString()
  current_password: string;

  @IsString()
  new_password: string;

  @IsString()
  confirm_password: string;
}

export class UserResponseDto {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  gender?: Gender;
  height_cm?: number;
  weight_kg?: number;
  activity_level?: ActivityLevel;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  age?: number;
  bmi?: number;
  fullName: string;
}

export class UserProfileDto {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  gender?: Gender;
  height_cm?: number;
  weight_kg?: number;
  activity_level?: ActivityLevel;
  age?: number;
  bmi?: number;
  fullName: string;
  healthGoals?: any[];
  recentFoodLogs?: any[];
  recentExerciseLogs?: any[];
  recentSleepLogs?: any[];
  recentWaterLogs?: any[];
  healthMetrics?: any[];
}

export class UserLoginDto {
  @IsString()
  username_or_email: string;

  @IsString()
  password: string;
}

export class UserRegisterDto extends CreateUserDto {
  @IsString()
  confirm_password: string;
}

export class UserSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activity_level?: ActivityLevel;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class UserStatsDto {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_gender: Record<Gender, number>;
  users_by_activity_level: Record<ActivityLevel, number>;
  average_age: number;
  average_bmi: number;
  users_created_today: number;
  users_created_this_week: number;
  users_created_this_month: number;
}

export class UserDashboardDto {
  user: UserProfileDto;
  today_stats: {
    calories_consumed: number;
    calories_burned: number;
    water_consumed_ml: number;
    sleep_hours: number;
    sleep_quality: number;
  };
  weekly_stats: {
    total_calories: number;
    total_exercise_minutes: number;
    average_sleep_hours: number;
    average_water_ml: number;
  };
  monthly_stats: {
    weight_change: number;
    bmi_change: number;
    goals_completed: number;
    goals_in_progress: number;
  };
  recent_activities: any[];
  upcoming_goals: any[];
  health_tips: string[];
}
