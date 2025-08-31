import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { AIService } from '../services/ai.service';
import { ChatService } from '../services/chat.service';
import { SupabaseService } from '../services/supabase.service';
import { ResponseDto } from '../dto/common.dto';

@Controller('ai')
@UseGuards(AuthGuard)
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly chatService: ChatService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // ==================== AI DATA ACCESS ENDPOINTS ====================

  @Get('user-profile/:user_id')
  async getUserProfile(
    @Param('user_id') userId: string,
    @CurrentUser('id') currentUserId: number,
  ): Promise<ResponseDto<any>> {
    try {
      // ตรวจสอบสิทธิ์การเข้าถึง
      if (parseInt(userId) !== currentUserId) {
        return ResponseDto.error('Unauthorized access to user profile');
      }

      const userData = await this.supabaseService.getUserById(parseInt(userId));
      const healthGoals = await this.supabaseService.getHealthGoalsByUserId(parseInt(userId));
      const userPreferences = await this.supabaseService.getUserPreferencesByUserId(parseInt(userId));

      const profile = {
        user: userData,
        health_goals: healthGoals,
        preferences: userPreferences,
      };

      return ResponseDto.success(profile, 'User profile retrieved successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to retrieve user profile: ${error.message}`);
    }
  }

  @Get('health-summary/:user_id')
  async getHealthSummary(
    @Param('user_id') userId: string,
    @CurrentUser('id') currentUserId: number,
    @Query('date') date?: string,
  ): Promise<ResponseDto<any>> {
    try {
      if (parseInt(userId) !== currentUserId) {
        return ResponseDto.error('Unauthorized access to health summary');
      }

      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const [dailySummary, healthMetrics, recentFoodLogs, recentExerciseLogs] = await Promise.all([
        this.supabaseService.getDailyHealthSummary(parseInt(userId), targetDate),
        this.supabaseService.getHealthMetricsByUserId(parseInt(userId)),
        this.supabaseService.getFoodLogs(parseInt(userId), { date_from: targetDate, date_to: targetDate }),
        this.supabaseService.getExerciseLogs(parseInt(userId), { exercise_date_from: targetDate, exercise_date_to: targetDate }),
      ]);

      const summary = {
        date: targetDate,
        daily_summary: dailySummary,
        health_metrics: healthMetrics,
        food_logs: recentFoodLogs,
        exercise_logs: recentExerciseLogs,
      };

      return ResponseDto.success(summary, 'Health summary retrieved successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to retrieve health summary: ${error.message}`);
    }
  }

  @Get('food-analysis/:user_id')
  async getFoodAnalysis(
    @Param('user_id') userId: string,
    @CurrentUser('id') currentUserId: number,
    @Query('date') date?: string,
  ): Promise<ResponseDto<any>> {
    try {
      if (parseInt(userId) !== currentUserId) {
        return ResponseDto.error('Unauthorized access to food analysis');
      }

      const analysis = await this.aiService.analyzeNutrition(parseInt(userId), date);
      const recommendations = await this.aiService.getFoodRecommendations(parseInt(userId));

      const result = {
        analysis,
        recommendations,
        timestamp: new Date().toISOString(),
      };

      return ResponseDto.success(result, 'Food analysis completed successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to analyze food data: ${error.message}`);
    }
  }

  @Get('exercise-analysis/:user_id')
  async getExerciseAnalysis(
    @Param('user_id') userId: string,
    @CurrentUser('id') currentUserId: number,
    @Query('date') date?: string,
  ): Promise<ResponseDto<any>> {
    try {
      if (parseInt(userId) !== currentUserId) {
        return ResponseDto.error('Unauthorized access to exercise analysis');
      }

      const analysis = await this.aiService.analyzeExercise(parseInt(userId), date);
      const recommendations = await this.aiService.getExerciseRecommendations(parseInt(userId));

      const result = {
        analysis,
        recommendations,
        timestamp: new Date().toISOString(),
      };

      return ResponseDto.success(result, 'Exercise analysis completed successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to analyze exercise data: ${error.message}`);
    }
  }

  @Get('sleep-analysis/:user_id')
  async getSleepAnalysis(
    @Param('user_id') userId: string,
    @CurrentUser('id') currentUserId: number,
    @Query('date') date?: string,
  ): Promise<ResponseDto<any>> {
    try {
      if (parseInt(userId) !== currentUserId) {
        return ResponseDto.error('Unauthorized access to sleep analysis');
      }

      const targetDate = date || new Date().toISOString().split('T')[0];
      const sleepLogs = await this.supabaseService.getSleepLogsByUserId(parseInt(userId));
      
      // วิเคราะห์ข้อมูลการนอน
      const analysis = {
        total_sleep_hours: 0,
        average_sleep_quality: 0,
        sleep_pattern: {},
        recommendations: [] as string[],
        insights: [] as string[],
      };

      if (sleepLogs.length > 0) {
        const recentSleepLogs = sleepLogs.filter(log => 
          new Date(log.sleep_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );

        if (recentSleepLogs.length > 0) {
          analysis.total_sleep_hours = recentSleepLogs.reduce((sum, log) => 
            sum + (log.total_sleep_hours || 0), 0
          ) / recentSleepLogs.length;

          analysis.average_sleep_quality = recentSleepLogs.reduce((sum, log) => 
            sum + (log.sleep_quality || 0), 0
          ) / recentSleepLogs.length;

          // สร้างคำแนะนำ
          if (analysis.total_sleep_hours < 7) {
            analysis.recommendations.push('ควรนอนให้ได้ 7-9 ชั่วโมงต่อคืน');
          }
          if (analysis.average_sleep_quality < 7) {
            analysis.recommendations.push('ควรปรับปรุงคุณภาพการนอน');
          }

          analysis.insights.push(`นอนเฉลี่ย ${analysis.total_sleep_hours.toFixed(1)} ชั่วโมงต่อคืน`);
          analysis.insights.push(`คุณภาพการนอนเฉลี่ย ${analysis.average_sleep_quality.toFixed(1)}/10`);
        }
      }

      return ResponseDto.success(analysis, 'Sleep analysis completed successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to analyze sleep data: ${error.message}`);
    }
  }

  @Get('goals-progress/:user_id')
  async getGoalsProgress(
    @Param('user_id') userId: string,
    @CurrentUser('id') currentUserId: number,
  ): Promise<ResponseDto<any>> {
    try {
      if (parseInt(userId) !== currentUserId) {
        return ResponseDto.error('Unauthorized access to goals progress');
      }

      const healthGoals = await this.supabaseService.getHealthGoalsByUserId(parseInt(userId));
      
      const progress = healthGoals.map(goal => {
        const progressPercentage = goal.target_value > 0 
          ? Math.round((goal.current_value / goal.target_value) * 100)
          : 0;

        return {
          id: goal.id,
          title: goal.title,
          goal_type: goal.goal_type,
          target_value: goal.target_value,
          current_value: goal.current_value,
          unit: goal.unit,
          progress_percentage: progressPercentage,
          status: goal.status,
          priority: goal.priority,
          start_date: goal.start_date,
          target_date: goal.target_date,
        };
      });

      return ResponseDto.success(progress, 'Goals progress retrieved successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to retrieve goals progress: ${error.message}`);
    }
  }

  @Get('health-trends/:user_id')
  async getHealthTrends(
    @Param('user_id') userId: string,
    @CurrentUser('id') currentUserId: number,
    @Query('days') days: number = 30,
  ): Promise<ResponseDto<any>> {
    try {
      if (parseInt(userId) !== currentUserId) {
        return ResponseDto.error('Unauthorized access to health trends');
      }

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const [foodLogs, exerciseLogs, sleepLogs, waterLogs] = await Promise.all([
        this.supabaseService.getFoodLogs(parseInt(userId), { 
          date_from: startDate.toISOString().split('T')[0],
          date_to: endDate.toISOString().split('T')[0]
        }),
        this.supabaseService.getExerciseLogs(parseInt(userId), {
          exercise_date_from: startDate.toISOString().split('T')[0],
          exercise_date_to: endDate.toISOString().split('T')[0]
        }),
        this.supabaseService.getSleepLogsByUserId(parseInt(userId)),
        this.supabaseService.getWaterLogsByUserId(parseInt(userId)),
      ]);

      // วิเคราะห์แนวโน้ม
      const trends = {
        period: `${days} days`,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        nutrition_trend: this.analyzeNutritionTrend(foodLogs, days),
        exercise_trend: this.analyzeExerciseTrend(exerciseLogs, days),
        sleep_trend: this.analyzeSleepTrend(sleepLogs, days),
        water_trend: this.analyzeWaterTrend(waterLogs, days),
        overall_health_score: this.calculateOverallHealthScore(foodLogs, exerciseLogs, sleepLogs, waterLogs),
      };

      return ResponseDto.success(trends, 'Health trends analyzed successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to analyze health trends: ${error.message}`);
    }
  }

  // ==================== AI CHAT ENDPOINTS ====================

  @Post('chat/start')
  @HttpCode(HttpStatus.CREATED)
  async startChatSession(
    @Body() body: { title?: string; initial_message?: string },
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      // สร้างเซสชันแชทใหม่ (พร้อมหัวข้ออัตโนมัติถ้ามีข้อความเริ่มต้น)
      const session = await this.chatService.createChatSession(userId, body.title, body.initial_message);
      
      // ถ้ามีข้อความเริ่มต้น ให้ส่งข้อความทันที
      let response = { session };
      
      if (body.initial_message) {
        const messageResult = await this.chatService.sendMessage(
          session.id,
          userId,
          body.initial_message
        );
        response = { ...response, ...messageResult };
      }
      
      return ResponseDto.success(response, 'Chat session started successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to start chat session: ${error.message}`);
    }
  }

  @Post('chat/message')
  async sendChatMessage(
    @Body() body: { session_id: number; message: string },
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      const response = await this.chatService.sendMessage(
        body.session_id,
        userId,
        body.message,
      );
      return ResponseDto.success(response, 'Message sent successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to send message: ${error.message}`);
    }
  }

  @Get('chat/history/:session_id')
  async getChatHistory(
    @Param('session_id') sessionId: string,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      const messages = await this.chatService.getChatMessages(parseInt(sessionId));
      return ResponseDto.success(messages, 'Chat history retrieved successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to retrieve chat history: ${error.message}`);
    }
  }

  @Post('chat/feedback')
  async submitChatFeedback(
    @Body() body: { message_id: number; rating: number; feedback?: string },
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      await this.chatService.rateAIResponse(
        body.message_id,
        body.rating,
        body.feedback,
      );
      return ResponseDto.success({}, 'Feedback submitted successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to submit feedback: ${error.message}`);
    }
  }

  // ==================== AI INSIGHTS ENDPOINTS ====================

  @Post('analyze')
  async analyzeHealthData(
    @Body() body: { focus_area?: string; time_period?: string },
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      const analysis = await this.aiService.analyzeUserHealth(userId);
      const recommendations = await this.aiService.generateAIRecommendations(userId);

      const result = {
        health_analysis: analysis,
        ai_recommendations: recommendations,
        focus_area: body.focus_area || 'overall',
        time_period: body.time_period || 'current',
        timestamp: new Date().toISOString(),
      };

      return ResponseDto.success(result, 'Health data analysis completed successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to analyze health data: ${error.message}`);
    }
  }

  @Get('recommendations/:user_id')
  async getAIRecommendations(
    @Param('user_id') userId: string,
    @CurrentUser('id') currentUserId: number,
  ): Promise<ResponseDto<any>> {
    try {
      if (parseInt(userId) !== currentUserId) {
        return ResponseDto.error('Unauthorized access to recommendations');
      }

      const recommendations = await this.aiService.generateAIRecommendations(parseInt(userId));
      return ResponseDto.success(recommendations, 'AI recommendations retrieved successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to retrieve AI recommendations: ${error.message}`);
    }
  }

  @Post('insights/save')
  @HttpCode(HttpStatus.CREATED)
  async saveAIInsight(
    @Body() insightData: {
      type: string;
      title: string;
      description: string;
      confidence?: number;
      data_sources?: string[];
      actionable_items?: string[];
    },
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      const insight = await this.aiService.saveAIInsight(userId, insightData);
      return ResponseDto.success(insight, 'AI insight saved successfully');
    } catch (error) {
      return ResponseDto.error(`Failed to save AI insight: ${error.message}`);
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private analyzeNutritionTrend(foodLogs: any[], days: number): any {
    if (foodLogs.length === 0) return { trend: 'no_data', message: 'No nutrition data available' };

    const dailyCalories = this.groupByDate(foodLogs, 'consumed_at', 'calories');
    const avgCalories = this.calculateAverage(dailyCalories);
    
    return {
      trend: this.determineTrend(dailyCalories),
      average_calories: avgCalories,
      data_points: dailyCalories.length,
      message: `Average daily calories: ${avgCalories.toFixed(0)}`,
    };
  }

  private analyzeExerciseTrend(exerciseLogs: any[], days: number): any {
    if (exerciseLogs.length === 0) return { trend: 'no_data', message: 'No exercise data available' };

    const dailyDuration = this.groupByDate(exerciseLogs, 'exercise_date', 'duration_minutes');
    const avgDuration = this.calculateAverage(dailyDuration);
    
    return {
      trend: this.determineTrend(dailyDuration),
      average_duration: avgDuration,
      data_points: dailyDuration.length,
      message: `Average daily exercise duration: ${avgDuration.toFixed(0)} minutes`,
    };
  }

  private analyzeSleepTrend(sleepLogs: any[], days: number): any {
    if (sleepLogs.length === 0) return { trend: 'no_data', message: 'No sleep data available' };

    const dailySleep = this.groupByDate(sleepLogs, 'sleep_date', 'total_sleep_hours');
    const avgSleep = this.calculateAverage(dailySleep);
    
    return {
      trend: this.determineTrend(dailySleep),
      average_sleep_hours: avgSleep,
      data_points: dailySleep.length,
      message: `Average daily sleep: ${avgSleep.toFixed(1)} hours`,
    };
  }

  private analyzeWaterTrend(waterLogs: any[], days: number): any {
    if (waterLogs.length === 0) return { trend: 'no_data', message: 'No water intake data available' };

    const dailyWater = this.groupByDate(waterLogs, 'consumed_at', 'amount_ml');
    const avgWater = this.calculateAverage(dailyWater);
    
    return {
      trend: this.determineTrend(dailyWater),
      average_water_ml: avgWater,
      data_points: dailyWater.length,
      message: `Average daily water intake: ${(avgWater / 1000).toFixed(1)} liters`,
    };
  }

  private calculateOverallHealthScore(foodLogs: any[], exerciseLogs: any[], sleepLogs: any[], waterLogs: any[]): number {
    let score = 0;
    let factors = 0;

    if (foodLogs.length > 0) {
      score += 25;
      factors++;
    }
    if (exerciseLogs.length > 0) {
      score += 25;
      factors++;
    }
    if (sleepLogs.length > 0) {
      score += 25;
      factors++;
    }
    if (waterLogs.length > 0) {
      score += 25;
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  }

  private groupByDate(logs: any[], dateField: string, valueField: string): number[] {
    const dailyValues: { [key: string]: number } = {};
    
    logs.forEach(log => {
      const date = log[dateField]?.split('T')[0] || log[dateField];
      if (date && log[valueField]) {
        if (!dailyValues[date]) {
          dailyValues[date] = 0;
        }
        dailyValues[date] += log[valueField] || 0;
      }
    });

    return Object.values(dailyValues);
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private determineTrend(values: number[]): string {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.ceil(values.length / 2));
    const secondHalf = values.slice(Math.ceil(values.length / 2));
    
    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 10) return 'improving';
    if (change < -10) return 'declining';
    return 'stable';
  }
}
