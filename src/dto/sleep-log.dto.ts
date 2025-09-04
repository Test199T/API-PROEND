import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
  Min,
  Max,
  Matches,
} from 'class-validator';
import {
  SleepQuality,
  SleepStage,
} from '../entities/sleep-log.entity';

// =====================================================
// SLEEP LOG DTOs - สำหรับจัดการข้อมูลการนอน
// =====================================================

export class CreateSleepLogDto {
  @IsDateString()
  sleep_date: string; // YYYY-MM-DD format

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'bedtime ต้องเป็นรูปแบบ HH:MM',
  })
  bedtime: string; // HH:MM format

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'wake_time ต้องเป็นรูปแบบ HH:MM',
  })
  wake_time: string; // HH:MM format

  @IsNumber()
  @Min(0)
  @Max(24)
  sleep_duration_hours: number;

  @IsEnum(SleepQuality)
  sleep_quality: SleepQuality;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  sleep_efficiency_percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  time_to_fall_asleep_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  awakenings_count?: number;

  // Sleep stages (in minutes)
  @IsOptional()
  @IsNumber()
  @Min(0)
  deep_sleep_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  light_sleep_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rem_sleep_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  awake_minutes?: number;

  // Heart rate metrics
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  heart_rate_avg?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  heart_rate_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  heart_rate_max?: number;

  @IsOptional()
  @IsNumber()
  @Min(70)
  @Max(100)
  oxygen_saturation_avg?: number;

  // Environmental factors
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(40)
  room_temperature_celsius?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  noise_level_db?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  light_level_lux?: number;

  // Lifestyle factors
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  caffeine_intake_mg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  alcohol_intake_ml?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(12)
  exercise_before_bed_hours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  screen_time_before_bed_minutes?: number;

  // Sleep aids and medications
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sleep_aids_used?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications_taken?: string[];

  // Subjective ratings (1-10 scale)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  stress_level?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  mood_before_sleep?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  mood_after_wake?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  energy_level?: number;

  // Notes and observations
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  dreams_remembered?: boolean;

  @IsOptional()
  @IsBoolean()
  nightmares?: boolean;
}

export class UpdateSleepLogDto {
  @IsOptional()
  @IsDateString()
  sleep_date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'bedtime ต้องเป็นรูปแบบ HH:MM',
  })
  bedtime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'wake_time ต้องเป็นรูปแบบ HH:MM',
  })
  wake_time?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  sleep_duration_hours?: number;

  @IsOptional()
  @IsEnum(SleepQuality)
  sleep_quality?: SleepQuality;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  sleep_efficiency_percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  time_to_fall_asleep_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  awakenings_count?: number;

  // Sleep stages
  @IsOptional()
  @IsNumber()
  @Min(0)
  deep_sleep_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  light_sleep_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rem_sleep_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  awake_minutes?: number;

  // Heart rate metrics
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  heart_rate_avg?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  heart_rate_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  heart_rate_max?: number;

  @IsOptional()
  @IsNumber()
  @Min(70)
  @Max(100)
  oxygen_saturation_avg?: number;

  // Environmental factors
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(40)
  room_temperature_celsius?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  noise_level_db?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  light_level_lux?: number;

  // Lifestyle factors
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  caffeine_intake_mg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  alcohol_intake_ml?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(12)
  exercise_before_bed_hours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  screen_time_before_bed_minutes?: number;

  // Sleep aids and medications
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sleep_aids_used?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications_taken?: string[];

  // Subjective ratings
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  stress_level?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  mood_before_sleep?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  mood_after_wake?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  energy_level?: number;

  // Notes and observations
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  dreams_remembered?: boolean;

  @IsOptional()
  @IsBoolean()
  nightmares?: boolean;
}

export class SleepLogResponseDto {
  id: number;
  userId: number;
  sleep_date: Date;
  bedtime: string;
  wake_time: string;
  sleep_duration_hours: number;
  sleep_quality: SleepQuality;
  sleep_efficiency_percentage: number;
  time_to_fall_asleep_minutes: number;
  awakenings_count: number;
  
  // Sleep stages
  deep_sleep_minutes: number;
  light_sleep_minutes: number;
  rem_sleep_minutes: number;
  awake_minutes: number;
  
  // Heart rate metrics
  heart_rate_avg: number;
  heart_rate_min: number;
  heart_rate_max: number;
  oxygen_saturation_avg: number;
  
