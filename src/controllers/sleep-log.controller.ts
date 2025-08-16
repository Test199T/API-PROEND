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
  CreateSleepLogDto,
  UpdateSleepLogDto,
  SleepLogQueryDto,
  SleepLogResponseDto,
} from '../dto/sleep-log.dto';
import { ResponseDto } from '../dto/common.dto';

@Controller('sleep-logs')
@UseGuards(AuthGuard)
export class SleepLogController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSleepLog(
    @Body() createSleepLogDto: CreateSleepLogDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<SleepLogResponseDto>> {
    try {
      const sleepLog = await this.supabaseService.createSleepLog({
        ...createSleepLogDto,
        user_id: userId,
      });

      return ResponseDto.success(sleepLog, 'Sleep log created successfully');
    } catch (error) {
      return ResponseDto.error('Failed to create sleep log', error.message);
    }
  }

  @Get()
  async getSleepLogs(
    @Query() query: SleepLogQueryDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<SleepLogResponseDto[]>> {
    try {
      const sleepLogs = await this.supabaseService.getSleepLogs({
        ...query,
        user_id: userId,
      });

      return ResponseDto.success(
        sleepLogs,
        'Sleep logs retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error('Failed to retrieve sleep logs', error.message);
    }
  }

  @Get(':id')
  async getSleepLog(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<SleepLogResponseDto>> {
    try {
      const sleepLog = await this.supabaseService.getSleepLogById(id, userId);

      if (!sleepLog) {
        return ResponseDto.error('Sleep log not found');
      }

      return ResponseDto.success(sleepLog, 'Sleep log retrieved successfully');
    } catch (error) {
      return ResponseDto.error('Failed to retrieve sleep log', error.message);
    }
  }

  @Put(':id')
  async updateSleepLog(
    @Param('id') id: string,
    @Body() updateSleepLogDto: UpdateSleepLogDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<SleepLogResponseDto>> {
    try {
      const sleepLog = await this.supabaseService.updateSleepLog(
        id,
        userId,
        updateSleepLogDto,
      );

      if (!sleepLog) {
        return ResponseDto.error('Sleep log not found');
      }

      return ResponseDto.success(sleepLog, 'Sleep log updated successfully');
    } catch (error) {
      return ResponseDto.error('Failed to update sleep log', error.message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSleepLog(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<null>> {
    try {
      const deleted = await this.supabaseService.deleteSleepLog(id, userId);

      if (!deleted) {
        return ResponseDto.error('Sleep log not found');
      }

      return ResponseDto.success(null, 'Sleep log deleted successfully');
    } catch (error) {
      return ResponseDto.error('Failed to delete sleep log', error.message);
    }
  }

  @Get('stats/daily')
  async getDailySleepStats(
    @Query('date') date: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const stats = await this.supabaseService.getDailySleepStats(userId, date);
      return ResponseDto.success(
        stats,
        'Daily sleep stats retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve daily sleep stats',
        error.message,
      );
    }
  }

  @Get('stats/weekly')
  async getWeeklySleepStats(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const stats = await this.supabaseService.getWeeklySleepStats(
        userId,
        startDate,
        endDate,
      );
      return ResponseDto.success(
        stats,
        'Weekly sleep stats retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve weekly sleep stats',
        error.message,
      );
    }
  }

  @Get('trends/quality')
  async getSleepQualityTrends(
    @Query('days') days: number = 30,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const trends = await this.supabaseService.getSleepQualityTrends(
        userId,
        days,
      );
      return ResponseDto.success(
        trends,
        'Sleep quality trends retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve sleep quality trends',
        error.message,
      );
    }
  }

  @Get('insights/recommendations')
  async getSleepRecommendations(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const recommendations =
        await this.supabaseService.getSleepRecommendations(userId);
      return ResponseDto.success(
        recommendations,
        'Sleep recommendations retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve sleep recommendations',
        error.message,
      );
    }
  }
}
