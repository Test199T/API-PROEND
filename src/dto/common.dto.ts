import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsArray,
  Min,
  Max,
  IsDateString,
  IsBoolean,
} from 'class-validator';

// Pagination DTOs
export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort_by?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}

export class SearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  filters?: Record<string, any>;

  @IsOptional()
  pagination?: PaginationDto;
}

// Response DTOs
export class ResponseDto<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };

  constructor(success: boolean, message: string, data?: T, error?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date();
  }

  static success<T>(data: T, message: string = 'Success'): ResponseDto<T> {
    return new ResponseDto<T>(true, message, data);
  }

  static error(message: string, error?: string): ResponseDto<null> {
    return new ResponseDto<null>(false, message, null, error);
  }

  static withPagination<T>(
    data: T,
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    },
    message: string = 'Success',
  ): ResponseDto<T> {
    const response = new ResponseDto<T>(true, message, data);
    response.pagination = pagination;
    return response;
  }
}

// Bulk Operation DTOs
export class BulkOperationDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @IsEnum(['update', 'delete', 'activate', 'deactivate'])
  operation: 'update' | 'delete' | 'activate' | 'deactivate';

  @IsOptional()
  data?: Record<string, any>;
}

export class BulkOperationResultDto {
  success: boolean;
  message: string;
  total_processed: number;
  successful_operations: number;
  failed_operations: number;
  errors: Array<{
    id: number;
    error: string;
  }>;
  timestamp: Date;
}

// File Upload DTOs
export class FileUploadDto {
  @IsString()
  filename: string;

  @IsString()
  originalname: string;

  @IsString()
  mimetype: string;

  @IsNumber()
  size: number;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  url?: string;
}

// Notification DTOs
export class NotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(['info', 'success', 'warning', 'error'])
  type: 'info' | 'success' | 'warning' | 'error';

  @IsOptional()
  data?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  recipients?: number[];

  @IsOptional()
  @IsDateString()
  scheduled_at?: string;
}

// Health Metrics DTOs
export class HealthMetricsDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumber()
  weight_kg?: number;

  @IsOptional()
  @IsNumber()
  height_cm?: number;

  @IsOptional()
  @IsNumber()
  bmi?: number;

  @IsOptional()
  @IsNumber()
  body_fat_percentage?: number;

  @IsOptional()
  @IsNumber()
  muscle_mass_kg?: number;

  @IsOptional()
  @IsNumber()
  blood_pressure_systolic?: number;

  @IsOptional()
  @IsNumber()
  blood_pressure_diastolic?: number;

  @IsOptional()
  @IsNumber()
  heart_rate?: number;

  @IsOptional()
  @IsNumber()
  body_temperature?: number;

  @IsOptional()
  @IsNumber()
  blood_sugar_mg_dl?: number;

  @IsOptional()
  @IsNumber()
  cholesterol_total?: number;

  @IsOptional()
  @IsNumber()
  cholesterol_hdl?: number;

  @IsOptional()
  @IsNumber()
  cholesterol_ldl?: number;

  @IsOptional()
  @IsNumber()
  triglycerides?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Dashboard Stats DTOs
export class DashboardStatsDto {
  today: {
    calories_consumed: number;
    calories_burned: number;
    water_consumed_ml: number;
    sleep_hours: number;
    sleep_quality: number;
    exercises: number;
    meals: number;
  };
  this_week: {
    total_calories: number;
    total_exercise_minutes: number;
    average_sleep_hours: number;
    average_water_ml: number;
    total_exercises: number;
    total_meals: number;
  };
  this_month: {
    weight_change: number;
    bmi_change: number;
    goals_completed: number;
    goals_in_progress: number;
    average_daily_calories: number;
    average_daily_exercise: number;
  };
  trends: {
    weight_trend: Array<{ date: string; weight: number }>;
    calories_trend: Array<{ date: string; calories: number }>;
    exercise_trend: Array<{ date: string; minutes: number }>;
    sleep_trend: Array<{ date: string; hours: number }>;
  };
  recommendations: string[];
  upcoming_goals: Array<{
    id: number;
    title: string;
    target_date: string;
    days_remaining: number;
    progress_percentage: number;
  }>;
}

// Date Range DTOs
export class DateRangeDto {
  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;
}

// Filter DTOs
export class HealthDataFilterDto {
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  min_rating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  max_rating?: number;
}

// Export DTOs
export class ExportDataDto {
  @IsEnum(['csv', 'json', 'pdf'])
  format: 'csv' | 'json' | 'pdf';

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  data_types?: string[];

  @IsOptional()
  @IsBoolean()
  include_metadata?: boolean = true;
}

// Import DTOs
export class ImportDataDto {
  @IsString()
  filename: string;

  @IsEnum(['csv', 'json'])
  format: 'csv' | 'json';

  @IsOptional()
  @IsString()
  mapping_config?: string; // JSON string for field mapping

  @IsOptional()
  @IsBoolean()
  validate_only?: boolean = false;

  @IsOptional()
  @IsBoolean()
  overwrite_existing?: boolean = false;
}
