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
  IsArray,
} from 'class-validator';

export enum ThemePreference {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export enum LanguagePreference {
  THAI = 'th',
  ENGLISH = 'en',
}

export enum MeasurementUnit {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

export enum PrivacyLevel {
  PRIVATE = 'private',
  FRIENDS_ONLY = 'friends_only',
  PUBLIC = 'public',
}

export class CreateUserPreferenceDto {
  @IsUUID()
  user_id: string;

  @IsEnum(ThemePreference)
  theme: ThemePreference;

  @IsEnum(LanguagePreference)
  language: LanguagePreference;

  @IsEnum(MeasurementUnit)
  measurement_unit: MeasurementUnit;

  @IsEnum(PrivacyLevel)
  privacy_level: PrivacyLevel;

  @IsBoolean()
  email_notifications: boolean;

  @IsBoolean()
  push_notifications: boolean;

  @IsBoolean()
  sms_notifications: boolean;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  date_format?: string;

  @IsOptional()
  @IsString()
  time_format?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  health_focus_areas?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reminder_frequency?: number;

  @IsOptional()
  @IsString()
  quiet_hours_start?: string; // HH:MM format

  @IsOptional()
  @IsString()
  quiet_hours_end?: string; // HH:MM format

  @IsOptional()
  @IsBoolean()
  ai_insights_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  data_sharing_enabled?: boolean;

  @IsOptional()
  @IsString()
  custom_goals?: string; // JSON string for custom health goals
}

export class UpdateUserPreferenceDto {
  @IsOptional()
  @IsEnum(ThemePreference)
  theme?: ThemePreference;

  @IsOptional()
  @IsEnum(LanguagePreference)
  language?: LanguagePreference;

  @IsOptional()
  @IsEnum(MeasurementUnit)
  measurement_unit?: MeasurementUnit;

  @IsOptional()
  @IsEnum(PrivacyLevel)
  privacy_level?: PrivacyLevel;

  @IsOptional()
  @IsBoolean()
  email_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  push_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  sms_notifications?: boolean;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  date_format?: string;

  @IsOptional()
  @IsString()
  time_format?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  health_focus_areas?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reminder_frequency?: number;

  @IsOptional()
  @IsString()
  quiet_hours_start?: string;

  @IsOptional()
  @IsString()
  quiet_hours_end?: string;

  @IsOptional()
  @IsBoolean()
  ai_insights_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  data_sharing_enabled?: boolean;

  @IsOptional()
  @IsString()
  custom_goals?: string;
}

export class UserPreferenceResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  user_id: string;

  @IsEnum(ThemePreference)
  theme: ThemePreference;

  @IsEnum(LanguagePreference)
  language: LanguagePreference;

  @IsEnum(MeasurementUnit)
  measurement_unit: MeasurementUnit;

  @IsEnum(PrivacyLevel)
  privacy_level: PrivacyLevel;

  @IsBoolean()
  email_notifications: boolean;

  @IsBoolean()
  push_notifications: boolean;

  @IsBoolean()
  sms_notifications: boolean;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  date_format?: string;

  @IsOptional()
  @IsString()
  time_format?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  health_focus_areas?: string[];

  @IsOptional()
  @IsNumber()
  reminder_frequency?: number;

  @IsOptional()
  @IsString()
  quiet_hours_start?: string;

  @IsOptional()
  @IsString()
  quiet_hours_end?: string;

  @IsOptional()
  @IsBoolean()
  ai_insights_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  data_sharing_enabled?: boolean;

  @IsOptional()
  @IsString()
  custom_goals?: string;

  @IsDateString()
  created_at: string;

  @IsDateString()
  updated_at: string;
}

export class NotificationPreferenceDto {
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
  quiet_hours_start?: string;

  @IsOptional()
  @IsString()
  quiet_hours_end?: string;
}

export class PrivacyPreferenceDto {
  @IsEnum(PrivacyLevel)
  profile_visibility: PrivacyLevel;

  @IsEnum(PrivacyLevel)
  health_data_visibility: PrivacyLevel;

  @IsEnum(PrivacyLevel)
  goal_visibility: PrivacyLevel;

  @IsBoolean()
  allow_friend_requests: boolean;

  @IsBoolean()
  show_online_status: boolean;

  @IsBoolean()
  data_sharing_enabled: boolean;
}
