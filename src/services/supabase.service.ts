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

  async getUserByUsername(username: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
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

  async updateHealthGoal(id: number, userId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('health_goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findHealthGoalById(id: number, userId: number) {
    const { data, error } = await this.supabase
      .from('health_goals')
      .select('*, users(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteHealthGoal(id: number, userId: number) {
    const { error } = await this.supabase
      .from('health_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Health goal deleted successfully' };
  }

  async updateGoalProgress(id: number, userId: number, currentValue: number) {
    const { data, error } = await this.supabase
      .from('health_goals')
      .update({
        current_value: currentValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getGoalStats(userId: number) {
    const { data, error } = await this.supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  async findHealthGoalsByIds(goalIds: number[], userId: number) {
    const { data, error } = await this.supabase
      .from('health_goals')
      .select('*')
      .in('id', goalIds)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  async searchHealthGoals(userId: number, searchParams: any) {
    let query = this.supabase
      .from('health_goals')
      .select('*, users(*)')
      .eq('user_id', userId);

    if (searchParams.goal_type) {
      query = query.eq('goal_type', searchParams.goal_type);
    }

    if (searchParams.status) {
      query = query.eq('status', searchParams.status);
    }

    if (searchParams.priority) {
      query = query.eq('priority', searchParams.priority);
    }

    if (searchParams.search) {
      query = query.or(
        `title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`,
      );
    }

    if (searchParams.start_date_from) {
      query = query.gte('start_date', searchParams.start_date_from);
    }

    if (searchParams.start_date_to) {
      query = query.lte('start_date', searchParams.start_date_to);
    }

    if (searchParams.target_date_from) {
      query = query.gte('target_date', searchParams.target_date_from);
    }

    if (searchParams.target_date_to) {
      query = query.lte('target_date', searchParams.target_date_to);
    }

    // Get total count first
    const { count: totalCount } = await this.supabase
      .from('health_goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Add pagination and ordering
    query = query
      .order('priority', { ascending: false })
      .order('target_date', { ascending: true })
      .order('created_at', { ascending: false })
      .range(
        searchParams.page ? (searchParams.page - 1) * searchParams.limit : 0,
        searchParams.limit ? searchParams.page * searchParams.limit - 1 : 9,
      );

    const { data, error } = await query;

    if (error) throw error;
    return { data, count: totalCount || 0 };
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

  async getSleepLogs(userId: number, query?: any) {
    let queryBuilder = this.supabase
      .from('sleep_log')
      .select('*')
      .eq('user_id', userId)
      .order('sleep_date', { ascending: false });

    if (query?.date_from) {
      queryBuilder = queryBuilder.gte('sleep_date', query.date_from);
    }

    if (query?.date_to) {
      queryBuilder = queryBuilder.lte('sleep_date', query.date_to);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data;
  }

  async getSleepLogById(id: string, userId: number) {
    const { data, error } = await this.supabase
      .from('sleep_log')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateSleepLog(id: string, userId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('sleep_log')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSleepLog(id: string, userId: number) {
    const { error } = await this.supabase
      .from('sleep_log')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Sleep log deleted successfully' };
  }

  // Additional Sleep Log Methods
  async getDailySleepStats(userId: number, date: string) {
    const { data, error } = await this.supabase
      .from('sleep_log')
      .select('sleep_duration, sleep_quality, sleep_efficiency, bedtime, wake_time')
      .eq('user_id', userId)
      .gte('sleep_date', `${date}T00:00:00`)
      .lt('sleep_date', `${date}T23:59:59`);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        date,
        totalSleepTime: 0,
        averageQuality: 0,
        averageEfficiency: 0,
        logCount: 0,
      };
    }

    const totalSleepTime = data.reduce((sum, log) => sum + (log.sleep_duration || 0), 0);
    const averageQuality = data.reduce((sum, log) => sum + (log.sleep_quality || 0), 0) / data.length;
    const averageEfficiency = data.reduce((sum, log) => sum + (log.sleep_efficiency || 0), 0) / data.length;

    return {
      date,
      totalSleepTime,
      averageQuality: Math.round(averageQuality * 100) / 100,
      averageEfficiency: Math.round(averageEfficiency * 100) / 100,
      logCount: data.length,
    };
  }

  async getWeeklySleepStats(userId: number, startDate: string, endDate: string) {
    const { data, error } = await this.supabase
      .from('sleep_log')
      .select('sleep_duration, sleep_quality, sleep_efficiency, sleep_date')
      .eq('user_id', userId)
      .gte('sleep_date', `${startDate}T00:00:00`)
      .lte('sleep_date', `${endDate}T23:59:59`)
      .order('sleep_date', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        startDate,
        endDate,
        totalSleepTime: 0,
        averageQuality: 0,
        averageEfficiency: 0,
        logCount: 0,
        dailyStats: [],
      };
    }

    const totalSleepTime = data.reduce((sum, log) => sum + (log.sleep_duration || 0), 0);
    const averageQuality = data.reduce((sum, log) => sum + (log.sleep_quality || 0), 0) / data.length;
    const averageEfficiency = data.reduce((sum, log) => sum + (log.sleep_efficiency || 0), 0) / data.length;

    // Group by date
    const dailyStats = data.reduce((acc, log) => {
      const date = log.sleep_date.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, totalSleepTime: 0, quality: 0, efficiency: 0, count: 0 };
      }
      acc[date].totalSleepTime += log.sleep_duration || 0;
      acc[date].quality += log.sleep_quality || 0;
      acc[date].efficiency += log.sleep_efficiency || 0;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages for each day
    Object.values(dailyStats).forEach(day => {
      day.averageQuality = Math.round((day.quality / day.count) * 100) / 100;
      day.averageEfficiency = Math.round((day.efficiency / day.count) * 100) / 100;
    });

    return {
      startDate,
      endDate,
      totalSleepTime,
      averageQuality: Math.round(averageQuality * 100) / 100,
      averageEfficiency: Math.round(averageEfficiency * 100) / 100,
      logCount: data.length,
      dailyStats: Object.values(dailyStats),
    };
  }

  async getSleepQualityTrends(userId: string, days: number = 30) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID format');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('sleep_log')
      .select('sleep_quality, sleep_date')
      .eq('user_id', numericUserId)
      .gte('sleep_date', startDate.toISOString().split('T')[0])
      .lte('sleep_date', endDate.toISOString().split('T')[0])
      .order('sleep_date', { ascending: true });

    if (error) throw error;

    return data?.map(log => ({
      date: log.sleep_date,
      quality: log.sleep_quality,
    })) || [];
  }

  async getSleepRecommendations(userId: string) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID format');
    }

    // Get recent sleep data for analysis
    const { data, error } = await this.supabase
      .from('sleep_log')
      .select('sleep_duration, sleep_quality, sleep_efficiency, bedtime, wake_time')
      .eq('user_id', numericUserId)
      .order('sleep_date', { ascending: false })
      .limit(7);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        recommendations: ['Start logging your sleep to get personalized recommendations'],
        averageSleepTime: 0,
        averageQuality: 0,
      };
    }

    const averageSleepTime = data.reduce((sum, log) => sum + (log.sleep_duration || 0), 0) / data.length;
    const averageQuality = data.reduce((sum, log) => sum + (log.sleep_quality || 0), 0) / data.length;

    const recommendations: string[] = [];

    if (averageSleepTime < 7) {
      recommendations.push('Consider increasing your sleep duration to at least 7-8 hours per night');
    }
    if (averageQuality < 3) {
      recommendations.push('Try improving your sleep environment and bedtime routine');
    }
    if (averageSleepTime > 9) {
      recommendations.push('You might be oversleeping. Consider reducing sleep duration to 7-8 hours');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great sleep habits! Keep up the good work');
    }

    return {
      recommendations,
      averageSleepTime: Math.round(averageSleepTime * 100) / 100,
      averageQuality: Math.round(averageQuality * 100) / 100,
    };
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

  async getWaterLogs(userId: number, query?: any) {
    let queryBuilder = this.supabase
      .from('water_log')
      .select('*')
      .eq('user_id', userId)
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

  async getWaterLogById(id: string, userId: number) {
    const { data, error } = await this.supabase
      .from('water_log')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateWaterLog(id: string, userId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('water_log')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWaterLog(id: string, userId: number) {
    const { error } = await this.supabase
      .from('water_log')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Water log deleted successfully' };
  }

  // Water Statistics
  async getDailyWaterStats(userId: string, date: string) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID format');
    }

    const { data, error } = await this.supabase
      .from('water_log')
      .select('amount, consumed_at')
      .eq('user_id', numericUserId)
      .gte('consumed_at', `${date}T00:00:00`)
      .lt('consumed_at', `${date}T23:59:59`);

    if (error) throw error;

    const totalAmount = data?.reduce((sum, log) => sum + (log.amount || 0), 0) || 0;
    const goal = await this.getDailyWaterGoal(numericUserId);

    return {
      date,
      totalConsumed: totalAmount,
      goal: goal,
      remaining: Math.max(0, goal - totalAmount),
      percentage: Math.min(100, (totalAmount / goal) * 100),
      logCount: data?.length || 0,
    };
  }

  async getWeeklyWaterStats(userId: string, startDate: string, endDate: string) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID format');
    }

    const { data, error } = await this.supabase
      .from('water_log')
      .select('amount, consumed_at')
      .eq('user_id', numericUserId)
      .gte('consumed_at', `${startDate}T00:00:00`)
      .lte('consumed_at', `${endDate}T23:59:59`)
      .order('consumed_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const dailyStats = data?.reduce((acc, log) => {
      const date = log.consumed_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, totalAmount: 0, logCount: 0 };
      }
      acc[date].totalAmount += log.amount || 0;
      acc[date].logCount += 1;
      return acc;
    }, {} as Record<string, { date: string; totalAmount: number; logCount: number }>) || {};

    const goal = await this.getDailyWaterGoal(numericUserId);
    const weeklyTotal = Object.values(dailyStats).reduce((sum, day) => sum + day.totalAmount, 0);
    const weeklyGoal = goal * 7;

    return {
      startDate,
      endDate,
      dailyStats: Object.values(dailyStats),
      weeklyTotal,
      weeklyGoal,
      weeklyPercentage: Math.min(100, (weeklyTotal / weeklyGoal) * 100),
      averageDaily: weeklyTotal / 7,
    };
  }

  // Water Goals and Progress
  async getDailyWaterGoal(userId: number) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('daily_water_goal')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.daily_water_goal || 2000; // Default to 2000ml if not set
  }

  async setDailyWaterGoal(userId: number, goalDto: any) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        daily_water_goal: goalDto.daily_water_goal,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTodayWaterProgress(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from('water_log')
      .select('amount')
      .eq('user_id', userId)
      .gte('consumed_at', `${today}T00:00:00`)
      .lt('consumed_at', `${today}T23:59:59`);

    if (error) throw error;
    
    const totalAmount = data?.reduce((sum, log) => sum + (log.amount || 0), 0) || 0;
    const goal = await this.getDailyWaterGoal(userId);
    
    return {
      consumed: totalAmount,
      goal: goal,
      remaining: Math.max(0, goal - totalAmount),
      percentage: Math.min(100, (totalAmount / goal) * 100),
    };
  }

  async getWaterConsumptionTrends(userId: number, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('water_log')
      .select('consumed_at, amount')
      .eq('user_id', userId)
      .gte('consumed_at', startDate.toISOString())
      .lte('consumed_at', endDate.toISOString())
      .order('consumed_at', { ascending: true });

    if (error) throw error;

    // Group by date and sum amounts
    const dailyTotals = data?.reduce((acc, log) => {
      const date = log.consumed_at.split('T')[0];
      acc[date] = (acc[date] || 0) + (log.amount || 0);
      return acc;
    }, {} as Record<string, number>) || {};

    return Object.entries(dailyTotals).map(([date, amount]) => ({
      date,
      amount,
    }));
  }

  async getHydrationInsights(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get today's and yesterday's water consumption
    const { data: todayData, error: todayError } = await this.supabase
      .from('water_log')
      .select('amount')
      .eq('user_id', userId)
      .gte('consumed_at', `${today}T00:00:00`)
      .lt('consumed_at', `${today}T23:59:59`);

    const { data: yesterdayData, error: yesterdayError } = await this.supabase
      .from('water_log')
      .select('amount')
      .eq('user_id', userId)
      .gte('consumed_at', `${yesterdayStr}T00:00:00`)
      .lt('consumed_at', `${yesterdayStr}T23:59:59`);

    if (todayError || yesterdayError) throw todayError || yesterdayError;

    const todayTotal = todayData?.reduce((sum, log) => sum + (log.amount || 0), 0) || 0;
    const yesterdayTotal = yesterdayData?.reduce((sum, log) => sum + (log.amount || 0), 0) || 0;
    const goal = await this.getDailyWaterGoal(userId);

    const insights = {
      todayConsumption: todayTotal,
      yesterdayConsumption: yesterdayTotal,
      goal: goal,
      todayProgress: Math.min(100, (todayTotal / goal) * 100),
      yesterdayProgress: Math.min(100, (yesterdayTotal / goal) * 100),
      improvement: todayTotal > yesterdayTotal ? 'increased' : todayTotal < yesterdayTotal ? 'decreased' : 'same',
      recommendation: todayTotal < goal * 0.8 ? 'Consider increasing water intake' : 'Good hydration habits!',
    };

    return insights;
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

  // Additional Health Metric Methods
  async updateHealthMetric(id: string, userId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('health_metrics')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteHealthMetric(id: string, userId: number) {
    const { error } = await this.supabase
      .from('health_metrics')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Health metric deleted successfully' };
  }

  async getMetricsByType(userId: string, metricType: string, query?: any) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID format');
    }

    let queryBuilder = this.supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', numericUserId)
      .eq('metric_type', metricType)
      .order('metric_date', { ascending: false });

    if (query?.start_date) {
      queryBuilder = queryBuilder.gte('metric_date', query.start_date);
    }
    if (query?.end_date) {
      queryBuilder = queryBuilder.lte('metric_date', query.end_date);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data;
  }

  async getHealthMetricsSummary(userId: string, startDate: string, endDate: string) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID format');
    }

    const { data, error } = await this.supabase
      .from('health_metrics')
      .select('metric_type, metric_value, metric_date')
      .eq('user_id', numericUserId)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (error) throw error;

    // Group by metric type and calculate summary
    const summary = data?.reduce((acc, metric) => {
      const type = metric.metric_type;
      if (!acc[type]) {
        acc[type] = { count: 0, total: 0, min: Infinity, max: -Infinity, dates: [] };
      }
      acc[type].count++;
      acc[type].total += metric.metric_value || 0;
      acc[type].min = Math.min(acc[type].min, metric.metric_value || 0);
      acc[type].max = Math.max(acc[type].max, metric.metric_value || 0);
      acc[type].dates.push(metric.metric_date);
      return acc;
    }, {} as Record<string, any>) || {};

    // Calculate averages
    Object.keys(summary).forEach(type => {
      summary[type].average = summary[type].total / summary[type].count;
    });

    return summary;
  }

  async getMetricTrends(userId: string, metricType: string, days: number = 30) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID format');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('health_metrics')
      .select('metric_value, metric_date')
      .eq('user_id', numericUserId)
      .eq('metric_type', metricType)
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .lte('metric_date', endDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: true });

    if (error) throw error;

    if (!data || data.length < 2) {
      return [];
    }

    // Calculate trends between consecutive measurements
    const trends: any[] = [];
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      const changePercentage = previous.metric_value !== 0 
        ? ((current.metric_value - previous.metric_value) / previous.metric_value) * 100 
        : 0;
      
      trends.push({
        metric_type: metricType as any,
        current_value: current.metric_value,
        previous_value: previous.metric_value,
        change_percentage: Math.round(changePercentage * 100) / 100,
        trend_direction: changePercentage > 0 ? 'increasing' : changePercentage < 0 ? 'decreasing' : 'stable',
        period_start: previous.metric_date,
        period_end: current.metric_date,
      });
    }

    return trends;
  }

  async getLatestMetric(userId: string, metricType: string) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID format');
    }

    const { data, error } = await this.supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', numericUserId)
      .eq('metric_type', metricType)
      .order('metric_date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  }

  async getMetricRanges(userId: string, metricType: string, days?: number) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID format');
    }

    let queryBuilder = this.supabase
      .from('health_metrics')
      .select('metric_value')
      .eq('user_id', numericUserId)
      .eq('metric_type', metricType);

    if (days) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      queryBuilder = queryBuilder
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .lte('metric_date', endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;

    if (!data || data.length === 0) {
      return { min: 0, max: 0, range: 0 };
    }

    const values = data.map(m => m.metric_value).filter(v => v !== null);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      min,
      max,
      range: max - min,
    };
  }

  async getHealthMetricsAnalysis(userId: string) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID format');
    }

    // Get all metrics for the user
    const { data, error } = await this.supabase
      .from('health_metrics')
      .select('metric_type, metric_value, metric_date')
      .eq('user_id', numericUserId)
      .order('metric_date', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { message: 'No health metrics found for analysis' };
    }

    // Basic analysis
    const analysis = {
      totalMetrics: data.length,
      metricTypes: Array.from(new Set(data.map(m => m.metric_type))),
      recentActivity: data.slice(0, 5).map(m => ({
        type: m.metric_type,
        value: m.metric_value,
        date: m.metric_date,
      })),
      recommendations: [] as string[],
    };

    // Add basic recommendations based on data
    if (data.length < 5) {
      analysis.recommendations.push('Consider logging more health metrics for better insights');
    }

    return analysis;
  }

  async createBulkHealthMetrics(metrics: any[]) {
    const { data, error } = await this.supabase
      .from('health_metrics')
      .insert(metrics)
      .select();

    if (error) throw error;
    return data;
  }

  async exportHealthMetrics(userId: string, format: string = 'json', query?: any) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID format');
    }

    let queryBuilder = this.supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', numericUserId)
      .order('metric_date', { ascending: false });

    if (query?.start_date) {
      queryBuilder = queryBuilder.gte('metric_date', query.start_date);
    }
    if (query?.end_date) {
      queryBuilder = queryBuilder.lte('metric_date', query.end_date);
    }
    if (query?.metric_type) {
      queryBuilder = queryBuilder.eq('metric_type', query.metric_type);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;

    if (format === 'csv') {
      // Convert to CSV format
      const csv = data?.map(metric => 
        `${metric.metric_type},${metric.metric_value},${metric.metric_date}`
      ).join('\n') || '';
      return csv;
    }

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

  async updateChatSession(sessionId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('chat_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateChatMessage(messageId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .update(updateData)
      .eq('id', messageId)
      .select()
      .single();

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

  async getUserPreference(userId: number) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // User Theme Management
  async getUserTheme(userId: number) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('theme')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.theme;
  }

  async updateUserTheme(userId: number, theme: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update({ theme })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // User Language Management
  async getUserLanguage(userId: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.language;
  }

  async updateUserLanguage(userId: string, language: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update({ language })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // User Measurement Unit Management
  async getUserMeasurementUnit(userId: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('measurement_unit')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.measurement_unit;
  }

  async updateUserMeasurementUnit(userId: string, measurementUnit: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update({ measurement_unit: measurementUnit })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // User Privacy Settings Management
  async getUserPrivacySettings(userId: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('privacy_settings')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.privacy_settings;
  }

  async updateUserPrivacySettings(userId: string, privacySettings: any) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update({ privacy_settings: privacySettings })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // User Notification Preferences Management
  async getUserNotificationPreferences(userId: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('notification_preferences')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.notification_preferences;
  }

  async updateUserNotificationPreferences(userId: string, notificationPreferences: any) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update({ notification_preferences: notificationPreferences })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // User Health Focus Areas Management
  async getUserHealthFocusAreas(userId: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('health_focus_areas')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.health_focus_areas;
  }

  async updateUserHealthFocusAreas(userId: string, healthFocusAreas: any) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update({ health_focus_areas: healthFocusAreas })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // User Custom Goals Management
  async getUserCustomGoals(userId: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('custom_goals')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.custom_goals;
  }

  async updateUserCustomGoals(userId: string, customGoals: any) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update({ custom_goals: customGoals })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // User Timezone Management
  async getUserTimezone(userId: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('timezone')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.timezone;
  }

  async updateUserTimezone(userId: string, timezone: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update({ timezone })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // User Quiet Hours Management
  async getUserQuietHours(userId: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('quiet_hours')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.quiet_hours;
  }

  async updateUserQuietHours(userId: string, startTime: string, endTime: string) {
    const quietHours = { start: startTime, end: endTime };
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update({ quiet_hours: quietHours })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Reset User Preferences to Defaults
  async resetUserPreferencesToDefaults(userId: string) {
    const defaultPreferences = {
      theme: 'light',
      language: 'en',
      measurement_unit: 'metric',
      privacy_settings: { profile_visibility: 'public', data_sharing: false },
      notification_preferences: { email: true, push: true, sms: false },
      health_focus_areas: ['general_health'],
      custom_goals: [],
      timezone: 'UTC',
      quiet_hours: { start: '22:00', end: '08:00' }
    };

    const { data, error } = await this.supabase
      .from('user_preferences')
      .update(defaultPreferences)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Export User Preferences
  async exportUserPreferences(userId: string) {
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

  async deleteUserPreference(userId: number) {
    const { error } = await this.supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'User preference deleted successfully' };
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

  async getWeeklyHealthSummary(
    userId: number,
    startDate: string,
    endDate: string,
  ) {
    const { data, error } = await this.supabase
      .from('daily_health_summary')
      .select('*')
      .eq('user_id', userId)
      .gte('summary_date', startDate)
      .lte('summary_date', endDate)
      .order('summary_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getDailyHealthSummaryByDate(userId: number, date: string) {
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

  async getFoodLogsByUserId(userId: number) {
    const { data, error } = await this.supabase
      .from('food_log')
      .select('*')
      .eq('user_id', userId)
      .order('consumed_at', { ascending: false });

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

  async getExerciseLogsByUserId(userId: number) {
    const { data, error } = await this.supabase
      .from('exercise_log')
      .select('*')
      .eq('user_id', userId)
      .order('exercise_date', { ascending: false });

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
