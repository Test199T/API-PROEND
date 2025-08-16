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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { SupabaseService } from '../services/supabase.service';
import {
  CreateWaterLogDto,
  UpdateWaterLogDto,
  WaterLogQueryDto,
  WaterLogResponseDto,
  DailyWaterGoalDto,
} from '../dto/water-log.dto';
import { ResponseDto } from '../dto/common.dto';

@Controller('water-logs')
@UseGuards(AuthGuard)
export class WaterLogController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWaterLog(
    @Body() createWaterLogDto: CreateWaterLogDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<WaterLogResponseDto>> {
    try {
      const waterLog = await this.supabaseService.createWaterLog({
        ...createWaterLogDto,
        user_id: userId,
      });

      return ResponseDto.success(waterLog, 'Water log created successfully');
    } catch (error) {
      return ResponseDto.error('Failed to create water log', error.message);
    }
  }

  @Get()
  async getWaterLogs(
    @Query() query: WaterLogQueryDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<WaterLogResponseDto[]>> {
    try {
      const waterLogs = await this.supabaseService.getWaterLogs({
        ...query,
        user_id: userId,
      });

      return ResponseDto.success(
        waterLogs,
        'Water logs retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error('Failed to retrieve water logs', error.message);
    }
  }

  @Get(':id')
  async getWaterLog(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<WaterLogResponseDto>> {
    try {
      const waterLog = await this.supabaseService.getWaterLogById(id, userId);

      if (!waterLog) {
        return ResponseDto.error('Water log not found');
      }

      return ResponseDto.success(waterLog, 'Water log retrieved successfully');
    } catch (error) {
      return ResponseDto.error('Failed to retrieve water log', error.message);
    }
  }

  @Put(':id')
  async updateWaterLog(
    @Param('id') id: string,
    @Body() updateWaterLogDto: UpdateWaterLogDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<WaterLogResponseDto>> {
    try {
      const waterLog = await this.supabaseService.updateWaterLog(
        id,
        userId,
        updateWaterLogDto,
      );

      if (!waterLog) {
        return ResponseDto.error('Water log not found');
      }

      return ResponseDto.success(waterLog, 'Water log updated successfully');
    } catch (error) {
      return ResponseDto.error('Failed to update water log', error.message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWaterLog(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<null>> {
    try {
      const deleted = await this.supabaseService.deleteWaterLog(id, userId);

      if (!deleted) {
        return ResponseDto.error('Water log not found');
      }

      return ResponseDto.success(null, 'Water log deleted successfully');
    } catch (error) {
      return ResponseDto.error('Failed to delete water log', error.message);
    }
  }

  @Get('stats/daily')
  async getDailyWaterStats(
    @Query('date') date: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const stats = await this.supabaseService.getDailyWaterStats(userId, date);
      return ResponseDto.success(
        stats,
        'Daily water stats retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve daily water stats',
        error.message,
      );
    }
  }

  @Get('stats/weekly')
  async getWeeklyWaterStats(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const stats = await this.supabaseService.getWeeklyWaterStats(
        userId,
        startDate,
        endDate,
      );
      return ResponseDto.success(
        stats,
        'Weekly water stats retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve weekly water stats',
        error.message,
      );
    }
  }

  @Get('goals/daily')
  async getDailyWaterGoal(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const goal = await this.supabaseService.getDailyWaterGoal(userId);
      return ResponseDto.success(
        goal,
        'Daily water goal retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve daily water goal',
        error.message,
      );
    }
  }

  @Post('goals/daily')
  async setDailyWaterGoal(
    @Body() goalDto: DailyWaterGoalDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const goal = await this.supabaseService.setDailyWaterGoal(
        userId,
        goalDto,
      );
      return ResponseDto.success(goal, 'Daily water goal set successfully');
    } catch (error) {
      return ResponseDto.error('Failed to set daily water goal', error.message);
    }
  }

  @Get('progress/today')
  async getTodayWaterProgress(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const progress = await this.supabaseService.getTodayWaterProgress(userId);
      return ResponseDto.success(
        progress,
        "Today's water progress retrieved successfully",
      );
    } catch (error) {
      return ResponseDto.error(
        "Failed to retrieve today's water progress",
        error.message,
      );
    }
  }

  @Get('trends/consumption')
  async getWaterConsumptionTrends(
    @Query('days') days: number = 30,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const trends = await this.supabaseService.getWaterConsumptionTrends(
        userId,
        days,
      );
      return ResponseDto.success(
        trends,
        'Water consumption trends retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve water consumption trends',
        error.message,
      );
    }
  }

  @Get('insights/hydration')
  async getHydrationInsights(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const insights = await this.supabaseService.getHydrationInsights(userId);
      return ResponseDto.success(
        insights,
        'Hydration insights retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve hydration insights',
        error.message,
      );
    }
  }
}
