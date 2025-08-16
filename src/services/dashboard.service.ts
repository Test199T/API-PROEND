import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { AIService } from './ai.service';

export interface DailyHealthSummary {
  date: string;
  totalCalories: number;
  totalCaloriesBurned: number;
  totalWater: number;
  sleepHours: number;
  sleepQuality: number;
  exerciseMinutes: number;
  nutritionScore: number;
  exerciseScore: number;
  sleepScore: number;
  waterScore: number;
  overallScore: number;
}

export interface WeeklyHealthTrend {
  weekStart: string;
  weekEnd: string;
  averageCalories: number;
  averageCaloriesBurned: number;
  averageSleepHours: number;
  averageSleepQuality: number;
  averageExerciseMinutes: number;
  averageWaterIntake: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface HealthMetrics {
  currentWeight: number;
  currentBMI: number;
  weightChange: number;
  bmiChange: number;
  bodyFatPercentage: number;
  muscleMass: number;
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
}

@Injectable()
export class DashboardService {
  constructor(
    private supabaseService: SupabaseService,
    private aiService: AIService,
  ) {}

  // ดึงข้อมูลสรุปสุขภาพประจำวัน
  async getDailyHealthSummary(
    userId: number,
    date: string,
  ): Promise<DailyHealthSummary> {
    try {
      const userData = await this.supabaseService.getUserById(userId);
      const foodLogs = await this.supabaseService.getFoodLogsByUserId(
        userId,
        date,
      );
      const exerciseLogs = await this.supabaseService.getExerciseLogsByUserId(
        userId,
        date,
      );
      const sleepLogs = await this.supabaseService.getSleepLogsByUserId(
        userId,
        date,
      );
      const waterLogs = await this.supabaseService.getWaterLogsByUserId(
        userId,
        date,
      );

      // คำนวณข้อมูลสรุป
      const totalCalories = foodLogs.reduce(
        (sum, food) => sum + (food.calories || 0),
        0,
      );
      const totalCaloriesBurned = exerciseLogs.reduce(
        (sum, exercise) => sum + (exercise.calories_burned || 0),
        0,
      );
      const totalWater = waterLogs.reduce(
        (sum, water) => sum + (water.amount_ml || 0),
        0,
      );
      const exerciseMinutes = exerciseLogs.reduce(
        (sum, exercise) => sum + (exercise.duration_minutes || 0),
        0,
      );

      // ข้อมูลการนอน
      const todaySleep = sleepLogs.find((sleep) => sleep.sleep_date === date);
      const sleepHours = todaySleep?.total_sleep_hours || 0;
      const sleepQuality = todaySleep?.sleep_quality || 0;

      // คำนวณคะแนนจาก AI
      const healthAnalysis = await this.aiService.analyzeUserHealth(userId);

      return {
        date,
        totalCalories,
        totalCaloriesBurned,
        totalWater,
        sleepHours,
        sleepQuality,
        exerciseMinutes,
        nutritionScore: healthAnalysis.nutritionScore,
        exerciseScore: healthAnalysis.exerciseScore,
        sleepScore: healthAnalysis.sleepScore,
        waterScore: healthAnalysis.waterScore,
        overallScore: healthAnalysis.overallScore,
      };
    } catch (error) {
      throw new Error(`Failed to get daily health summary: ${error.message}`);
    }
  }

