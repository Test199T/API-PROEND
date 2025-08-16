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
  CreateHealthMetricDto,
  UpdateHealthMetricDto,
  HealthMetricQueryDto,
  HealthMetricResponseDto,
  HealthMetricTrendDto,
} from '../dto/health-metric.dto';
import { ResponseDto } from '../dto/common.dto';

@Controller('health-metrics')
@UseGuards(AuthGuard)
export class HealthMetricController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createHealthMetric(
    @Body() createHealthMetricDto: CreateHealthMetricDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<HealthMetricResponseDto>> {
    try {
      const healthMetric = await this.supabaseService.createHealthMetric({
        ...createHealthMetricDto,
        user_id: userId,
      });

      return ResponseDto.success(
        healthMetric,
        'Health metric created successfully',
      );
    } catch (error) {
      return ResponseDto.error('Failed to create health metric', error.message);
    }
  }

  @Get()
  async getHealthMetrics(
    @Query() query: HealthMetricQueryDto,
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthMetricResponseDto[]>> {
    try {
      const healthMetrics = await this.supabaseService.getHealthMetricsByUserId(userId);

      return ResponseDto.success(
        healthMetrics,
        'Health metrics retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve health metrics',
        error.message,
      );
    }
  }

  @Get(':id')
  async getHealthMetric(
    @Param('id') id: string,
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthMetricResponseDto>> {
    try {
      const healthMetrics = await this.supabaseService.getHealthMetricsByUserId(userId);
      const healthMetric = healthMetrics.find(metric => metric.id === parseInt(id));

      if (!healthMetric) {
        return ResponseDto.error('Health metric not found');
      }

      return ResponseDto.success(
        healthMetric,
        'Health metric retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve health metric',
        error.message,
      );
    }
  }

  @Put(':id')
  async updateHealthMetric(
    @Param('id') id: string,
    @Body() updateHealthMetricDto: UpdateHealthMetricDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<HealthMetricResponseDto>> {
    try {
      // Convert string userId to number for database operations
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        return ResponseDto.error('Invalid user ID format');
      }

      const healthMetric = await this.supabaseService.updateHealthMetric(
        id,
        numericUserId,
        updateHealthMetricDto,
      );

      if (!healthMetric) {
        return ResponseDto.error('Health metric not found');
      }

      return ResponseDto.success(
        healthMetric,
        'Health metric updated successfully',
      );
    } catch (error) {
      return ResponseDto.error('Failed to update health metric', error.message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHealthMetric(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<null>> {
    try {
      // Convert string userId to number for database operations
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        return ResponseDto.error('Invalid user ID format');
      }

      const deleted = await this.supabaseService.deleteHealthMetric(id, numericUserId);

      if (!deleted) {
        return ResponseDto.error('Health metric not found');
      }

      return ResponseDto.success(null, 'Health metric deleted successfully');
    } catch (error) {
      return ResponseDto.error('Failed to delete health metric', error.message);
    }
  }

  @Get('types/:metricType')
  async getMetricsByType(
    @Param('metricType') metricType: string,
    @Query() query: HealthMetricQueryDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<HealthMetricResponseDto[]>> {
    try {
      const metrics = await this.supabaseService.getMetricsByType(
        userId,
        metricType,
        query,
      );
      return ResponseDto.success(
        metrics,
        'Health metrics by type retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve health metrics by type',
        error.message,
      );
    }
  }

  @Get('stats/summary')
  async getHealthMetricsSummary(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const summary = await this.supabaseService.getHealthMetricsSummary(
        userId,
        startDate,
        endDate,
      );
      return ResponseDto.success(
        summary,
        'Health metrics summary retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve health metrics summary',
        error.message,
      );
    }
  }

  @Get('trends/:metricType')
  async getMetricTrends(
    @Param('metricType') metricType: string,
    @Query('days') days: number = 30,
    @User('id') userId: string,
  ): Promise<ResponseDto<HealthMetricTrendDto[]>> {
    try {
      const trends = await this.supabaseService.getMetricTrends(
        userId,
        metricType,
        days,
      );
      return ResponseDto.success(
        trends,
        'Health metric trends retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve health metric trends',
        error.message,
      );
    }
  }

  @Get('latest/:metricType')
  async getLatestMetric(
    @Param('metricType') metricType: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<HealthMetricResponseDto>> {
    try {
      const metric = await this.supabaseService.getLatestMetric(
        userId,
        metricType,
      );

      if (!metric) {
        return ResponseDto.error('Latest health metric not found');
      }

      return ResponseDto.success(
        metric,
        'Latest health metric retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve latest health metric',
        error.message,
      );
    }
  }

  @Get('ranges/:metricType')
  async getMetricRanges(
    @Param('metricType') metricType: string,
    @Query('days') days: number = 30,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const ranges = await this.supabaseService.getMetricRanges(
        userId,
        metricType,
        days,
      );
      return ResponseDto.success(
        ranges,
        'Health metric ranges retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve health metric ranges',
        error.message,
      );
    }
  }

  @Get('insights/analysis')
  async getHealthMetricsAnalysis(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const analysis =
        await this.supabaseService.getHealthMetricsAnalysis(userId);
      return ResponseDto.success(
        analysis,
        'Health metrics analysis retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve health metrics analysis',
        error.message,
      );
    }
  }

  @Post('bulk')
  async createBulkHealthMetrics(
    @Body() metrics: CreateHealthMetricDto[],
    @User('id') userId: string,
  ): Promise<ResponseDto<HealthMetricResponseDto[]>> {
    try {
      const createdMetrics = await this.supabaseService.createBulkHealthMetrics(
        metrics.map((metric) => ({ ...metric, user_id: userId })),
      );
      return ResponseDto.success(
        createdMetrics,
        'Bulk health metrics created successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to create bulk health metrics',
        error.message,
      );
    }
  }

  @Get('export/:format')
  async exportHealthMetrics(
    @Param('format') format: string,
    @Query() query: HealthMetricQueryDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const exportedData = await this.supabaseService.exportHealthMetrics(
        userId,
        format,
        query,
      );
      return ResponseDto.success(
        exportedData,
        'Health metrics exported successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to export health metrics',
        error.message,
      );
    }
  }
}
