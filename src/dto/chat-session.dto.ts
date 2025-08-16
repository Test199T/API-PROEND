import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export enum ChatSessionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export enum ChatSessionType {
  GENERAL_HEALTH = 'general_health',
  NUTRITION = 'nutrition',
  EXERCISE = 'exercise',
  SLEEP = 'sleep',
  MENTAL_HEALTH = 'mental_health',
  CHRONIC_CONDITION = 'chronic_condition',
  MEDICATION = 'medication',
  OTHER = 'other',
}

export class CreateChatSessionDto {
  @IsEnum(ChatSessionType)
  session_type: ChatSessionType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  initial_context?: string;
}

export class UpdateChatSessionDto {
  @IsOptional()
  @IsEnum(ChatSessionType)
  session_type?: ChatSessionType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  initial_context?: string;

  @IsOptional()
  @IsEnum(ChatSessionStatus)
  status?: ChatSessionStatus;
}

export class ChatSessionResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  user_id: string;

  @IsEnum(ChatSessionType)
  session_type: ChatSessionType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  initial_context?: string;

  @IsEnum(ChatSessionStatus)
  status: ChatSessionStatus;

  @IsNumber()
  message_count: number;

  @IsDateString()
  last_message_at: string;

  @IsDateString()
  created_at: string;

  @IsDateString()
  updated_at: string;
}

export class ChatSessionQueryDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsEnum(ChatSessionType)
  session_type?: ChatSessionType;

  @IsOptional()
  @IsEnum(ChatSessionStatus)
  status?: ChatSessionStatus;

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

export class ChatSessionSummaryDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsEnum(ChatSessionType)
  session_type: ChatSessionType;

  @IsNumber()
  message_count: number;

  @IsDateString()
  last_message_at: string;

  @IsEnum(ChatSessionStatus)
  status: ChatSessionStatus;
}
