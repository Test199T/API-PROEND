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
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../services/supabase.service';
import { FoodLogService } from '../services/food-log.service';
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
  private readonly logger = new Logger(FoodLogController.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly foodLogService: FoodLogService,
    private readonly aiService: AIService,
  ) {}

  @Post()
  async createFoodLog(
    @Body() createFoodLogDto: CreateFoodLogDto,
    @Request() req: any,
  ): Promise<ResponseDto<FoodLogResponseDto>> {
    try {
      const userId = req.user.id;
      const foodLog = await this.foodLogService.createFoodLog({
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
      this.logger.log(`GET /food-log - User: ${req.user.id}, Query:`, query);
      const userId = req.user.id;
      const foodLogs = await this.foodLogService.getFoodLogs(userId, query);

      this.logger.log(`Found ${foodLogs?.length || 0} food logs for user ${userId}`);
      return ResponseDto.success(foodLogs, 'Food logs retrieved successfully');
    } catch (error) {
      this.logger.error(`Failed to retrieve food logs for user ${req.user.id}:`, error);
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

      return ResponseDto.success(
        stats,
        'Food log stats retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve food log stats',
        error.message,
      );
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

      return ResponseDto.success(
        trends,
        'Food log trends retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve food log trends',
        error.message,
      );
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

      return ResponseDto.success(
        analysis,
        'Nutrition analysis completed successfully',
      );
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

      return ResponseDto.success(
        recommendations,
        'Food recommendations retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to get food recommendations',
        error.message,
      );
    }
  }

  @Get('dashboard')
  async getFoodLogDashboard(@Request() req: any): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split('T')[0];

      // Get today's food logs
      const todayFoodLogs = await this.supabaseService.getFoodLogs(userId, {
        date_from: `${today}T00:00:00`,
        date_to: `${today}T23:59:59`,
      });

      // Get recent food logs (last 7 days)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const recentFoodLogs = await this.supabaseService.getFoodLogs(userId, {
        date_from: weekStart.toISOString(),
        date_to: new Date().toISOString(),
      });

      // Get latest health metrics
      const healthMetrics = await this.supabaseService.getHealthMetricsByUserId(userId);
      const latestMetrics = {
        weight: healthMetrics?.find(m => m.metric_type === 'weight')?.metric_value || null,
        bmi: healthMetrics?.find(m => m.metric_type === 'bmi')?.metric_value || null,
        body_fat: healthMetrics?.find(m => m.metric_type === 'body_fat')?.metric_value || null,
      };

      // Get active health goals
      const healthGoals = await this.supabaseService.getHealthGoalsByUserId(userId);
      const activeGoals = healthGoals?.filter(g => g.status === 'active') || [];

      // Get notifications related to food/nutrition
      const notifications = await this.supabaseService.getNotificationsByUserId(userId);
      const foodNotifications = notifications?.filter(n =>
        n.type === 'nutrition' || n.type === 'meal_reminder' || n.type === 'goal_progress'
      ).slice(0, 5) || [];

      // Calculate today's nutrition totals
      const todayNutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        meals_logged: todayFoodLogs?.length || 0,
      };

      if (todayFoodLogs) {
        todayFoodLogs.forEach(log => {
          todayNutrition.calories += log.calories || 0;
          todayNutrition.protein += log.protein_g || 0;
          todayNutrition.carbs += log.carbs_g || 0;
          todayNutrition.fat += log.fat_g || 0;
          todayNutrition.fiber += log.fiber_g || 0;
        });
      }

      // Calculate weekly trends
      const weeklyTrends: Array<{
        date: string;
        calories: number;
        meals: number;
      }> = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayLogs = recentFoodLogs?.filter(log =>
          log.consumed_at.startsWith(dateStr)
        ) || [];
        
        const dayCalories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
        
        weeklyTrends.push({
          date: dateStr,
          calories: dayCalories,
          meals: dayLogs.length,
        });
      }

      // Meal distribution for today
      const mealDistribution: Record<string, number> = {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0,
      };

      if (todayFoodLogs) {
        todayFoodLogs.forEach(log => {
          if (mealDistribution.hasOwnProperty(log.meal_type)) {
            mealDistribution[log.meal_type] += log.calories || 0;
          }
        });
      }

      // Quick insights
      const insights: Array<{
        type: string;
        message: string;
        priority: string;
      }> = [];
      
      if (todayNutrition.meals_logged === 0) {
        insights.push({
          type: 'reminder',
          message: 'You haven\'t logged any meals today. Start tracking your nutrition!',
          priority: 'high',
        });
      } else if (todayNutrition.meals_logged < 3) {
        insights.push({
          type: 'suggestion',
          message: `You've logged ${todayNutrition.meals_logged} meal(s) today. Don't forget your other meals!`,
          priority: 'medium',
        });
      }

      if (todayNutrition.calories > 0) {
        const avgWeeklyCalories = weeklyTrends.reduce((sum, day) => sum + day.calories, 0) / 7;
        if (todayNutrition.calories > avgWeeklyCalories * 1.2) {
          insights.push({
            type: 'warning',
            message: 'Today\'s calorie intake is higher than your weekly average.',
            priority: 'medium',
          });
        } else if (todayNutrition.calories < avgWeeklyCalories * 0.8) {
          insights.push({
            type: 'info',
            message: 'Today\'s calorie intake is lower than your weekly average.',
            priority: 'low',
          });
        }
      }

      const dashboard = {
        today: {
          date: today,
          nutrition: todayNutrition,
          meal_distribution: mealDistribution,
          recent_meals: todayFoodLogs?.slice(0, 5) || [],
        },
        weekly_trends: weeklyTrends,
        health_metrics: latestMetrics,
        active_goals: activeGoals.slice(0, 3).map(goal => ({
          id: goal.id,
          title: goal.title,
          goal_type: goal.goal_type,
          progress_percentage: goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0,
          target_date: goal.target_date,
        })),
        notifications: foodNotifications.map(notif => ({
          id: notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          created_at: notif.created_at,
          is_read: notif.is_read,
        })),
        insights,
        quick_stats: {
          total_meals_this_week: recentFoodLogs?.length || 0,
          average_daily_calories: weeklyTrends.reduce((sum, day) => sum + day.calories, 0) / 7,
          most_active_meal_time: Object.entries(mealDistribution)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'breakfast',
        },
      };

      return ResponseDto.success(dashboard, 'Food log dashboard data retrieved successfully');
    } catch (error) {
      return ResponseDto.error('Failed to retrieve dashboard data', error.message);
    }
  }

  // Specific routes must come before parameterized routes
  @Get('summary')
  async getFoodLogSummary(
    @Request() req: any,
    @Query('period') period: string = 'week',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ResponseDto<any>> {
    try {
      const userId = req.user.id;
      
      // Calculate date range based on period
      let start: string, end: string;
      const now = new Date();
      
      if (startDate && endDate) {
        start = startDate;
        end = endDate;
      } else {
        switch (period) {
          case 'day':
            start = now.toISOString().split('T')[0];
            end = start;
            break;
          case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - 7);
            start = weekStart.toISOString().split('T')[0];
            end = now.toISOString().split('T')[0];
            break;
          case 'month':
            const monthStart = new Date(now);
            monthStart.setDate(now.getDate() - 30);
            start = monthStart.toISOString().split('T')[0];
            end = monthStart.toISOString().split('T')[0];
            break;
          default:
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            end = now.toISOString().split('T')[0];
        }
      }

      // Get food log data
      const foodLogs = await this.supabaseService.getFoodLogs(userId, {
        date_from: `${start}T00:00:00`,
        date_to: `${end}T23:59:59`,
      });

      // Get health metrics (weight trends)
      const healthMetrics = await this.supabaseService.getHealthMetricsByUserId(userId);
      const weightMetrics = healthMetrics?.filter(m => m.metric_type === 'weight') || [];

      // Get health goals
      const healthGoals = await this.supabaseService.getHealthGoalsByUserId(userId);
      const activeGoals = healthGoals?.filter(g => g.status === 'active') || [];

      // Calculate nutrition summary
      const nutritionSummary = {
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        total_fiber: 0,
        total_sugar: 0,
        total_sodium: 0,
        meal_count: foodLogs?.length || 0,
        days_logged: 0,
      };

      const dailyTotals: Record<string, {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        sugar: number;
        sodium: number;
      }> = {};
      
      if (foodLogs) {
        foodLogs.forEach(log => {
          const date = log.consumed_at.split('T')[0];
          if (!dailyTotals[date]) {
            dailyTotals[date] = {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              sugar: 0,
              sodium: 0,
            };
          }
          
          dailyTotals[date].calories += log.calories || 0;
          dailyTotals[date].protein += log.protein_g || 0;
          dailyTotals[date].carbs += log.carbs_g || 0;
          dailyTotals[date].fat += log.fat_g || 0;
          dailyTotals[date].fiber += log.fiber_g || 0;
          dailyTotals[date].sugar += log.sugar_g || 0;
          dailyTotals[date].sodium += log.sodium_mg || 0;

          nutritionSummary.total_calories += log.calories || 0;
          nutritionSummary.total_protein += log.protein_g || 0;
          nutritionSummary.total_carbs += log.carbs_g || 0;
          nutritionSummary.total_fat += log.fat_g || 0;
          nutritionSummary.total_fiber += log.fiber_g || 0;
          nutritionSummary.total_sugar += log.sugar_g || 0;
          nutritionSummary.total_sodium += log.sodium_mg || 0;
        });
      }

      nutritionSummary.days_logged = Object.keys(dailyTotals).length;

      // Calculate averages
      const averages = {
        daily_calories: nutritionSummary.days_logged > 0 ? nutritionSummary.total_calories / nutritionSummary.days_logged : 0,
        daily_protein: nutritionSummary.days_logged > 0 ? nutritionSummary.total_protein / nutritionSummary.days_logged : 0,
        daily_carbs: nutritionSummary.days_logged > 0 ? nutritionSummary.total_carbs / nutritionSummary.days_logged : 0,
        daily_fat: nutritionSummary.days_logged > 0 ? nutritionSummary.total_fat / nutritionSummary.days_logged : 0,
      };

      // Weight trend analysis
      const weightTrend = {
        current_weight: weightMetrics.length > 0 ? weightMetrics[0].metric_value : null,
        weight_change: 0,
        trend_direction: 'stable' as 'stable' | 'increasing' | 'decreasing',
      };

      if (weightMetrics.length >= 2) {
        const latest = weightMetrics[0].metric_value;
        const previous = weightMetrics[1].metric_value;
        weightTrend.weight_change = latest - previous;
        weightTrend.trend_direction = weightTrend.weight_change > 0 ? 'increasing' :
                                     weightTrend.weight_change < 0 ? 'decreasing' : 'stable';
      }

      // Goal progress
      const goalProgress = activeGoals.map(goal => ({
        id: goal.id,
        title: goal.title,
        goal_type: goal.goal_type,
        target_value: goal.target_value,
        current_value: goal.current_value,
        progress_percentage: goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0,
        status: goal.status,
        target_date: goal.target_date,
      }));

      // Calculate most logged meal type
      const mealTypeCounts: Record<string, number> = {};
      if (foodLogs) {
        foodLogs.forEach(log => {
          mealTypeCounts[log.meal_type] = (mealTypeCounts[log.meal_type] || 0) + 1;
        });
      }
      
      const mostLoggedMeal = Object.entries(mealTypeCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || null;

      const summary = {
        period,
        start_date: start,
        end_date: end,
        nutrition_summary: nutritionSummary,
        daily_averages: averages,
        daily_breakdown: Object.entries(dailyTotals).map(([date, totals]) => ({
          date,
          calories: totals.calories,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          fiber: totals.fiber,
          sugar: totals.sugar,
          sodium: totals.sodium,
        })),
        weight_trend: weightTrend,
        goal_progress: goalProgress,
        insights: {
          most_logged_meal: mostLoggedMeal,
          average_meals_per_day: nutritionSummary.days_logged > 0 ?
            nutritionSummary.meal_count / nutritionSummary.days_logged : 0,
        },
      };

      return ResponseDto.success(summary, 'Food log summary retrieved successfully');
    } catch (error) {
      return ResponseDto.error('Failed to retrieve food log summary', error.message);
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

      return ResponseDto.success(
        foodLogs,
        `Food logs for ${mealType} retrieved successfully`,
      );
    } catch (error) {
      return ResponseDto.error(
        `Failed to retrieve food logs for ${mealType}`,
        error.message,
      );
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

      return ResponseDto.success(
        summary,
        'Calories summary retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve calories summary',
        error.message,
      );
    }
  }

  // Parameterized routes must come last
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
      const foodLog = await this.foodLogService.updateFoodLog(
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
}
