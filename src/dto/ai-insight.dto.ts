import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export enum InsightType {
  NUTRITION = 'nutrition',
  EXERCISE = 'exercise',
  SLEEP = 'sleep',
  MENTAL_HEALTH = 'mental_health',
  GENERAL_HEALTH = 'general_health',
  RISK_ASSESSMENT = 'risk_assessment',
  TREND_ANALYSIS = 'trend_analysis',
  RECOMMENDATION = 'recommendation',
}

export enum InsightPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum InsightStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  IMPLEMENTED = 'implemented',
  DISMISSED = 'dismissed',
}

export class CreateAIInsightDto {
  @IsUUID()
  user_id: string;

  @IsEnum(InsightType)
  insight_type: InsightType;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  recommendation: string;

  @IsEnum(InsightPriority)
  priority: InsightPriority;

  @IsOptional()
  @IsString()
  reasoning?: string;

  @IsOptional()
  @IsString()
  supporting_data?: string; // JSON string for data points

  @IsOptional()
  @IsString()
  action_items?: string; // JSON string for actionable steps

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence_score?: number;

  @IsOptional()
  @IsString()
  source_context?: string; // What triggered this insight

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class UpdateAIInsightDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  recommendation?: string;

  @IsOptional()
  @IsEnum(InsightPriority)
  priority?: InsightPriority;

  @IsOptional()
  @IsString()
  reasoning?: string;

  @IsOptional()
  @IsString()
  supporting_data?: string;

  @IsOptional()
  @IsString()
  action_items?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence_score?: number;

  @IsOptional()
  @IsString()
  source_context?: string;

  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @IsOptional()
  @IsEnum(InsightStatus)
  status?: InsightStatus;
}

export class AIInsightResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  user_id: string;

  @IsEnum(InsightType)
  insight_type: InsightType;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  recommendation: string;

  @IsEnum(InsightPriority)
  priority: InsightPriority;

  @IsEnum(InsightStatus)
  status: InsightStatus;

  @IsOptional()
  @IsString()
  reasoning?: string;

  @IsOptional()
  @IsString()
  supporting_data?: string;

  @IsOptional()
  @IsString()
  action_items?: string;

  @IsOptional()
  @IsNumber()
  confidence_score?: number;

  @IsOptional()
  @IsString()
  source_context?: string;

  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @IsBoolean()
  is_read: boolean;

  @IsDateString()
  created_at: string;

  @IsDateString()
  updated_at: string;
}

export class AIInsightQueryDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsEnum(InsightType)
  insight_type?: InsightType;

  @IsOptional()
  @IsEnum(InsightPriority)
  priority?: InsightPriority;

  @IsOptional()
  @IsEnum(InsightStatus)
  status?: InsightStatus;

  @IsOptional()
  @IsBoolean()
  is_read?: boolean;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

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

export class MarkInsightReadDto {
  @IsUUID()
  insight_id: string;

  @IsOptional()
  @IsBoolean()
  mark_all?: boolean;
}

export class InsightFeedbackDto {
  @IsUUID()
  insight_id: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  helpful_rating: number;

  @IsOptional()
  @IsString()
  feedback_text?: string;

  @IsOptional()
  @IsBoolean()
  was_implemented?: boolean;
}
