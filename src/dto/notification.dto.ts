import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export enum NotificationType {
  REMINDER = 'reminder',
  ALERT = 'alert',
  ACHIEVEMENT = 'achievement',
  RECOMMENDATION = 'recommendation',
  SYSTEM = 'system',
  HEALTH_GOAL = 'health_goal',
  AI_INSIGHT = 'ai_insight',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

export class CreateNotificationDto {
  @IsUUID()
  user_id: string;

  @IsEnum(NotificationType)
  notification_type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @IsOptional()
  @IsString()
  action_url?: string;

  @IsOptional()
  @IsString()
  metadata?: string; // JSON string for additional data

  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  expires_in_days?: number;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsString()
  action_url?: string;

  @IsOptional()
  @IsString()
  metadata?: string;

  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  expires_in_days?: number;
}

export class NotificationResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  user_id: string;

  @IsEnum(NotificationType)
  notification_type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @IsEnum(NotificationStatus)
  status: NotificationStatus;

  @IsOptional()
  @IsString()
  action_url?: string;

  @IsOptional()
  @IsString()
  metadata?: string;

  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @IsDateString()
  created_at: string;

  @IsDateString()
  updated_at: string;
}

export class NotificationQueryDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  notification_type?: NotificationType;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

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

export class MarkNotificationReadDto {
  @IsUUID()
  notification_id: string;

  @IsOptional()
  @IsBoolean()
  mark_all?: boolean;
}

export class NotificationPreferencesDto {
  @IsBoolean()
  email_notifications: boolean;

  @IsBoolean()
  push_notifications: boolean;

  @IsBoolean()
  sms_notifications: boolean;

  @IsBoolean()
  reminder_notifications: boolean;

  @IsBoolean()
  achievement_notifications: boolean;

  @IsBoolean()
  recommendation_notifications: boolean;

  @IsBoolean()
  system_notifications: boolean;

  @IsOptional()
  @IsString()
  quiet_hours_start?: string; // HH:MM format

  @IsOptional()
  @IsString()
  quiet_hours_end?: string; // HH:MM format
}
