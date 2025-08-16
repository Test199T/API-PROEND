import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { MealType } from '../entities/food-log.entity';

// =====================================================
// FOOD LOG DTOs - สำหรับจัดการบันทึกอาหาร
// =====================================================

export class CreateFoodLogDto {
  @IsEnum(MealType)
  meal_type: MealType;

  @IsString()
  food_name: string;

  @IsNumber()
  @Min(0.01)
  @Max(1000)
  quantity: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  calories?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  protein_g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  carbs_g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  fat_g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  fiber_g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  sugar_g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  sodium_mg?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  consumed_at: string;
}

export class UpdateFoodLogDto {
  @IsOptional()
  @IsEnum(MealType)
  meal_type?: MealType;

  @IsOptional()
  @IsString()
  food_name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1000)
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  calories?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  protein_g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  carbs_g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  fat_g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  fiber_g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  sugar_g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  sodium_mg?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  consumed_at?: string;
}

export class FoodLogResponseDto {
  id: number;
  userId: number;
  meal_type: MealType;
  food_name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  notes?: string;
  consumed_at: Date;
  created_at: Date;
  total_nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  is_complete_nutrition: boolean;
  meal_time: string;
  meal_date: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    fullName: string;
  };
}

export class FoodLogListDto {
  food_logs: FoodLogResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  nutrition_summary: {
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    total_fiber: number;
    total_sugar: number;
    total_sodium: number;
  };
}

export class FoodLogSearchDto {
  @IsOptional()
  @IsEnum(MealType)
  meal_type?: MealType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  consumed_at_from?: string;

  @IsOptional()
  @IsDateString()
  consumed_at_to?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories_max?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  protein_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  protein_max?: number;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class FoodLogStatsDto {
  total_entries: number;
  total_calories: number;
  average_calories_per_day: number;
  average_calories_per_meal: number;
  meals_by_type: Record<MealType, number>;
  nutrition_averages: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g: number;
    sodium_mg: number;
  };
  daily_calories: {
    date: string;
    calories: number;
    meals: number;
  }[];
  weekly_summary: {
    week: string;
    total_calories: number;
    average_daily_calories: number;
    total_meals: number;
  }[];
  monthly_summary: {
    month: string;
    total_calories: number;
    average_daily_calories: number;
    total_meals: number;
    weight_change?: number;
  }[];
}

export class FoodLogBulkCreateDto {
  @IsString()
  date: string;

  @IsString()
  meal_type: MealType;

  foods: {
    food_name: string;
    quantity: number;
    unit: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    fiber_g?: number;
    sugar_g?: number;
    sodium_mg?: number;
    notes?: string;
  }[];
}

export class FoodLogTemplateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(MealType)
  meal_type: MealType;

  @IsString()
  category: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  foods: {
    food_name: string;
    quantity: number;
    unit: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    fiber_g?: number;
    sugar_g?: number;
    sodium_mg?: number;
    notes?: string;
  }[];

  @IsNumber()
  @Min(0)
  total_calories: number;

  @IsNumber()
  @Min(0)
  total_protein: number;

  @IsNumber()
  @Min(0)
  total_carbs: number;

  @IsNumber()
  @Min(0)
  total_fat: number;
}

export class FoodLogRecommendationDto {
  @IsString()
  food_name: string;

  @IsString()
  reason: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence_score: number;

  @IsString()
  meal_type: MealType;

  @IsNumber()
  @Min(0)
  suggested_quantity: number;

  @IsString()
  suggested_unit: string;

  @IsString()
  nutritional_benefits: string;

  @IsArray()
  @IsString({ each: true })
  alternatives: string[];

  @IsString()
  dietary_restrictions: string;
}

export class FoodLogNutritionAnalysisDto {
  daily_nutrition: {
    date: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g: number;
    sodium_mg: number;
  }[];
  nutrition_gaps: {
    nutrient: string;
    current: number;
    recommended: number;
    gap: number;
    unit: string;
    status: 'low' | 'adequate' | 'high';
  }[];
  meal_distribution: {
    meal_type: MealType;
    calories: number;
    percentage: number;
    meal_count: number;
  }[];
  trends: {
    period: string;
    average_calories: number;
    average_protein: number;
    average_carbs: number;
    average_fat: number;
    weight_change?: number;
  }[];
}
