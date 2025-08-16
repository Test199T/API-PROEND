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
  CreateExerciseLogDto,
  UpdateExerciseLogDto,
  ExerciseLogResponseDto,
  ExerciseLogQueryDto,
} from '../dto/exercise-log.dto';

@Controller('exercise-log')
@UseGuards(AuthGuard)
export class ExerciseLogController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly aiService: AIService,
  ) {}

  @Post()
  async createExerciseLog(
    @Body() createExerciseLogDto: CreateExerciseLogDto,
    @Request() req: any,
  ): Promise<ResponseDto<ExerciseLogResponseDto>> {
    try {
      const userId = req.user.id;
      const exerciseLog = await this.supabaseService.createExerciseLog({
        ...createExerciseLogDto,
        user_id: userId,
      });

      return {
        success: true,
        message: 'Exercise log created successfully',
        data: exerciseLog,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create exercise log',
        error: error.message,
      };
    }
  }

  @Get()
  async getExerciseLogs(
    @Query() query: ExerciseLogQueryDto,
    @Request() req: any,
  ): Promise<ResponseDto<ExerciseLogResponseDto[]>> {
    try {
      const userId = req.user.id;
      const exerciseLogs = await this.supabaseService.getExerciseLogs(
        userId,
        query,
      );

      return {
        success: true,
        message: 'Exercise logs retrieved successfully',
        data: exerciseLogs,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve exercise logs',
        error: error.message,
      };
    }
  }

  @Get('stats')
  async getExerciseLogStats(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const stats = await this.supabaseService.getExerciseLogStats(
        userId,
        date,
      );

      return {
        success: true,
        message: 'Exercise log stats retrieved successfully',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve exercise log stats',
        error: error.message,
      };
    }
  }

  @Get('trends')
  async getExerciseLogTrends(
    @Request() req: any,
    @Query('days') days: number = 7,
  ): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const trends = await this.supabaseService.getExerciseLogTrends(
        userId,
        days,
      );

      return {
        success: true,
        message: 'Exercise log trends retrieved successfully',
        data: trends,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve exercise log trends',
        error: error.message,
      };
    }
  }

  @Get('workout-analysis')
  async getWorkoutAnalysis(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const analysis = await this.aiService.analyzeExercise(userId, date);

      return {
        success: true,
        message: 'Workout analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to analyze workout',
        error: error.message,
      };
    }
  }

  @Get('recommendations')
  async getExerciseRecommendations(
    @Request() req: any,
  ): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const recommendations =
        await this.aiService.getExerciseRecommendations(userId);

      return {
        success: true,
        message: 'Exercise recommendations retrieved successfully',
        data: recommendations,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get exercise recommendations',
        error: error.message,
      };
    }
  }

  @Get(':id')
  async getExerciseLog(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ResponseDto<ExerciseLogResponseDto>> {
    try {
      const userId = req.user.id;
      const exerciseLog = await this.supabaseService.getExerciseLog(id, userId);

      if (!exerciseLog) {
        return {
          success: false,
          message: 'Exercise log not found',
        };
      }

      return {
        success: true,
        message: 'Exercise log retrieved successfully',
        data: exerciseLog,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve exercise log',
        error: error.message,
      };
    }
  }

  @Put(':id')
  async updateExerciseLog(
    @Param('id') id: string,
    @Body() updateExerciseLogDto: UpdateExerciseLogDto,
    @Request() req: any,
  ): Promise<ResponseDto<ExerciseLogResponseDto>> {
    try {
      const userId = req.user.id;
      const exerciseLog = await this.supabaseService.updateExerciseLog(
        id,
        userId,
        updateExerciseLogDto,
      );

      return {
        success: true,
        message: 'Exercise log updated successfully',
        data: exerciseLog,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update exercise log',
        error: error.message,
      };
    }
  }

  @Delete(':id')
  async deleteExerciseLog(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ResponseDto<void>> {
    try {
      const userId = req.user.id;
      await this.supabaseService.deleteExerciseLog(id, userId);

      return {
        success: true,
        message: 'Exercise log deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete exercise log',
        error: error.message,
      };
    }
  }

  @Get('types/:exerciseType')
  async getExerciseLogsByType(
    @Param('exerciseType') exerciseType: string,
    @Query() query: ExerciseLogQueryDto,
    @Request() req: any,
  ): Promise<ResponseDto<ExerciseLogResponseDto[]>> {
    try {
      const userId = req.user.id;
      const exerciseLogs = await this.supabaseService.getExerciseLogsByType(
        userId,
        exerciseType,
        query,
      );

      return {
        success: true,
        message: `Exercise logs for ${exerciseType} retrieved successfully`,
        data: exerciseLogs,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve exercise logs for ${exerciseType}`,
        error: error.message,
      };
    }
  }

  @Get('calories/summary')
  async getCaloriesBurnedSummary(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const summary = await this.supabaseService.getCaloriesBurnedSummary(
        userId,
        startDate,
        endDate,
      );

      return {
        success: true,
        message: 'Calories burned summary retrieved successfully',
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve calories burned summary',
        error: error.message,
      };
    }
  }

  @Get('streak/current')
  async getCurrentExerciseStreak(
    @Request() req: any,
  ): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const streak =
        await this.supabaseService.getCurrentExerciseStreak(userId);

      return {
        success: true,
        message: 'Current exercise streak retrieved successfully',
        data: streak,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve current exercise streak',
        error: error.message,
      };
    }
  }
}