  // ดึงข้อมูลแนวโน้มสุขภาพรายสัปดาห์
  async getWeeklyHealthTrend(
    userId: number,
    weekStart: string,
  ): Promise<WeeklyHealthTrend> {
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      const weeklyData = [];
      const currentDate = new Date(weekStart);

      // รวบรวมข้อมูลรายวันในสัปดาห์
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dailySummary = await this.getDailyHealthSummary(userId, dateStr);
        weeklyData.push(dailySummary);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // คำนวณค่าเฉลี่ย
      const averageCalories = Math.round(
        weeklyData.reduce((sum, day) => sum + day.totalCalories, 0) / 7,
      );
      const averageCaloriesBurned = Math.round(
        weeklyData.reduce((sum, day) => sum + day.totalCaloriesBurned, 0) / 7,
      );
      const averageSleepHours =
        Math.round(
          (weeklyData.reduce((sum, day) => sum + day.sleepHours, 0) / 7) * 10,
        ) / 10;
      const averageSleepQuality = Math.round(
        weeklyData.reduce((sum, day) => sum + day.sleepQuality, 0) / 7,
      );
      const averageExerciseMinutes = Math.round(
        weeklyData.reduce((sum, day) => sum + day.exerciseMinutes, 0) / 7,
      );
      const averageWaterIntake = Math.round(
        weeklyData.reduce((sum, day) => sum + day.totalWater, 0) / 7,
      );

      // วิเคราะห์แนวโน้ม
      const trend = this.analyzeTrend(weeklyData);

      return {
        weekStart,
        weekEnd: weekEndStr,
        averageCalories,
        averageCaloriesBurned,
        averageSleepHours,
        averageSleepQuality,
        averageExerciseMinutes,
        averageWaterIntake,
        trend,
      };
    } catch (error) {
      throw new Error(`Failed to get weekly health trend: ${error.message}`);
    }
  }

  // ดึงข้อมูลเมตริกสุขภาพ
  async getHealthMetrics(userId: number): Promise<HealthMetrics> {
    try {
      const userData = await this.supabaseService.getUserById(userId);
      const healthMetrics =
        await this.supabaseService.getHealthMetricsByUserId(userId);

      // ข้อมูลปัจจุบัน
      const currentWeight = userData.weight_kg || 0;
      const currentBMI = userData.bmi || 0;

      // ข้อมูลล่าสุดจาก health_metrics
      const latestMetrics = healthMetrics[0] || {};
      const bodyFatPercentage = latestMetrics.body_fat_percentage || 0;
      const muscleMass = latestMetrics.muscle_mass_kg || 0;
      const heartRate = latestMetrics.heart_rate || 0;
      const bloodPressure = {
        systolic: latestMetrics.blood_pressure_systolic || 0,
        diastolic: latestMetrics.blood_pressure_diastolic || 0,
      };

      // คำนวณการเปลี่ยนแปลง (ถ้ามีข้อมูลเก่า)
      let weightChange = 0;
      let bmiChange = 0;

      if (healthMetrics.length > 1) {
        const previousMetrics = healthMetrics[1];
        weightChange =
          currentWeight - (previousMetrics.weight_kg || currentWeight);
        bmiChange = currentBMI - (previousMetrics.bmi || currentBMI);
      }

      return {
        currentWeight,
        currentBMI,
        weightChange,
        bmiChange,
        bodyFatPercentage,
        muscleMass,
        heartRate,
        bloodPressure,
      };
    } catch (error) {
      throw new Error(`Failed to get health metrics: ${error.message}`);
    }
  }

  // ดึงข้อมูลเป้าหมายสุขภาพและความคืบหน้า
  async getHealthGoalsProgress(userId: number) {
    try {
      const healthGoals =
        await this.supabaseService.getHealthGoalsByUserId(userId);
      const activeGoals = healthGoals.filter(
        (goal) => goal.status === 'active',
      );

      return activeGoals.map((goal) => {
        const progressPercentage =
          goal.target_value > 0
            ? Math.round(((goal.current_value || 0) / goal.target_value) * 100)
            : 0;

        return {
          id: goal.id,
          title: goal.title,
          goalType: goal.goal_type,
          targetValue: goal.target_value,
          currentValue: goal.current_value || 0,
          unit: goal.unit,
          startDate: goal.start_date,
          targetDate: goal.target_date,
          priority: goal.priority,
          progressPercentage,
          status: goal.status,
          daysRemaining: this.calculateDaysRemaining(goal.target_date),
        };
      });
    } catch (error) {
      throw new Error(`Failed to get health goals progress: ${error.message}`);
    }
  }

