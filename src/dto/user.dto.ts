import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, ActivityLevel } from '../entities/user.entity';

// =====================================================
// HEALTH PROFILE DTOs - สำหรับข้อมูลสุขภาพแบบครบถ้วน
// =====================================================

// DTO สำหรับข้อมูลสุขภาพเพิ่มเติม
export class HealthDataDto {
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  waist_circumference_cm?: number; // รอบเอว

  @IsOptional()
  @IsNumber()
  @Min(70)
  @Max(200)
  blood_pressure_systolic?: number; // ความดันโลหิตตัวบน

  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(130)
  blood_pressure_diastolic?: number; // ความดันโลหิตตัวล่าง

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(400)
  blood_sugar_mg_dl?: number; // น้ำตาลในเลือด mg/dL
}

// DTO สำหรับเป้าหมายสุขภาพ
export class HealthGoalsDto {
  @IsOptional()
  @IsString()
  main_goal?: string; // เป้าหมายหลัก

  @IsOptional()
  @IsString()
  goal_duration?: string; // ระยะเวลาเป้าหมาย

  @IsOptional()
  @IsString()
  motivation?: string; // แรงจูงใจ

  @IsOptional()
  @IsNumber()
  target_weight_kg?: number; // เป้าหมายน้ำหนัก

  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(12)
  target_sleep_hours?: number; // เป้าหมายการนอน ชั่วโมง/วัน

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  target_exercise_minutes_per_day?: number; // เป้าหมายออกกำลังกาย นาที/วัน
}

// DTO สำหรับเป้าหมายโภชนาการ
export class NutritionGoalsDto {
  @IsOptional()
  @IsNumber()
  @Min(800)
  @Max(5000)
  target_calories_per_day?: number; // เป้าหมายแคลอรี่ kcal/วัน

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  target_protein_grams_per_day?: number; // เป้าหมายโปรตีน กรัม/วัน

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(500)
  target_carbs_grams_per_day?: number; // เป้าหมายคาร์โบไฮเดรต กรัม/วัน

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(200)
  target_fat_grams_per_day?: number; // เป้าหมายไขมัน กรัม/วัน

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(60)
  target_fiber_grams_per_day?: number; // เป้าหมายไฟเบอร์ กรัม/วัน

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(5000)
  target_sodium_mg_per_day?: number; // เป้าหมายโซเดียม มิลลิกรัม/วัน

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietary_restrictions?: string[]; // ข้อจำกัดอาหาร
}

// DTO สำหรับพฤติกรรมประจำวัน
export class DailyBehaviorDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(7)
  exercise_frequency_per_week?: number; // ความถี่การออกกำลังกาย ครั้ง/สัปดาห์

  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(12)
  average_sleep_hours_per_day?: number; // ชั่วโมงการนอนต่อวัน

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  meals_per_day?: number; // มื้ออาหารต่อวัน

  @IsOptional()
  @IsEnum(['never', 'occasionally', 'regularly', 'frequently'])
  alcohol_consumption?: string; // การดื่มแอลกอฮอล์

  @IsOptional()
  @IsEnum(['never', 'former', 'current'])
  smoking_status?: string; // สถานะการสูบบุหรี่

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(5000)
  daily_water_goal_ml?: number; // เป้าหมายน้ำดื่มต่อวัน มิลลิลิตร
}

