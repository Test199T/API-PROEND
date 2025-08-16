import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import {
  ExerciseType,
  ExerciseIntensity,
} from '../entities/exercise-log.entity';

// =====================================================
// EXERCISE LOG DTOs - สำหรับจัดการบันทึกการออกกำลังกาย
// =====================================================

export class CreateExerciseLogDto {
  @IsString()
  exercise_name: string;

  @IsOptional()
  @IsEnum(ExerciseType)
  exercise_type?: ExerciseType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  duration_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  sets?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  reps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1000)
  weight_kg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1000)
  distance_km?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  calories_burned?: number;

  @IsOptional()
  @IsEnum(ExerciseIntensity)
  intensity?: ExerciseIntensity;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  exercise_date: string;

  @IsOptional()
  @IsString()
  exercise_time?: string;
}

export class UpdateExerciseLogDto {
  @IsOptional()
  @IsString()
  exercise_name?: string;

  @IsOptional()
  @IsEnum(ExerciseType)
  exercise_type?: ExerciseType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  duration_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  sets?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  reps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1000)
  weight_kg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1000)
  distance_km?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  calories_burned?: number;

  @IsOptional()
  @IsEnum(ExerciseIntensity)
  intensity?: ExerciseIntensity;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  exercise_date?: string;

  @IsOptional()
  @IsString()
  exercise_time?: string;
}

export class ExerciseLogResponseDto {
  id: number;
  userId: number;
  exercise_name: string;
  exercise_type?: ExerciseType;
  duration_minutes?: number;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  distance_km?: number;
  calories_burned?: number;
  intensity?: ExerciseIntensity;
  notes?: string;
  exercise_date: Date;
  exercise_time?: string;
  created_at: Date;
  total_volume?: number;
  is_strength_training: boolean;
  is_cardio: boolean;
  exercise_duration_formatted: string;
  exercise_date_formatted: string;
  calories_per_minute?: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    fullName: string;
  };
}

export class ExerciseLogListDto {
  exercise_logs: ExerciseLogResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  summary: {
    total_exercises: number;
    total_duration: number;
    total_calories_burned: number;
    total_distance: number;
    exercises_by_type: Record<ExerciseType, number>;
    exercises_by_intensity: Record<ExerciseIntensity, number>;
  };
}

export class ExerciseLogQueryDto {
  @IsOptional()
  @IsEnum(ExerciseType)
  exercise_type?: ExerciseType;

  @IsOptional()
  @IsEnum(ExerciseIntensity)
  intensity?: ExerciseIntensity;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  exercise_date_from?: string;

  @IsOptional()
  @IsDateString()
  exercise_date_to?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_minutes_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_minutes_max?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories_burned_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories_burned_max?: number;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class ExerciseLogSearchDto {
  @IsOptional()
  @IsEnum(ExerciseType)
  exercise_type?: ExerciseType;

  @IsOptional()
  @IsEnum(ExerciseIntensity)
  intensity?: ExerciseIntensity;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  exercise_date_from?: string;

  @IsOptional()
  @IsDateString()
  exercise_date_to?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_minutes_min?: number;

  @IsOptional()
  @Min(0)
  duration_minutes_max?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories_burned_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories_burned_max?: number;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class ExerciseLogStatsDto {
  total_entries: number;
  total_duration_minutes: number;
  total_calories_burned: number;
  total_distance_km: number;
  average_duration_per_exercise: number;
  average_calories_per_exercise: number;
  exercises_by_type: Record<ExerciseType, number>;
  exercises_by_intensity: Record<ExerciseIntensity, number>;
  daily_exercise: {
    date: string;
    duration_minutes: number;
    calories_burned: number;
    exercises: number;
  }[];
  weekly_summary: {
    week: string;
    total_duration: number;
    total_calories_burned: number;
    total_exercises: number;
    average_daily_duration: number;
  }[];
  monthly_summary: {
    month: string;
    total_duration: number;
    total_calories_burned: number;
    total_exercises: number;
    average_daily_duration: number;
    weight_change?: number;
  }[];
  strength_training_stats: {
    total_sets: number;
    total_reps: number;
    total_weight_lifted: number;
    average_weight_per_set: number;
    exercises_by_muscle_group: Record<string, number>;
  };
  cardio_stats: {
    total_distance: number;
    average_pace: number;
    total_time: number;
    exercises_by_type: Record<string, number>;
  };
}

export class ExerciseLogBulkCreateDto {
  @IsString()
  date: string;

  exercises: {
    exercise_name: string;
    exercise_type?: ExerciseType;
    duration_minutes?: number;
    sets?: number;
    reps?: number;
    weight_kg?: number;
    distance_km?: number;
    calories_burned?: number;
    intensity?: ExerciseIntensity;
    notes?: string;
    exercise_time?: string;
  }[];
}

export class ExerciseLogTemplateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  @IsNumber()
  @Min(1)
  @Max(1440)
  estimated_duration_minutes: number;

  @IsNumber()
  @Min(0)
  estimated_calories_burned: number;

  exercises: {
    exercise_name: string;
    exercise_type: ExerciseType;
    duration_minutes?: number;
    sets?: number;
    reps?: number;
    weight_kg?: number;
    distance_km?: number;
    intensity: ExerciseIntensity;
    notes?: string;
    rest_time_seconds?: number;
  }[];

  @IsString()
  warm_up_instructions: string;

  @IsString()
  cool_down_instructions: string;

  @IsString()
  equipment_needed: string;

  @IsString()
  safety_notes: string;
}

export class ExerciseLogRecommendationDto {
  @IsString()
  exercise_name: string;

  @IsString()
  reason: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence_score: number;

  @IsEnum(ExerciseType)
  exercise_type: ExerciseType;

  @IsNumber()
  @Min(1)
  @Max(1440)
  suggested_duration_minutes: number;

  @IsEnum(ExerciseIntensity)
  suggested_intensity: ExerciseIntensity;

  @IsString()
  benefits: string;

  @IsArray()
  @IsString({ each: true })
  alternatives: string[];

  @IsString()
  equipment_needed: string;

  @IsString()
  instructions: string;

  @IsString()
  safety_precautions: string;
}

export class ExerciseLogWorkoutPlanDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  goal: string;

  @IsNumber()
  @Min(1)
  @Max(7)
  days_per_week: number;

  @IsNumber()
  @Min(1)
  @Max(52)
  weeks: number;

  @IsString()
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  workouts: {
    day: number;
    name: string;
    focus: string;
    exercises: {
      exercise_name: string;
      exercise_type: ExerciseType;
      duration_minutes?: number;
      sets?: number;
      reps?: number;
      weight_kg?: number;
      distance_km?: number;
      intensity: ExerciseIntensity;
      rest_time_seconds?: number;
      notes?: string;
    }[];
    total_duration: number;
    total_calories: number;
  }[];

  @IsString()
  progression_plan: string;

  @IsString()
  rest_days: string;

  @IsString()
  nutrition_guidelines: string;
}
