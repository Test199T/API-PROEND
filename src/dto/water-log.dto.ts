import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class CreateWaterLogDto {
  @IsNumber()
  @Min(0)
  @Max(10000)
  amount_ml: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  drink_type?: string; // water, tea, coffee, etc.

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  hydration_level?: number; // 0-10 scale
}

export class UpdateWaterLogDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  amount_ml?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  drink_type?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  hydration_level?: number;
}

export class WaterLogResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  user_id: string;

  @IsNumber()
  amount_ml: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  drink_type?: string;

  @IsOptional()
  @IsNumber()
  hydration_level?: number;

  @IsDateString()
  created_at: string;

  @IsDateString()
  updated_at: string;
}

export class WaterLogQueryDto {
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
  @IsString()
  drink_type?: string;

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

export class DailyWaterGoalDto {
  @IsNumber()
  @Min(0)
  @Max(10000)
  daily_goal_ml: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
