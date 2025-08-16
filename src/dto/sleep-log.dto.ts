import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum SleepQuality {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent',
}

export class CreateSleepLogDto {
  @IsDateString()
  sleep_time: string;

  @IsDateString()
  wake_time: string;

  @IsNumber()
  @Min(0)
  @Max(24)
  total_sleep_hours: number;

  @IsEnum(SleepQuality)
  sleep_quality: SleepQuality;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  stress_level?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  caffeine_intake?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  exercise_before_bed?: number;
}

export class UpdateSleepLogDto {
  @IsOptional()
  @IsDateString()
  sleep_time?: string;

  @IsOptional()
  @IsDateString()
  wake_time?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  total_sleep_hours?: number;

  @IsOptional()
  @IsEnum(SleepQuality)
  sleep_quality?: SleepQuality;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  stress_level?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  caffeine_intake?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  exercise_before_bed?: number;
}

export class SleepLogResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  user_id: string;

  @IsDateString()
  sleep_time: string;

  @IsDateString()
  wake_time: string;

  @IsNumber()
  total_sleep_hours: number;

  @IsEnum(SleepQuality)
  sleep_quality: SleepQuality;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  stress_level?: number;

  @IsOptional()
  @IsNumber()
  caffeine_intake?: number;

  @IsOptional()
  @IsNumber()
  exercise_before_bed?: number;

  @IsDateString()
  created_at: string;

  @IsDateString()
  updated_at: string;
}

export class SleepLogQueryDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsEnum(SleepQuality)
  sleep_quality?: SleepQuality;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