  // ดึงข้อมูลสถิติการใช้งาน
  async getUsageStatistics(userId: number, days: number = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = {
        totalFoodLogs: 0,
        totalExerciseLogs: 0,
        totalSleepLogs: 0,
        totalWaterLogs: 0,
        averageCaloriesPerDay: 0,
        averageExerciseMinutesPerDay: 0,
        averageSleepHoursPerDay: 0,
        averageWaterIntakePerDay: 0,
        streakDays: 0,
        mostActiveDay: '',
        leastActiveDay: '',
      };

      // รวบรวมข้อมูลรายวัน
      const dailyStats = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dailySummary = await this.getDailyHealthSummary(userId, dateStr);
        dailyStats.push(dailySummary);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // คำนวณสถิติ
      stats.totalFoodLogs = dailyStats.filter(
        (day) => day.totalCalories > 0,
      ).length;
      stats.totalExerciseLogs = dailyStats.filter(
        (day) => day.exerciseMinutes > 0,
      ).length;
      stats.totalSleepLogs = dailyStats.filter(
        (day) => day.sleepHours > 0,
      ).length;
      stats.totalWaterLogs = dailyStats.filter(
        (day) => day.totalWater > 0,
      ).length;

      stats.averageCaloriesPerDay = Math.round(
        dailyStats.reduce((sum, day) => sum + day.totalCalories, 0) /
          dailyStats.length,
      );
      stats.averageExerciseMinutesPerDay = Math.round(
        dailyStats.reduce((sum, day) => sum + day.exerciseMinutes, 0) /
          dailyStats.length,
      );
      stats.averageSleepHoursPerDay =
        Math.round(
          (dailyStats.reduce((sum, day) => sum + day.sleepHours, 0) /
            dailyStats.length) *
            10,
        ) / 10;
      stats.averageWaterIntakePerDay = Math.round(
        dailyStats.reduce((sum, day) => sum + day.totalWater, 0) /
          dailyStats.length,
      );

      // คำนวณ streak
      stats.streakDays = this.calculateStreakDays(dailyStats);

      // หาวันที่กระฉับกระเฉงที่สุดและน้อยที่สุด
      const exerciseDays = dailyStats.filter((day) => day.exerciseMinutes > 0);
      if (exerciseDays.length > 0) {
        const maxExercise = Math.max(
          ...exerciseDays.map((day) => day.exerciseMinutes),
        );
        const minExercise = Math.min(
          ...exerciseDays.map((day) => day.exerciseMinutes),
        );

        stats.mostActiveDay =
          exerciseDays.find((day) => day.exerciseMinutes === maxExercise)
            ?.date || '';
        stats.leastActiveDay =
          exerciseDays.find((day) => day.exerciseMinutes === minExercise)
            ?.date || '';
      }

      return stats;
    } catch (error) {
      throw new Error(`Failed to get usage statistics: ${error.message}`);
    }
  }

  // ดึงข้อมูลการแจ้งเตือนที่ยังไม่ได้อ่าน
  async getUnreadNotifications(userId: number) {
    try {
      const notifications =
        await this.supabaseService.getNotificationsByUserId(userId);
      return notifications.filter((notification) => !notification.is_read);
    } catch (error) {
      throw new Error(`Failed to get unread notifications: ${error.message}`);
    }
  }

  // ดึงข้อมูลเชิงลึกจาก AI
  async getAIInsights(userId: number) {
    try {
      const insights = await this.supabaseService.getAIInsightsByUserId(userId);
      const recommendations =
        await this.aiService.generateAIRecommendations(userId);

      return {
        insights: insights.slice(0, 5), // แสดง 5 ข้อล่าสุด
        recommendations: recommendations.slice(0, 3), // แสดง 3 คำแนะนำสำคัญ
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get AI insights: ${error.message}`);
    }
  }

  // Private helper methods
  private analyzeTrend(
    weeklyData: DailyHealthSummary[],
  ): 'improving' | 'declining' | 'stable' {
    if (weeklyData.length < 2) return 'stable';

    const firstHalf = weeklyData.slice(0, 3);
    const secondHalf = weeklyData.slice(4, 7);

    const firstHalfAvg =
      firstHalf.reduce((sum, day) => sum + day.overallScore, 0) /
      firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, day) => sum + day.overallScore, 0) /
      secondHalf.length;

    const difference = secondHalfAvg - firstHalfAvg;

    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  private calculateDaysRemaining(targetDate: string): number {
    if (!targetDate) return 0;

    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  private calculateStreakDays(dailyStats: DailyHealthSummary[]): number {
    let streak = 0;

    for (let i = dailyStats.length - 1; i >= 0; i--) {
      const day = dailyStats[i];
      if (day.exerciseMinutes > 0 || day.totalCalories > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
