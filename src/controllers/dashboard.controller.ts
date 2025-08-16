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
import {
  DashboardService,
  DailyHealthSummary,
  WeeklyHealthTrend,
  HealthMetrics,
} from '../services/dashboard.service';
import { SupabaseService } from '../services/supabase.service';
import { AIService } from '../services/ai.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(
    private dashboardService: DashboardService,
    private supabaseService: SupabaseService,
    private aiService: AIService,
  ) {}

  // ==================== DASHBOARD OVERVIEW ====================

  @Get('overview')
  async getDashboardOverview(@Request() req) {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    try {
      const [dailySummary, healthMetrics, goalsProgress, aiInsights] =
        await Promise.all([
          this.dashboardService.getDailyHealthSummary(userId, today),
          this.dashboardService.getHealthMetrics(userId),
          this.dashboardService.getHealthGoalsProgress(userId),
          this.dashboardService.getAIInsights(userId),
        ]);

      return {
        success: true,
        data: {
          dailySummary,
          healthMetrics,
          goalsProgress,
          aiInsights,
          lastUpdated: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('daily-summary/:date')
  async getDailyHealthSummary(@Request() req, @Param('date') date: string) {
    const userId = req.user.id;

    try {
      const summary = await this.dashboardService.getDailyHealthSummary(
        userId,
        date,
      );
      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('weekly-trend/:weekStart')
  async getWeeklyHealthTrend(
    @Request() req,
    @Param('weekStart') weekStart: string,
  ) {
    const userId = req.user.id;

    try {
      const trend = await this.dashboardService.getWeeklyHealthTrend(
        userId,
        weekStart,
      );
      return {
        success: true,
        data: trend,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== HEALTH METRICS ====================

  @Get('health-metrics')
  async getHealthMetrics(@Request() req) {
    const userId = req.user.id;

    try {
      const metrics = await this.dashboardService.getHealthMetrics(userId);
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('health-metrics')
  async createHealthMetric(@Request() req, @Body() metricData: any) {
    const userId = req.user.id;

    try {
      const metric = await this.supabaseService.createHealthMetric({
        ...metricData,
        user_id: userId,
      });

      return {
        success: true,
        data: metric,
        message: 'Health metric created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== HEALTH GOALS ====================

  @Get('goals')
  async getHealthGoals(@Request() req) {
    const userId = req.user.id;

    try {
      const goals = await this.dashboardService.getHealthGoalsProgress(userId);
      return {
        success: true,
        data: goals,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('goals')
  async createHealthGoal(@Request() req, @Body() goalData: any) {
    const userId = req.user.id;

    try {
      const goal = await this.supabaseService.createHealthGoal({
        ...goalData,
        user_id: userId,
      });

      return {
        success: true,
        data: goal,
        message: 'Health goal created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put('goals/:id')
  async updateHealthGoal(
    @Request() req,
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    const userId = req.user.id;

    try {
      const goal = await this.supabaseService.updateHealthGoal(
        parseInt(id),
        updateData,
      );
      return {
        success: true,
        data: goal,
        message: 'Health goal updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== FOOD LOG ====================

  @Get('food-logs')
  async getFoodLogs(@Request() req, @Query('date') date?: string) {
    const userId = req.user.id;

    try {
      const foodLogs = await this.supabaseService.getFoodLogsByUserId(
        userId,
        date,
      );
      return {
        success: true,
        data: foodLogs,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('food-logs')
  async createFoodLog(@Request() req, @Body() foodData: any) {
    const userId = req.user.id;

    try {
      const foodLog = await this.supabaseService.createFoodLog({
        ...foodData,
        user_id: userId,
      });

      return {
        success: true,
        data: foodLog,
        message: 'Food log created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== EXERCISE LOG ====================

  @Get('exercise-logs')
  async getExerciseLogs(@Request() req, @Query('date') date?: string) {
    const userId = req.user.id;

    try {
      const exerciseLogs = await this.supabaseService.getExerciseLogsByUserId(
        userId,
        date,
      );
      return {
        success: true,
        data: exerciseLogs,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('exercise-logs')
  async createExerciseLog(@Request() req, @Body() exerciseData: any) {
    const userId = req.user.id;

    try {
      const exerciseLog = await this.supabaseService.createExerciseLog({
        ...exerciseData,
        user_id: userId,
      });

      return {
        success: true,
        data: exerciseLog,
        message: 'Exercise log created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== SLEEP LOG ====================

  @Get('sleep-logs')
  async getSleepLogs(@Request() req, @Query('date') date?: string) {
    const userId = req.user.id;

    try {
      const sleepLogs = await this.supabaseService.getSleepLogsByUserId(
        userId,
        date,
      );
      return {
        success: true,
        data: sleepLogs,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('sleep-logs')
  async createSleepLog(@Request() req, @Body() sleepData: any) {
    const userId = req.user.id;

    try {
      const sleepLog = await this.supabaseService.createSleepLog({
        ...sleepData,
        user_id: userId,
      });

      return {
        success: true,
        data: sleepLog,
        message: 'Sleep log created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== WATER LOG ====================

  @Get('water-logs')
  async getWaterLogs(@Request() req, @Query('date') date?: string) {
    const userId = req.user.id;

    try {
      const waterLogs = await this.supabaseService.getWaterLogsByUserId(
        userId,
        date,
      );
      return {
        success: true,
        data: waterLogs,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('water-logs')
  async createWaterLog(@Request() req, @Body() waterData: any) {
    const userId = req.user.id;

    try {
      const waterLog = await this.supabaseService.createWaterLog({
        ...waterData,
        user_id: userId,
      });

      return {
        success: true,
        data: waterLog,
        message: 'Water log created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== AI INSIGHTS ====================

  @Get('ai-insights')
  async getAIInsights(@Request() req) {
    const userId = req.user.id;

    try {
      const insights = await this.dashboardService.getAIInsights(userId);
      return {
        success: true,
        data: insights,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('ai-recommendations')
  async getAIRecommendations(@Request() req) {
    const userId = req.user.id;

    try {
      const recommendations =
        await this.aiService.generateAIRecommendations(userId);
      return {
        success: true,
        data: recommendations,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('ai-analyze')
  async analyzeUserHealth(@Request() req) {
    const userId = req.user.id;

    try {
      const analysis = await this.aiService.analyzeUserHealth(userId);
      return {
        success: true,
        data: analysis,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== NOTIFICATIONS ====================

  @Get('notifications')
  async getNotifications(@Request() req) {
    const userId = req.user.id;

    try {
      const notifications =
        await this.supabaseService.getNotificationsByUserId(userId);
      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('notifications/unread')
  async getUnreadNotifications(@Request() req) {
    const userId = req.user.id;

    try {
      const unreadNotifications =
        await this.dashboardService.getUnreadNotifications(userId);
      return {
        success: true,
        data: unreadNotifications,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put('notifications/:id/read')
  async markNotificationAsRead(@Request() req, @Param('id') id: string) {
    try {
      const notification = await this.supabaseService.markNotificationAsRead(
        parseInt(id),
      );
      return {
        success: true,
        data: notification,
        message: 'Notification marked as read',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== STATISTICS ====================

  @Get('statistics')
  async getUsageStatistics(@Request() req, @Query('days') days?: string) {
    const userId = req.user.id;
    const daysNumber = days ? parseInt(days) : 30;

    try {
      const stats = await this.dashboardService.getUsageStatistics(
        userId,
        daysNumber,
      );
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== USER PREFERENCES ====================

  @Get('preferences')
  async getUserPreferences(@Request() req) {
    const userId = req.user.id;

    try {
      const preferences =
        await this.supabaseService.getUserPreferenceByUserId(userId);
      return {
        success: true,
        data: preferences,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('preferences')
  async createUserPreferences(@Request() req, @Body() preferenceData: any) {
    const userId = req.user.id;

    try {
      const preferences = await this.supabaseService.createUserPreference({
        ...preferenceData,
        user_id: userId,
      });

      return {
        success: true,
        data: preferences,
        message: 'User preferences created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put('preferences')
  async updateUserPreferences(@Request() req, @Body() updateData: any) {
    const userId = req.user.id;

    try {
      const preferences = await this.supabaseService.updateUserPreference(
        userId,
        updateData,
      );
      return {
        success: true,
        data: preferences,
        message: 'User preferences updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
