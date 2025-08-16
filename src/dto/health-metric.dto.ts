import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

export enum MetricType {
  BLOOD_PRESSURE = 'blood_pressure',
  HEART_RATE = 'heart_rate',
  BLOOD_SUGAR = 'blood_sugar',
  CHOLESTEROL = 'cholesterol',
  TEMPERATURE = 'temperature',
  WEIGHT = 'weight',
  HEIGHT = 'height',
  BMI = 'bmi',
  BODY_FAT = 'body_fat',
  MUSCLE_MASS = 'muscle_mass',
  BONE_DENSITY = 'bone_density',
  VITAMIN_D = 'vitamin_d',
  IRON = 'iron',
  CALCIUM = 'calcium',
  OTHER = 'other',
}

export enum MetricUnit {
  MMHG = 'mmHg',
  BPM = 'bpm',
  MG_DL = 'mg/dL',
  CELSIUS = '°C',
  KG = 'kg',
  CM = 'cm',
  PERCENT = '%',
  MG_L = 'mg/L',
  OTHER = 'other',
}

export class CreateHealthMetricDto {
  @IsEnum(MetricType)
  metric_type: MetricType;

  @IsNumber()
  @Min(-1000)
  @Max(10000)
  value: number;

  @IsEnum(MetricUnit)
  unit: MetricUnit;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  measured_at?: string;

  @IsOptional()
  @IsString()
  source?: string; // manual, device, lab, etc.

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  confidence_level?: number; // 0-10 scale
}

export class UpdateHealthMetricDto {
  @IsOptional()
  @IsEnum(MetricType)
  metric_type?: MetricType;

  @IsOptional()
  @IsNumber()
  @Min(-1000)
  @Max(10000)
  value?: number;

  @IsOptional()
  @IsEnum(MetricUnit)
  unit?: MetricUnit;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  measured_at?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  confidence_level?: number;
}

export class HealthMetricResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  user_id: string;

  @IsEnum(MetricType)
  metric_type: MetricType;

  @IsNumber()
  value: number;

  @IsEnum(MetricUnit)
  unit: MetricUnit;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  measured_at: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsNumber()
  confidence_level?: number;

  @IsDateString()
  created_at: string;

  @IsDateString()
  updated_at: string;
}

export class HealthMetricQueryDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsEnum(MetricType)
  metric_type?: MetricType;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  source?: string;

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

export class HealthMetricTrendDto {
  @IsEnum(MetricType)
  metric_type: MetricType;

  @IsNumber()
  current_value: number;

  @IsNumber()
  previous_value: number;

  @IsNumber()
  change_percentage: number;

  @IsString()
  trend_direction: 'increasing' | 'decreasing' | 'stable';

  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;
}
