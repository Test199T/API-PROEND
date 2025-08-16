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

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  QUICK_RESPONSE = 'quick_response',
}

export class CreateChatMessageDto {
  @IsUUID()
  chat_session_id: string;

  @IsEnum(MessageRole)
  role: MessageRole;

  @IsEnum(MessageType)
  message_type: MessageType;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  metadata?: string; // JSON string for additional data

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number; // 1-5 rating for AI responses

  @IsOptional()
  @IsString()
  feedback?: string; // User feedback on AI response
}

export class UpdateChatMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  metadata?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class ChatMessageResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  chat_session_id: string;

  @IsUUID()
  user_id: string;

  @IsEnum(MessageRole)
  role: MessageRole;

  @IsEnum(MessageType)
  message_type: MessageType;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  metadata?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsBoolean()
  is_read: boolean;

  @IsDateString()
  created_at: string;

  @IsDateString()
  updated_at: string;
}

export class ChatMessageQueryDto {
  @IsOptional()
  @IsUUID()
  chat_session_id?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsEnum(MessageRole)
  role?: MessageRole;

  @IsOptional()
  @IsEnum(MessageType)
  message_type?: MessageType;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsBoolean()
  is_read?: boolean;

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

export class SendMessageDto {
  @IsUUID()
  chat_session_id: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  message_type?: MessageType = MessageType.TEXT;

  @IsOptional()
  @IsString()
  metadata?: string;
}

export class AIAnalysisRequestDto {
  @IsString()
  user_message: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  health_focus?: string; // nutrition, exercise, sleep, etc.
}
