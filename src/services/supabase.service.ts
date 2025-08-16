import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // User Management
  async createUser(userData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserById(id: number) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Health Goals
  async createHealthGoal(goalData: any) {
    const { data, error } = await this.supabase
      .from('health_goals')
      .insert(goalData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getHealthGoalsByUserId(userId: number) {
    const { data, error } = await this.supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateHealthGoal(id: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('health_goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Sleep Log
  async createSleepLog(sleepData: any) {
    const { data, error } = await this.supabase
      .from('sleep_log')
      .insert(sleepData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSleepLogsByUserId(userId: number, date?: string) {
    let query = this.supabase
      .from('sleep_log')
      .select('*')
      .eq('user_id', userId);

    if (date) {
      query = query.eq('sleep_date', date);
    }

    const { data, error } = await query.order('sleep_date', {
      ascending: false,
    });

    if (error) throw error;
    return data;
  }

  // Water Log
  async createWaterLog(waterData: any) {
    const { data, error } = await this.supabase
      .from('water_log')
      .insert(waterData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWaterLogsByUserId(userId: number, date?: string) {
    let query = this.supabase
      .from('water_log')
      .select('*')
      .eq('user_id', userId);

    if (date) {
      query = query
        .gte('consumed_at', `${date}T00:00:00`)
        .lt('consumed_at', `${date}T23:59:59`);
    }

    const { data, error } = await query.order('consumed_at', {
      ascending: false,
    });

    if (error) throw error;
    return data;
  }

  // Health Metrics
  async createHealthMetric(metricData: any) {
    const { data, error } = await this.supabase
      .from('health_metrics')
      .insert(metricData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getHealthMetricsByUserId(userId: number) {
    const { data, error } = await this.supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('metric_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Chat Sessions
  async createChatSession(sessionData: any) {
    const { data, error } = await this.supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getChatSessionsByUserId(userId: number) {
    const { data, error } = await this.supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Chat Messages
  async createChatMessage(messageData: any) {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getChatMessagesBySessionId(sessionId: number) {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Notifications
  async createNotification(notificationData: any) {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getNotificationsByUserId(userId: number) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async markNotificationAsRead(id: number) {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // AI Insights
  async createAIInsight(insightData: any) {
    const { data, error } = await this.supabase
      .from('ai_insights')
      .insert(insightData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAIInsightsByUserId(userId: number) {
    const { data, error } = await this.supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // User Preferences
  async createUserPreference(preferenceData: any) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .insert(preferenceData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserPreferenceByUserId(userId: number) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserPreference(userId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Dashboard Views
  async getDailyHealthSummary(userId: number, date: string) {
    const { data, error } = await this.supabase
      .from('daily_health_summary')
      .select('*')
      .eq('user_id', userId)
      .eq('summary_date', date)
      .single();

    if (error) throw error;
    return data;
  }

  async getActiveHealthGoals(userId: number) {
    const { data, error } = await this.supabase
      .from('active_health_goals')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  // Food Log Methods
  async createFoodLog(foodLogData: any) {
    const { data, error } = await this.supabase
      .from('food_log')
      .insert(foodLogData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFoodLogs(userId: number, query?: any) {
    let queryBuilder = this.supabase
      .from('food_log')
      .select('*')
      .eq('user_id', userId)
      .order('consumed_at', { ascending: false });

    if (query?.meal_type) {
      queryBuilder = queryBuilder.eq('meal_type', query.meal_type);
    }

    if (query?.date_from) {
      queryBuilder = queryBuilder.gte('consumed_at', query.date_from);
    }

    if (query?.date_to) {
      queryBuilder = queryBuilder.lte('consumed_at', query.date_to);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data;
  }

  async getFoodLog(id: string, userId: number) {
    const { data, error } = await this.supabase
      .from('food_log')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateFoodLog(id: string, userId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('food_log')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFoodLog(id: string, userId: number) {
    const { error } = await this.supabase
      .from('food_log')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Food log deleted successfully' };
  }

  async getFoodLogsByMealType(userId: number, mealType: string, query?: any) {
    let queryBuilder = this.supabase
      .from('food_log')
      .select('*')
      .eq('user_id', userId)
      .eq('meal_type', mealType)
      .order('consumed_at', { ascending: false });

    if (query?.date_from) {
      queryBuilder = queryBuilder.gte('consumed_at', query.date_from);
    }

    if (query?.date_to) {
      queryBuilder = queryBuilder.lte('consumed_at', query.date_to);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data;
  }

  async getFoodLogStats(userId: number, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('food_log')
      .select('*')
      .eq('user_id', userId)
      .gte('consumed_at', `${targetDate}T00:00:00`)
      .lte('consumed_at', `${targetDate}T23:59:59`);

    if (error) throw error;

    const stats = {
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      total_fiber: 0,
      meal_count: data.length,
      meals_by_type: {},
    };

    data.forEach((log) => {
      stats.total_calories += log.calories || 0;
      stats.total_protein += log.protein_g || 0;
      stats.total_carbs += log.carbs_g || 0;
      stats.total_fat += log.fat_g || 0;
      stats.total_fiber += log.fiber_g || 0;

      if (!stats.meals_by_type[log.meal_type]) {
        stats.meals_by_type[log.meal_type] = 0;
      }
      stats.meals_by_type[log.meal_type]++;
    });

    return stats;
  }

  async getFoodLogTrends(userId: number, days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('food_log')
      .select('*')
      .eq('user_id', userId)
      .gte('consumed_at', startDate.toISOString())
      .lte('consumed_at', endDate.toISOString())
      .order('consumed_at', { ascending: true });

    if (error) throw error;

    const trends: any[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayLogs = data.filter((log) => log.consumed_at.startsWith(dateStr));

      const dayStats: any = {
        date: dateStr,
        total_calories: dayLogs.reduce(
          (sum, log) => sum + (log.calories || 0),
          0,
        ),
        total_protein: dayLogs.reduce(
          (sum, log) => sum + (log.protein_g || 0),
          0,
        ),
        total_carbs: dayLogs.reduce((sum, log) => sum + (log.carbs_g || 0), 0),
        total_fat: dayLogs.reduce((sum, log) => sum + (log.fat_g || 0), 0),
        meal_count: dayLogs.length,
      };

      trends.push(dayStats);
    }

    return trends;
  }

  async getCaloriesSummary(
    userId: number,
    startDate?: string,
    endDate?: string,
  ) {
    const start =
      startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const { data, error } = await this.supabase
      .from('food_log')
      .select('*')
      .eq('user_id', userId)
      .gte('consumed_at', start)
      .lte('consumed_at', end)
      .order('consumed_at', { ascending: true });

    if (error) throw error;

    const summary = {
      total_calories: 0,
      average_daily_calories: 0,
      total_days: 0,
      daily_breakdown: {},
      meal_type_breakdown: {},
    };

    const days = new Set();
    data.forEach((log) => {
      const date = log.consumed_at.split('T')[0];
      days.add(date);

      summary.total_calories += log.calories || 0;

      if (!summary.daily_breakdown[date]) {
        summary.daily_breakdown[date] = 0;
      }
      summary.daily_breakdown[date] += log.calories || 0;

      if (!summary.meal_type_breakdown[log.meal_type]) {
        summary.meal_type_breakdown[log.meal_type] = 0;
      }
      summary.meal_type_breakdown[log.meal_type] += log.calories || 0;
    });

    summary.total_days = days.size;
    summary.average_daily_calories =
      summary.total_days > 0 ? summary.total_calories / summary.total_days : 0;

    return summary;
  }

  // Exercise Log Methods
  async createExerciseLog(exerciseLogData: any) {
    const { data, error } = await this.supabase
      .from('exercise_log')
      .insert(exerciseLogData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getExerciseLogs(userId: number, query?: any) {
    let queryBuilder = this.supabase
      .from('exercise_log')
      .select('*')
      .eq('user_id', userId)
      .order('exercise_date', { ascending: false });

    if (query?.exercise_type) {
      queryBuilder = queryBuilder.eq('exercise_type', query.exercise_type);
    }

    if (query?.exercise_date_from) {
      queryBuilder = queryBuilder.gte(
        'exercise_date',
        query.exercise_date_from,
      );
    }

    if (query?.exercise_date_to) {
      queryBuilder = queryBuilder.lte('exercise_date', query.exercise_date_to);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data;
  }

  async getExerciseLog(id: string, userId: number) {
    const { data, error } = await this.supabase
      .from('exercise_log')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateExerciseLog(id: string, userId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('exercise_log')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteExerciseLog(id: string, userId: number) {
    const { error } = await this.supabase
      .from('exercise_log')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Exercise log deleted successfully' };
  }

  async getExerciseLogsByType(
    userId: number,
    exerciseType: string,
    query?: any,
  ) {
    let queryBuilder = this.supabase
      .from('exercise_log')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_type', exerciseType)
      .order('exercise_date', { ascending: false });

    if (query?.exercise_date_from) {
      queryBuilder = queryBuilder.gte(
        'exercise_date',
        query.exercise_date_from,
      );
    }

    if (query?.exercise_date_to) {
      queryBuilder = queryBuilder.lte('exercise_date', query.exercise_date_to);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data;
  }

  async getExerciseLogStats(userId: number, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('exercise_log')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_date', targetDate);

    if (error) throw error;

    const stats = {
      total_exercises: data.length,
      total_duration: data.reduce(
        (sum, log) => sum + (log.duration_minutes || 0),
        0,
      ),
      total_calories_burned: data.reduce(
        (sum, log) => sum + (log.calories_burned || 0),
        0,
      ),
      total_distance: data.reduce(
        (sum, log) => sum + (log.distance_km || 0),
        0,
      ),
      exercises_by_type: {},
      exercises_by_intensity: {},
    };

    data.forEach((log) => {
      if (log.exercise_type) {
        if (!stats.exercises_by_type[log.exercise_type]) {
          stats.exercises_by_type[log.exercise_type] = 0;
        }
        stats.exercises_by_type[log.exercise_type]++;
      }

      if (log.intensity) {
        if (!stats.exercises_by_intensity[log.intensity]) {
          stats.exercises_by_intensity[log.intensity] = 0;
        }
        stats.exercises_by_intensity[log.intensity]++;
      }
    });

    return stats;
  }

  async getExerciseLogTrends(userId: number, days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('exercise_log')
      .select('*')
      .eq('user_id', userId)
      .gte('exercise_date', startDate.toISOString().split('T')[0])
      .lte('exercise_date', endDate.toISOString().split('T')[0])
      .order('exercise_date', { ascending: true });

    if (error) throw error;

    const trends: any[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayLogs = data.filter((log) => log.exercise_date === dateStr);

      const dayStats: any = {
        date: dateStr,
        total_exercises: dayLogs.length,
        total_duration: dayLogs.reduce(
          (sum, log) => sum + (log.duration_minutes || 0),
          0,
        ),
        total_calories_burned: dayLogs.reduce(
          (sum, log) => sum + (log.calories_burned || 0),
          0,
        ),
        total_distance: dayLogs.reduce(
          (sum, log) => sum + (log.distance_km || 0),
          0,
        ),
      };

      trends.push(dayStats);
    }

    return trends;
  }

  async getCaloriesBurnedSummary(
    userId: number,
    startDate?: string,
    endDate?: string,
  ) {
    const start =
      startDate ||
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('exercise_log')
      .select('*')
      .eq('user_id', userId)
      .gte('exercise_date', start)
      .lte('exercise_date', end)
      .order('exercise_date', { ascending: true });

    if (error) throw error;

    const summary = {
      total_calories_burned: 0,
      average_daily_calories_burned: 0,
      total_days: 0,
      daily_breakdown: {},
      exercise_type_breakdown: {},
    };

    const days = new Set();
    data.forEach((log) => {
      const date = log.exercise_date;
      days.add(date);

      summary.total_calories_burned += log.calories_burned || 0;

      if (!summary.daily_breakdown[date]) {
        summary.daily_breakdown[date] = 0;
      }
      summary.daily_breakdown[date] += log.calories_burned || 0;

      if (log.exercise_type) {
        if (!summary.exercise_type_breakdown[log.exercise_type]) {
          summary.exercise_type_breakdown[log.exercise_type] = 0;
        }
        summary.exercise_type_breakdown[log.exercise_type] +=
          log.calories_burned || 0;
      }
    });

    summary.total_days = days.size;
    summary.average_daily_calories_burned =
      summary.total_days > 0
        ? summary.total_calories_burned / summary.total_days
        : 0;

    return summary;
  }

  async getCurrentExerciseStreak(userId: number) {
    const { data, error } = await this.supabase
      .from('exercise_log')
      .select('exercise_date')
      .eq('user_id', userId)
      .order('exercise_date', { ascending: false });

    if (error) throw error;

    if (data.length === 0) return { current_streak: 0, longest_streak: 0 };

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < data.length; i++) {
      const logDate = new Date(data[i].exercise_date);
      logDate.setHours(0, 0, 0, 0);

      if (i === 0) {
        const diffTime = today.getTime() - logDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          currentStreak = 1;
          tempStreak = 1;
        }
      } else {
        const prevDate = new Date(data[i - 1].exercise_date);
        prevDate.setHours(0, 0, 0, 0);

        const diffTime = prevDate.getTime() - logDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          if (i === 0 || i === 1) {
            currentStreak = tempStreak;
          }
        } else {
          tempStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return { current_streak: currentStreak, longest_streak: longestStreak };
  }

  // Utility Methods
  async deleteRecord(table: string, id: number) {
    const { error } = await this.supabase.from(table).delete().eq('id', id);

    if (error) throw error;
    return { message: 'Record deleted successfully' };
  }

  async executeRawQuery(query: string, params?: any[]) {
    const { data, error } = await this.supabase.rpc('execute_sql', {
      query_text: query,
      query_params: params || [],
    });

    if (error) throw error;
    return data;
  }
}