  // Environmental factors
  room_temperature_celsius: number;
  noise_level_db: number;
  light_level_lux: number;
  
  // Lifestyle factors
  caffeine_intake_mg: number;
  alcohol_intake_ml: number;
  exercise_before_bed_hours: number;
  screen_time_before_bed_minutes: number;
  
  // Sleep aids and medications
  sleep_aids_used: string[];
  medications_taken: string[];
  
  // Subjective ratings
  stress_level: number;
  mood_before_sleep: number;
  mood_after_wake: number;
  energy_level: number;
  
  // Notes and observations
  notes: string;
  dreams_remembered: boolean;
  nightmares: boolean;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
  
  // Computed properties
  total_sleep_time_minutes: number;
  deep_sleep_percentage: number;
  light_sleep_percentage: number;
  rem_sleep_percentage: number;
  awake_percentage: number;
  sleep_duration_formatted: string;
  bedtime_formatted: string;
  wake_time_formatted: string;
  sleep_date_formatted: string;
  is_healthy_sleep_duration: boolean;
  is_healthy_sleep_efficiency: boolean;
  is_healthy_time_to_fall_asleep: boolean;
  sleep_score: number;
  sleep_quality_description: string;
  sleep_score_description: string;
  
  // User information
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    fullName: string;
  };
}

export class SleepLogListDto {
  sleep_logs: SleepLogResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  stats: {
    average_sleep_duration: number;
    average_sleep_quality: number;
    average_sleep_score: number;
    total_sleep_logs: number;
  };
}

export class SleepLogSearchDto {
  @IsOptional()
  @IsDateString()
  sleep_date_from?: string;

  @IsOptional()
  @IsDateString()
  sleep_date_to?: string;

  @IsOptional()
  @IsEnum(SleepQuality)
  sleep_quality?: SleepQuality;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  min_sleep_duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  max_sleep_duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  min_sleep_efficiency?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  max_sleep_efficiency?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  min_sleep_score?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  max_sleep_score?: number;

  @IsOptional()
  @IsString()
  search?: string; // Search in notes

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class SleepLogStatsDto {
  total_sleep_logs: number;
  average_sleep_duration_hours: number;
  average_sleep_efficiency_percentage: number;
  average_sleep_score: number;
  average_time_to_fall_asleep_minutes: number;
  average_awakenings_count: number;
  
  // Sleep quality distribution
  sleep_quality_distribution: Record<SleepQuality, number>;
  
  // Sleep duration distribution
  sleep_duration_distribution: {
    under_6_hours: number;
    six_to_seven_hours: number;
    seven_to_eight_hours: number;
    eight_to_nine_hours: number;
    over_9_hours: number;
  };
  
  // Sleep score distribution
  sleep_score_distribution: {
    excellent: number; // 90-100
    good: number; // 80-89
    fair: number; // 70-79
    poor: number; // 60-69
    very_poor: number; // 0-59
  };
  
  // Trends over time
  weekly_trends: {
    week: string;
    average_sleep_duration: number;
    average_sleep_score: number;
    sleep_logs_count: number;
  }[];
  
  // Sleep patterns
  bedtime_patterns: {
    hour: number;
    count: number;
  }[];
  
  wake_time_patterns: {
    hour: number;
    count: number;
  }[];
  
  // Health insights
  health_insights: {
    consistent_sleep_schedule: boolean;
    adequate_sleep_duration: boolean;
    good_sleep_efficiency: boolean;
    low_awakenings: boolean;
    recommendations: string[];
  };
}

export class SleepLogTrendsDto {
  period: string; // 'week', 'month', 'year'
  trends: {
    date: string;
    sleep_duration_hours: number;
    sleep_score: number;
    sleep_quality: SleepQuality;
    sleep_efficiency_percentage: number;
  }[];
  
  summary: {
    trend_direction: 'improving' | 'declining' | 'stable';
    average_change_percentage: number;
    key_insights: string[];
  };
}

export class SleepLogRecommendationDto {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable_steps: string[];
  expected_benefit: string;
  confidence_score: number; // 0-1
}

export class SleepLogAnalysisDto {
  overall_assessment: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: SleepLogRecommendationDto[];
  sleep_score_trend: 'improving' | 'declining' | 'stable';
  key_metrics: {
    metric: string;
    current_value: number;
    target_value: number;
    status: 'good' | 'needs_improvement' | 'poor';
  }[];
}