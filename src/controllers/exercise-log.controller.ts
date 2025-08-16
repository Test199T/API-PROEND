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
  HttpCode,
  HttpStatus,
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
  @HttpCode(HttpStatus.CREATED)
  async createExerciseLog(
    @Body() createExerciseLogDto: CreateExerciseLogDto,
    @Request() req: any,
  ): Promise<ResponseDto<ExerciseLogResponseDto>> {
    try {
      const exerciseLog = await this.supabaseService.createExerciseLog({
        ...createExerciseLogDto,
        user_id: req.user.id,
      });

      return ResponseDto.success(
        exerciseLog,
        'Exercise log created successfully',
      );
    } catch (error) {
      return ResponseDto.success(
        {} as ExerciseLogResponseDto,
        'Failed to create exercise log',
      );
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

      return ResponseDto.success(
        exerciseLogs,
        'Exercise logs retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success([], 'Failed to retrieve exercise logs');
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

      return ResponseDto.success(
        stats,
        'Exercise log stats retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success({}, 'Failed to retrieve exercise log stats');
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

      return ResponseDto.success(
        trends,
        'Exercise log trends retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success({}, 'Failed to retrieve exercise log trends');
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

      return ResponseDto.success(
        analysis,
        'Workout analysis retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success({}, 'Failed to retrieve workout analysis');
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

      return ResponseDto.success(
        recommendations,
        'Exercise recommendations retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success(
        {},
        'Failed to retrieve exercise recommendations',
      );
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
        return ResponseDto.success(
          {} as ExerciseLogResponseDto,
          'Exercise log not found',
        );
      }

      return ResponseDto.success(
        exerciseLog,
        'Exercise log retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success(
        {} as ExerciseLogResponseDto,
        'Failed to retrieve exercise log',
      );
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

      if (!exerciseLog) {
        return ResponseDto.success(
          {} as ExerciseLogResponseDto,
          'Exercise log not found',
        );
      }

      return ResponseDto.success(
        exerciseLog,
        'Exercise log updated successfully',
      );
    } catch (error) {
      return ResponseDto.success(
        {} as ExerciseLogResponseDto,
        'Failed to update exercise log',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExerciseLog(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ResponseDto<void>> {
    try {
      const userId = req.user.id;
      const deleted = await this.supabaseService.deleteExerciseLog(id, userId);

      if (!deleted) {
        return ResponseDto.success(undefined, 'Exercise log not found');
      }

      return ResponseDto.success(
        undefined,
        'Exercise log deleted successfully',
      );
    } catch (error) {
      return ResponseDto.success(undefined, 'Failed to delete exercise log');
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

      return ResponseDto.success(
        exerciseLogs,
        'Exercise logs by type retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success(
        [],
        'Failed to retrieve exercise logs by type',
      );
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

      return ResponseDto.success(
        summary,
        'Calories burned summary retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success(
        {},
        'Failed to retrieve calories burned summary',
      );
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

      return ResponseDto.success(
        streak,
        'Current exercise streak retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success(
        {},
        'Failed to retrieve current exercise streak',
      );
    }
  }
}
