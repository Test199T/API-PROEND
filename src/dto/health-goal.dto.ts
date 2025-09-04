import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import {
  GoalType,
  GoalStatus,
  GoalPriority,
} from '../entities/health-goal.entity';

// =====================================================
// HEALTH GOAL DTOs - สำหรับจัดการเป้าหมายสุขภาพ
// =====================================================

export class CreateHealthGoalDto {
  @IsEnum(GoalType)
  goal_type: GoalType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  target_value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  current_value?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  target_date?: string;

  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority;
}

export class UpdateHealthGoalDto {
  @IsOptional()
  @IsEnum(GoalType)
  goal_type?: GoalType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  target_value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  current_value?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  target_date?: string;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority;
}

export class HealthGoalResponseDto {
  id: number;
  userId: number;
  goal_type: GoalType;
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  start_date: Date;
  target_date?: Date;
  status: GoalStatus;
  priority: GoalPriority;
  created_at: Date;
  updated_at: Date;
  progress_percentage: number;
  is_overdue: boolean;
  days_remaining?: number;
  is_completed: boolean;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    fullName: string;
  };
}

export class HealthGoalListDto {
  goals: HealthGoalResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  stats: {
    active_goals: number;
    completed_goals: number;
    overdue_goals: number;
    total_progress: number;
  };
}

export class HealthGoalSearchDto {
  @IsOptional()
  @IsEnum(GoalType)
  goal_type?: GoalType;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  start_date_from?: string;

  @IsOptional()
  @IsDateString()
  start_date_to?: string;

  @IsOptional()
  @IsDateString()
  target_date_from?: string;

  @IsOptional()
  @IsDateString()
  target_date_to?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class HealthGoalProgressDto {
  goal_id: number;
  goal_title: string;
  goal_type: GoalType;
  target_value: number;
  current_value: number;
  unit: string;
  progress_percentage: number;
  days_remaining?: number;
  is_overdue: boolean;
  is_completed: boolean;
  status: GoalStatus;
  priority: GoalPriority;
  last_updated: Date;
  progress_history: {
    date: Date;
    value: number;
    change: number;
  }[];
}

export class HealthGoalStatsDto {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  paused_goals: number;
  cancelled_goals: number;
  overdue_goals: number;
  goals_by_type: Record<GoalType, number>;
  goals_by_priority: Record<GoalPriority, number>;
  average_completion_time_days: number;
  success_rate_percentage: number;
  monthly_progress: {
    month: string;
    goals_created: number;
    goals_completed: number;
    average_progress: number;
  }[];
}



export class HealthGoalTemplateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(GoalType)
  goal_type: GoalType;

  @IsNumber()
  @Min(0)
  default_target_value: number;

  @IsString()
  default_unit: string;

  @IsNumber()
  @Min(1)
  @Max(365)
  default_duration_days: number;

  @IsEnum(GoalPriority)
  default_priority: GoalPriority;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  category: string;
}

export class HealthGoalRecommendationDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(GoalType)
  goal_type: GoalType;

  @IsNumber()
  @Min(0)
  suggested_target_value: number;

  @IsString()
  suggested_unit: string;

  @IsNumber()
  @Min(1)
  @Max(365)
  suggested_duration_days: number;

  @IsEnum(GoalPriority)
  suggested_priority: GoalPriority;

  @IsString()
  reasoning: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence_score: number;

  @IsArray()
  @IsString({ each: true })
  related_goals: string[];
}
