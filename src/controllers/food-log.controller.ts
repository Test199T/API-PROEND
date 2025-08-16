import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SupabaseService } from '../services/supabase.service';
import { AIService } from '../services/ai.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ResponseDto } from '../dto/common.dto';
import {
  CreateFoodLogDto,
  UpdateFoodLogDto,
  FoodLogResponseDto,
  FoodLogQueryDto,
} from '../dto/food-log.dto';

@Controller('food-log')
@UseGuards(AuthGuard)
export class FoodLogController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly aiService: AIService,
  ) {}

  @Post()
  async createFoodLog(
    @Body() createFoodLogDto: CreateFoodLogDto,
    @Request() req: any,
  ): Promise<ResponseDto<FoodLogResponseDto>> {
    try {
      const userId = req.user.id;
      const foodLog = await this.supabaseService.createFoodLog({
        ...createFoodLogDto,
        user_id: userId,
      });

      return ResponseDto.success(foodLog, 'Food log created successfully');
    } catch (error) {
      return ResponseDto.error('Failed to create food log', error.message);
    }
  }

  @Get()
  async getFoodLogs(
    @Query() query: FoodLogQueryDto,
    @Request() req: any,
  ): Promise<ResponseDto<FoodLogResponseDto[]>> {
    try {
      const userId = req.user.id;
      const foodLogs = await this.supabaseService.getFoodLogs(userId, query);

      return ResponseDto.success(foodLogs, 'Food logs retrieved successfully');
    } catch (error) {
      return ResponseDto.error('Failed to retrieve food logs', error.message);
    }
  }

  @Get('stats')
  async getFoodLogStats(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const stats = await this.supabaseService.getFoodLogStats(userId, date);

      return ResponseDto.success(stats, 'Food log stats retrieved successfully');
    } catch (error) {
      return ResponseDto.error('Failed to retrieve food log stats', error.message);
    }
  }

  @Get('trends')
  async getFoodLogTrends(
    @Request() req: any,
    @Query('days') days: number = 7,
  ): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const trends = await this.supabaseService.getFoodLogTrends(userId, days);

      return ResponseDto.success(trends, 'Food log trends retrieved successfully');
    } catch (error) {
      return ResponseDto.error('Failed to retrieve food log trends', error.message);
    }
  }

  @Get('nutrition-analysis')
  async getNutritionAnalysis(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const analysis = await this.aiService.analyzeNutrition(userId, date);

      return ResponseDto.success(analysis, 'Nutrition analysis completed successfully');
    } catch (error) {
      return ResponseDto.error('Failed to analyze nutrition', error.message);
    }
  }

  @Get('recommendations')
  async getFoodRecommendations(@Request() req: any): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const recommendations =
        await this.aiService.getFoodRecommendations(userId);

      return ResponseDto.success(recommendations, 'Food recommendations retrieved successfully');
    } catch (error) {
      return ResponseDto.error('Failed to get food recommendations', error.message);
    }
  }

  @Get(':id')
  async getFoodLog(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ResponseDto<FoodLogResponseDto>> {
    try {
      const userId = req.user.id;
      const foodLog = await this.supabaseService.getFoodLog(id, userId);

      if (!foodLog) {
        return ResponseDto.error('Food log not found');
      }

      return ResponseDto.success(foodLog, 'Food log retrieved successfully');
    } catch (error) {
      return ResponseDto.error('Failed to retrieve food log', error.message);
    }
  }

  @Put(':id')
  async updateFoodLog(
    @Param('id') id: string,
    @Body() updateFoodLogDto: UpdateFoodLogDto,
    @Request() req: any,
  ): Promise<ResponseDto<FoodLogResponseDto>> {
    try {
      const userId = req.user.id;
      const foodLog = await this.supabaseService.updateFoodLog(
        id,
        userId,
        updateFoodLogDto,
      );

      return ResponseDto.success(foodLog, 'Food log updated successfully');
    } catch (error) {
      return ResponseDto.error('Failed to update food log', error.message);
    }
  }

  @Delete(':id')
  async deleteFoodLog(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ResponseDto<void>> {
    try {
      const userId = req.user.id;
      await this.supabaseService.deleteFoodLog(id, userId);

      return ResponseDto.success(undefined, 'Food log deleted successfully');
    } catch (error) {
      return ResponseDto.error('Failed to delete food log', error.message);
    }
  }

  @Get('meal-types/:mealType')
  async getFoodLogsByMealType(
    @Param('mealType') mealType: string,
    @Query() query: FoodLogQueryDto,
    @Request() req: any,
  ): Promise<ResponseDto<FoodLogResponseDto[]>> {
    try {
      const userId = req.user.id;
      const foodLogs = await this.supabaseService.getFoodLogsByMealType(
        userId,
        mealType,
        query,
      );

      return ResponseDto.success(foodLogs, `Food logs for ${mealType} retrieved successfully`);
    } catch (error) {
      return ResponseDto.error(`Failed to retrieve food logs for ${mealType}`, error.message);
    }
  }

  @Get('calories/summary')
  async getCaloriesSummary(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const summary = await this.supabaseService.getCaloriesSummary(
        userId,
        startDate,
        endDate,
      );

      return ResponseDto.success(summary, 'Calories summary retrieved successfully');
    } catch (error) {
      return ResponseDto.error('Failed to retrieve calories summary', error.message);
    }
  }
}
