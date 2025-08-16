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

      return {
        success: true,
        message: 'Food log created successfully',
        data: foodLog,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create food log',
        error: error.message,
      };
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

      return {
        success: true,
        message: 'Food logs retrieved successfully',
        data: foodLogs,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve food logs',
        error: error.message,
      };
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

      return {
        success: true,
        message: 'Food log stats retrieved successfully',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve food log stats',
        error: error.message,
      };
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

      return {
        success: true,
        message: 'Food log trends retrieved successfully',
        data: trends,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve food log trends',
        error: error.message,
      };
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

      return {
        success: true,
        message: 'Nutrition analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to analyze nutrition',
        error: error.message,
      };
    }
  }

  @Get('recommendations')
  async getFoodRecommendations(@Request() req: any): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const recommendations =
        await this.aiService.getFoodRecommendations(userId);

      return {
        success: true,
        message: 'Food recommendations retrieved successfully',
        data: recommendations,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get food recommendations',
        error: error.message,
      };
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
        return {
          success: false,
          message: 'Food log not found',
        };
      }

      return {
        success: true,
        message: 'Food log retrieved successfully',
        data: foodLog,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve food log',
        error: error.message,
      };
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

      return {
        success: true,
        message: 'Food log updated successfully',
        data: foodLog,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update food log',
        error: error.message,
      };
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

      return {
        success: true,
        message: 'Food log deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete food log',
        error: error.message,
      };
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

      return {
        success: true,
        message: `Food logs for ${mealType} retrieved successfully`,
        data: foodLogs,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve food logs for ${mealType}`,
        error: error.message,
      };
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

      return {
        success: true,
        message: 'Calories summary retrieved successfully',
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve calories summary',
        error: error.message,
      };
    }
  }
}