// DTO สำหรับประวัติสุขภาพ
export class MedicalHistoryDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chronic_conditions?: string[]; // โรคประจำตัว

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  surgery_history?: string[]; // ประวัติการผ่าตัด

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[]; // ประวัติการแพ้

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[]; // ยาที่กำลังใช้

  @IsOptional()
  @IsString()
  family_medical_history?: string; // ประวัติครอบครัว
}

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

  // เพิ่มข้อมูลครบถ้วนตามที่ระบุ
  @IsOptional()
  @ValidateNested()
  @Type(() => HealthDataDto)
  health_data?: HealthDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HealthGoalsDto)
  health_goals?: HealthGoalsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NutritionGoalsDto)
  nutrition_goals?: NutritionGoalsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DailyBehaviorDto)
  daily_behavior?: DailyBehaviorDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalHistoryDto)
  medical_history?: MedicalHistoryDto;

  // เพิ่ม properties ที่ frontend ส่งมา
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(120)
  age?: number;

  // สำหรับ frontend ที่ใช้ birth_date
  @IsOptional()
  @IsDateString()
  birth_date?: string;
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

  // เพิ่มข้อมูลครบถ้วนตามที่ระบุ
  @IsOptional()
  @ValidateNested()
  @Type(() => HealthDataDto)
  health_data?: HealthDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HealthGoalsDto)
  health_goals?: HealthGoalsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NutritionGoalsDto)
  nutrition_goals?: NutritionGoalsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DailyBehaviorDto)
  daily_behavior?: DailyBehaviorDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalHistoryDto)
  medical_history?: MedicalHistoryDto;

  // เพิ่ม properties ที่ frontend ส่งมา
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(120)
  age?: number;

  // สำหรับ frontend ที่ใช้ birth_date
  @IsOptional()
  @IsDateString()
  birth_date?: string;
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

  // ข้อมูลสุขภาพเพิ่มเติม
  health_data?: {
    waist_circumference_cm?: number;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    blood_sugar_mg_dl?: number;
  };

  // เป้าหมายสุขภาพ
  health_goals?: {
    main_goal?: string;
    goal_duration?: string;
    motivation?: string;
    target_weight_kg?: number;
    target_sleep_hours?: number;
    target_exercise_minutes_per_day?: number;
  };

  // เป้าหมายโภชนาการ
  nutrition_goals?: {
    target_calories_per_day?: number;
    target_protein_grams_per_day?: number;
    target_carbs_grams_per_day?: number;
    target_fat_grams_per_day?: number;
    target_fiber_grams_per_day?: number;
    target_sodium_mg_per_day?: number;
    dietary_restrictions?: string[];
  };

  // พฤติกรรมประจำวัน
  daily_behavior?: {
    exercise_frequency_per_week?: number;
    average_sleep_hours_per_day?: number;
    meals_per_day?: number;
    alcohol_consumption?: string;
    smoking_status?: string;
    daily_water_goal_ml?: number;
  };

  // ประวัติสุขภาพ
  medical_history?: {
    chronic_conditions?: string[];
    surgery_history?: string[];
    allergies?: string[];
    medications?: string[];
    family_medical_history?: string;
  };
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

  // ข้อมูลสุขภาพเพิ่มเติม
  health_data?: {
    waist_circumference_cm?: number;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    blood_sugar_mg_dl?: number;
  };

  // เป้าหมายสุขภาพ
  health_goals?: {
    main_goal?: string;
    goal_duration?: string;
    motivation?: string;
    target_weight_kg?: number;
    target_sleep_hours?: number;
    target_exercise_minutes_per_day?: number;
  };

  // เป้าหมายโภชนาการ
  nutrition_goals?: {
    target_calories_per_day?: number;
    target_protein_grams_per_day?: number;
    target_carbs_grams_per_day?: number;
    target_fat_grams_per_day?: number;
    target_fiber_grams_per_day?: number;
    target_sodium_mg_per_day?: number;
    dietary_restrictions?: string[];
  };

  // พฤติกรรมประจำวัน
  daily_behavior?: {
    exercise_frequency_per_week?: number;
    average_sleep_hours_per_day?: number;
    meals_per_day?: number;
    alcohol_consumption?: string;
    smoking_status?: string;
    daily_water_goal_ml?: number;
  };

  // ประวัติสุขภาพ
  medical_history?: {
    chronic_conditions?: string[];
    surgery_history?: string[];
    allergies?: string[];
    medications?: string[];
    family_medical_history?: string;
  };

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
