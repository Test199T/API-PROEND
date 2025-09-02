import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class FoodLogService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createFoodLog(foodLogData: any) {
    // Convert legacy field names to new format for backward compatibility
    const normalizedData = {
      ...foodLogData,
      // Convert serving_size to quantity if quantity is not provided
      quantity: foodLogData.quantity || foodLogData.serving_size,
      // Convert serving_unit to unit if unit is not provided
      unit: foodLogData.unit || foodLogData.serving_unit,
      // Convert calories_per_serving to calories if calories is not provided
      calories: foodLogData.calories || foodLogData.calories_per_serving,
    };

    // Remove legacy fields to avoid confusion
    delete normalizedData.serving_size;
    delete normalizedData.serving_unit;
    delete normalizedData.calories_per_serving;

    return await this.supabaseService.createFoodLog(normalizedData);
  }

  async getFoodLogs(userId: number, query?: any) {
    return await this.supabaseService.getFoodLogs(userId, query);
  }

  async getFoodLog(id: string, userId: number) {
    return await this.supabaseService.getFoodLog(id, userId);
  }

  async updateFoodLog(id: string, userId: number, updateData: any) {
    // Convert legacy field names to new format for backward compatibility
    const normalizedData = {
      ...updateData,
      // Convert serving_size to quantity if quantity is not provided
      quantity: updateData.quantity || updateData.serving_size,
      // Convert serving_unit to unit if unit is not provided
      unit: updateData.unit || updateData.serving_unit,
      // Convert calories_per_serving to calories if calories is not provided
      calories: updateData.calories || updateData.calories_per_serving,
    };

    // Remove legacy fields to avoid confusion
    delete normalizedData.serving_size;
    delete normalizedData.serving_unit;
    delete normalizedData.calories_per_serving;

    return await this.supabaseService.updateFoodLog(id, userId, normalizedData);
  }

  async deleteFoodLog(id: string, userId: number) {
    return await this.supabaseService.deleteFoodLog(id, userId);
  }

  async getFoodLogsByMealType(userId: number, mealType: string, query?: any) {
    return await this.supabaseService.getFoodLogsByMealType(
      userId,
      mealType,
      query,
    );
  }

  async getFoodLogStats(userId: number, date?: string) {
    return await this.supabaseService.getFoodLogStats(userId, date);
  }

  async getFoodLogTrends(userId: number, days: number = 7) {
    return await this.supabaseService.getFoodLogTrends(userId, days);
  }

  async getCaloriesSummary(userId: number, startDate?: string, endDate?: string) {
    return await this.supabaseService.getCaloriesSummary(userId, startDate, endDate);
  }

  async getFoodLogSummary(userId: number, period: string = 'week', startDate?: string, endDate?: string) {
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
          end = now.toISOString().split('T')[0];
          break;
        default:
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          end = now.toISOString().split('T')[0];
      }
    }

    // Get food logs for the period
    const foodLogs = await this.supabaseService.getFoodLogs(userId, {
      date_from: `${start}T00:00:00`,
      date_to: `${end}T23:59:59`,
    });

    // Get health metrics and goals
    const healthMetrics = await this.supabaseService.getHealthMetricsByUserId(userId);
    const healthGoals = await this.supabaseService.getHealthGoalsByUserId(userId);

    return {
      period,
      start_date: start,
      end_date: end,
      food_logs: foodLogs,
      health_metrics: healthMetrics,
      health_goals: healthGoals,
    };
  }

  async getFoodLogDashboard(userId: number) {
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

    // Get active health goals
    const healthGoals = await this.supabaseService.getHealthGoalsByUserId(userId);

    // Get notifications
    const notifications = await this.supabaseService.getNotificationsByUserId(userId);

    return {
      today_food_logs: todayFoodLogs,
      recent_food_logs: recentFoodLogs,
      health_metrics: healthMetrics,
      health_goals: healthGoals,
      notifications: notifications,
    };
  }

  async getNutritionSummary(userId: number, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const foodLogs = await this.supabaseService.getFoodLogs(userId, {
      date_from: `${targetDate}T00:00:00`,
      date_to: `${targetDate}T23:59:59`,
    });

    const summary = {
      date: targetDate,
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      total_fiber: 0,
      total_sugar: 0,
      total_sodium: 0,
      meal_count: foodLogs?.length || 0,
      meals_by_type: {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0,
      },
    };

    if (foodLogs) {
      foodLogs.forEach(log => {
        summary.total_calories += log.calories || 0;
        summary.total_protein += log.protein_g || 0;
        summary.total_carbs += log.carbs_g || 0;
        summary.total_fat += log.fat_g || 0;
        summary.total_fiber += log.fiber_g || 0;
        summary.total_sugar += log.sugar_g || 0;
        summary.total_sodium += log.sodium_mg || 0;

        if (summary.meals_by_type.hasOwnProperty(log.meal_type)) {
          summary.meals_by_type[log.meal_type]++;
        }
      });
    }

    return summary;
  }

  async getWeeklyNutritionTrends(userId: number, weeks: number = 4) {
    const trends: Array<{
      week_start: string;
      week_end: string;
      total_calories: number;
      total_protein: number;
      total_carbs: number;
      total_fat: number;
      meal_count: number;
      average_daily_calories: number;
    }> = [];
    const now = new Date();

    for (let i = weeks - 1; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);

      const weekLogs = await this.supabaseService.getFoodLogs(userId, {
        date_from: weekStart.toISOString(),
        date_to: weekEnd.toISOString(),
      });

      const weekSummary = {
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        meal_count: weekLogs?.length || 0,
        average_daily_calories: 0,
      };

      if (weekLogs) {
        weekLogs.forEach(log => {
          weekSummary.total_calories += log.calories || 0;
          weekSummary.total_protein += log.protein_g || 0;
          weekSummary.total_carbs += log.carbs_g || 0;
          weekSummary.total_fat += log.fat_g || 0;
        });
        
        weekSummary.average_daily_calories = weekSummary.total_calories / 7;
      }

      trends.push(weekSummary);
    }

    return trends;
  }

  async getMealTypeAnalysis(userId: number, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const foodLogs = await this.supabaseService.getFoodLogs(userId, {
      date_from: startDate.toISOString(),
      date_to: endDate.toISOString(),
    });

    const analysis = {
      breakfast: { count: 0, calories: 0, protein: 0, carbs: 0, fat: 0 },
      lunch: { count: 0, calories: 0, protein: 0, carbs: 0, fat: 0 },
      dinner: { count: 0, calories: 0, protein: 0, carbs: 0, fat: 0 },
      snack: { count: 0, calories: 0, protein: 0, carbs: 0, fat: 0 },
    };

    if (foodLogs) {
      foodLogs.forEach(log => {
        if (analysis[log.meal_type]) {
          analysis[log.meal_type].count++;
          analysis[log.meal_type].calories += log.calories || 0;
          analysis[log.meal_type].protein += log.protein_g || 0;
          analysis[log.meal_type].carbs += log.carbs_g || 0;
          analysis[log.meal_type].fat += log.fat_g || 0;
        }
      });
    }

    // Calculate averages
    Object.keys(analysis).forEach(mealType => {
      const meal = analysis[mealType];
      if (meal.count > 0) {
        meal.calories = Math.round(meal.calories / meal.count);
        meal.protein = Math.round(meal.protein / meal.count);
        meal.carbs = Math.round(meal.carbs / meal.count);
        meal.fat = Math.round(meal.fat / meal.count);
      }
    });

    return analysis;
  }
}
