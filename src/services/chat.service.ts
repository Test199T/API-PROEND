import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { OpenRouterService } from './openrouter.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly openRouterService: OpenRouterService,
  ) {}

  /**
   * สร้างหัวข้อเซสชันแชทอัตโนมัติด้วย AI
   */
  private async generateAutomaticTitle(
    userMessage: string,
    userData?: any,
  ): Promise<string> {
    try {
      const prompt = `คุณเป็นผู้ช่วยด้านสุขภาพที่เก่งในการสรุปหัวข้อการสนทนา

ข้อความของผู้ใช้: "${userMessage}"

กรุณาสรุปหัวข้อการสนทนาที่สั้น กระชับ และสื่อความหมายในภาษาไทย โดย:
1. ใช้คำที่เข้าใจง่าย
2. สื่อถึงประเด็นหลักที่ผู้ใช้สนใจ
3. ไม่เกิน 15 คำ
4. ใช้ภาษาที่เป็นมิตร

ตัวอย่างหัวข้อที่ดี:
- "คำแนะนำการออกกำลังกาย"
- "ปรึกษาปัญหาการนอน"
- "วางแผนโภชนาการ"
- "ติดตามน้ำหนักและสุขภาพ"

หัวข้อที่เหมาะสม:`;

      const title = await this.openRouterService.generateText(prompt, 0.3, 50);

      // ทำความสะอาดข้อความที่ได้จาก AI
      const cleanTitle = title
        .replace(/["""]/g, '') // ลบเครื่องหมายคำพูด
        .replace(/^\s+|\s+$/g, '') // ลบช่องว่างหน้า-หลัง
        .replace(/\n/g, ' ') // แทนที่ขึ้นบรรทัดใหม่ด้วยช่องว่าง
        .trim();

      return cleanTitle || 'แชทสุขภาพ';
    } catch (error) {
      this.logger.warn(`Failed to generate automatic title: ${error.message}`);
      return this.generateFallbackTitle(userMessage);
    }
  }

  /**
   * สร้างหัวข้อแบบ fallback เมื่อ AI ไม่สามารถทำงานได้
   */
  private generateFallbackTitle(userMessage: string): string {
    const message = userMessage.toLowerCase();

    // ตรวจสอบคำสำคัญในข้อความ
    if (
      message.includes('อาหาร') ||
      message.includes('กิน') ||
      message.includes('โภชนาการ') ||
      message.includes('แคลอรี่')
    ) {
      return 'ปรึกษาปัญหาด้านโภชนาการ';
    }
    if (
      message.includes('ออกกำลังกาย') ||
      message.includes('ฟิตเนส') ||
      message.includes('กีฬา')
    ) {
      return 'คำแนะนำการออกกำลังกาย';
    }
    if (
      message.includes('นอน') ||
      message.includes('พักผ่อน') ||
      message.includes('นอนไม่หลับ')
    ) {
      return 'ปรึกษาปัญหาการนอน';
    }
    if (
      message.includes('น้ำหนัก') ||
      message.includes('ลดน้ำหนัก') ||
      message.includes('เพิ่มน้ำหนัก')
    ) {
      return 'ติดตามน้ำหนักและสุขภาพ';
    }
    if (
      message.includes('สุขภาพ') ||
      message.includes('ตรวจ') ||
      message.includes('อาการ')
    ) {
      return 'ปรึกษาปัญหาสุขภาพทั่วไป';
    }

    return `แชทสุขภาพ ${new Date().toLocaleDateString('th-TH')}`;
  }

  /**
   * อัพเดทหัวข้อเซสชันแชทตามเนื้อหาการสนทนา
   */
  async updateSessionTitle(sessionId: number, newTitle: string): Promise<any> {
    try {
      const result = await this.supabaseService.updateChatSession(sessionId, {
        session_title: newTitle,
        updated_at: new Date().toISOString(),
      });

      this.logger.log(`Session ${sessionId} title updated to: ${newTitle}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update session title for ${sessionId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * สร้างเซสชันแชทใหม่
   */
  async createChatSession(
    userId: number,
    sessionTitle?: string,
    initialMessage?: string,
  ): Promise<any> {
    try {
      let finalTitle = sessionTitle;

      // ถ้าไม่มีหัวข้อและมีข้อความเริ่มต้น ให้สร้างหัวข้ออัตโนมัติ
      if (!finalTitle && initialMessage) {
        const userData = await this.supabaseService.getUserById(userId);
        finalTitle = await this.generateAutomaticTitle(
          initialMessage,
          userData,
        );
      } else if (!finalTitle) {
        finalTitle = `แชทสุขภาพ ${new Date().toLocaleDateString('th-TH')}`;
      }

      const session = {
        user_id: userId,
        session_title: finalTitle,
        ai_model: 'OpenRouter AI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      const result = await this.supabaseService.createChatSession(session);
      this.logger.log(
        `Chat session created for user ${userId}: ${result.id} with title: ${finalTitle}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create chat session for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * ดึงเซสชันแชทของผู้ใช้
   */
  async getChatSessions(userId: number): Promise<any[]> {
    try {
      return await this.supabaseService.getChatSessionsByUserId(userId);
    } catch (error) {
      this.logger.error(
        `Failed to get chat sessions for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * ดึงข้อความในแชท
   */
  async getChatMessages(sessionId: number): Promise<any[]> {
    try {
      return await this.supabaseService.getChatMessagesBySessionId(sessionId);
    } catch (error) {
      this.logger.error(
        `Failed to get chat messages for session ${sessionId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * ส่งข้อความและรับการตอบกลับจาก AI
   */
  async sendMessage(
    sessionId: number,
    userId: number,
    messageText: string,
  ): Promise<any> {
    try {
      // บันทึกข้อความของผู้ใช้
      const userMessage = {
        session_id: sessionId,
        user_id: userId,
        message_text: messageText,
        is_user_message: true,
        timestamp: new Date().toISOString(),
        message_type: 'text',
      };

      const savedUserMessage =
        await this.supabaseService.createChatMessage(userMessage);

      // ดึงข้อมูลผู้ใช้, ประวัติการแชท, และข้อมูลกิจกรรมล่าสุด
      const [userData, chatHistory, recentActivities] = await Promise.all([
        this.supabaseService.getUserById(userId),
        this.getChatMessages(sessionId),
        this.getRecentUserActivities(userId),
      ]);

      // ใช้ OpenRouter AI ตอบกลับ
      let aiResponse: string;
      try {
        aiResponse = await this.openRouterService.respondToChat(
          userData,
          messageText,
          chatHistory,
          recentActivities,
        );
      } catch (aiError) {
        this.logger.warn(
          `AI response failed, using fallback: ${aiError.message}`,
        );
        aiResponse = this.getFallbackResponse(messageText);
      }

      // บันทึกการตอบกลับของ AI
      const aiMessage = {
        session_id: sessionId,
        user_id: userId,
        message_text: aiResponse,
        is_user_message: false,
        timestamp: new Date().toISOString(),
        message_type: 'text',
        ai_response_quality: 4, // Default quality score
      };

      const savedAiMessage =
        await this.supabaseService.createChatMessage(aiMessage);

      // อัพเดทเซสชัน
      await this.supabaseService.updateChatSession(sessionId, {
        updated_at: new Date().toISOString(),
      });

      return {
        userMessage: savedUserMessage,
        aiMessage: savedAiMessage,
        sessionId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send message in session ${sessionId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * ให้คะแนนการตอบกลับของ AI
   */
  async rateAIResponse(
    messageId: number,
    rating: number,
    feedback?: string,
  ): Promise<any> {
    try {
      const updateData: any = {
        ai_response_quality: rating,
      };

      if (feedback) {
        updateData.user_feedback = feedback;
      }

      const result = await this.supabaseService.updateChatMessage(
        messageId,
        updateData,
      );
      this.logger.log(
        `AI response rated: message ${messageId}, rating ${rating}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to rate AI response for message ${messageId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * ปิดเซสชันแชท
   */
  async closeChatSession(sessionId: number): Promise<any> {
    try {
      const result = await this.supabaseService.updateChatSession(sessionId, {
        is_active: false,
        updated_at: new Date().toISOString(),
      });

      this.logger.log(`Chat session ${sessionId} closed`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to close chat session ${sessionId}`, error);
      throw error;
    }
  }

  /**
   * ลบเซสชันแชท
   */
  async deleteChatSession(sessionId: number): Promise<any> {
    try {
      // ลบข้อความทั้งหมดในเซสชันก่อน
      await this.supabaseService.deleteChatMessagesBySessionId(sessionId);

      // ลบเซสชัน
      const result = await this.supabaseService.deleteChatSession(sessionId);

      this.logger.log(`Chat session ${sessionId} deleted`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete chat session ${sessionId}`, error);
      throw error;
    }
  }

  /**
   * วิเคราะห์ข้อมูลสุขภาพเฉพาะเจาะจง
   */
  async analyzeSpecificHealthData(userId: number, analysisType: string): Promise<any> {
    try {
      // ตรวจสอบ analysisType
      if (!analysisType) {
        this.logger.warn('Analysis type is undefined, defaulting to overall analysis');
        analysisType = 'overall';
      }

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      switch (analysisType.toLowerCase()) {
        case 'nutrition':
        case 'อาหาร':
          return await this.analyzeNutritionData(userId, weekAgo, today);
        
        case 'exercise':
        case 'ออกกำลังกาย':
          return await this.analyzeExerciseData(userId, weekAgo, today);
        
        case 'sleep':
        case 'การนอน':
          return await this.analyzeSleepData(userId, weekAgo, today);
        
        case 'water':
        case 'น้ำ':
          return await this.analyzeWaterData(userId, weekAgo, today);
        
        case 'goals':
        case 'เป้าหมาย':
          return await this.analyzeGoalsData(userId);
        
        case 'overall':
        case 'รวม':
          return await this.analyzeOverallHealth(userId, weekAgo, today);
        
        default:
          return await this.analyzeOverallHealth(userId, weekAgo, today);
      }
    } catch (error) {
      this.logger.error(`Failed to analyze specific health data for user ${userId}`, error);
      return { error: 'ไม่สามารถวิเคราะห์ข้อมูลได้' };
    }
  }

  /**
   * วิเคราะห์ข้อมูลโภชนาการ
   */
  private async analyzeNutritionData(userId: number, dateFrom: string, dateTo: string): Promise<any> {
    const foodLogs = await this.supabaseService.getFoodLogs(userId, {
      date_from: dateFrom,
      date_to: dateTo,
    });

    const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const avgCaloriesPerDay = totalCalories / Math.max(foodLogs.length, 1);
    const proteinIntake = foodLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const carbIntake = foodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
    const fatIntake = foodLogs.reduce((sum, log) => sum + (log.fat || 0), 0);

    return {
      type: 'nutrition',
      period: `${dateFrom} ถึง ${dateTo}`,
      summary: {
        total_entries: foodLogs.length,
        total_calories: totalCalories,
        avg_calories_per_day: Math.round(avgCaloriesPerDay),
        protein_intake: Math.round(proteinIntake),
        carb_intake: Math.round(carbIntake),
        fat_intake: Math.round(fatIntake),
      },
      recent_foods: foodLogs.slice(0, 10).map(log => ({
        food_name: log.food_name,
        calories: log.calories,
        protein: log.protein,
        carbs: log.carbs,
        fat: log.fat,
        consumed_at: log.consumed_at,
      })),
      recommendations: [], // ให้ AI วิเคราะห์และให้คำแนะนำเอง
    };
  }

  /**
   * วิเคราะห์ข้อมูลการออกกำลังกาย
   */
  private async analyzeExerciseData(userId: number, dateFrom: string, dateTo: string): Promise<any> {
    const exerciseLogs = await this.supabaseService.getExerciseLogs(userId, {
      exercise_date_from: dateFrom,
      exercise_date_to: dateTo,
    });

    const totalDuration = exerciseLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
    const avgDurationPerDay = totalDuration / Math.max(exerciseLogs.length, 1);
    const exerciseTypes = [...new Set(exerciseLogs.map(log => log.exercise_type))];

    return {
      type: 'exercise',
      period: `${dateFrom} ถึง ${dateTo}`,
      summary: {
        total_entries: exerciseLogs.length,
        total_duration_minutes: totalDuration,
        avg_duration_per_day: Math.round(avgDurationPerDay),
        exercise_types: exerciseTypes,
      },
      recent_exercises: exerciseLogs.slice(0, 10).map(log => ({
        exercise_type: log.exercise_type,
        duration_minutes: log.duration_minutes,
        calories_burned: log.calories_burned,
        exercise_date: log.exercise_date,
      })),
      recommendations: [], // ให้ AI วิเคราะห์และให้คำแนะนำเอง
    };
  }

  /**
   * วิเคราะห์ข้อมูลการนอน
   */
  private async analyzeSleepData(userId: number, dateFrom: string, dateTo: string): Promise<any> {
    const sleepLogs = await this.supabaseService.getSleepLogsByUserId(userId);
    const recentSleepLogs = sleepLogs.filter(log => 
      new Date(log.sleep_date) >= new Date(dateFrom) && 
      new Date(log.sleep_date) <= new Date(dateTo)
    );

    const totalSleepHours = recentSleepLogs.reduce((sum, log) => sum + (log.total_sleep_hours || 0), 0);
    const avgSleepHours = totalSleepHours / Math.max(recentSleepLogs.length, 1);
    const avgSleepQuality = recentSleepLogs.reduce((sum, log) => sum + (log.sleep_quality || 0), 0) / Math.max(recentSleepLogs.length, 1);

    return {
      type: 'sleep',
      period: `${dateFrom} ถึง ${dateTo}`,
      summary: {
        total_entries: recentSleepLogs.length,
        total_sleep_hours: Math.round(totalSleepHours * 10) / 10,
        avg_sleep_hours: Math.round(avgSleepHours * 10) / 10,
        avg_sleep_quality: Math.round(avgSleepQuality * 10) / 10,
      },
      recent_sleep: recentSleepLogs.slice(0, 7).map(log => ({
        sleep_date: log.sleep_date,
        total_sleep_hours: log.total_sleep_hours,
        sleep_quality: log.sleep_quality,
        bedtime: log.bedtime,
        wake_time: log.wake_time,
      })),
      recommendations: [], // ให้ AI วิเคราะห์และให้คำแนะนำเอง
    };
  }

  /**
   * วิเคราะห์ข้อมูลการดื่มน้ำ
   */
  private async analyzeWaterData(userId: number, dateFrom: string, dateTo: string): Promise<any> {
    const waterLogs = await this.supabaseService.getWaterLogs(userId, {
      date_from: dateFrom,
      date_to: dateTo,
    });

    const totalWater = waterLogs.reduce((sum, log) => sum + (log.amount_ml || 0), 0);
    const avgWaterPerDay = totalWater / Math.max(waterLogs.length, 1);

    return {
      type: 'water',
      period: `${dateFrom} ถึง ${dateTo}`,
      summary: {
        total_entries: waterLogs.length,
        total_water_ml: totalWater,
        avg_water_per_day: Math.round(avgWaterPerDay),
      },
      recent_water: waterLogs.slice(0, 7).map(log => ({
        amount_ml: log.amount_ml,
        consumed_at: log.consumed_at,
      })),
      recommendations: [], // ให้ AI วิเคราะห์และให้คำแนะนำเอง
    };
  }

  /**
   * วิเคราะห์ข้อมูลเป้าหมาย
   */
  private async analyzeGoalsData(userId: number): Promise<any> {
    const healthGoals = await this.supabaseService.getHealthGoalsByUserId(userId);
    
    const activeGoals = healthGoals.filter(goal => goal.status === 'active');
    const completedGoals = healthGoals.filter(goal => goal.status === 'completed');
    const progressGoals = healthGoals.map(goal => ({
      ...goal,
      progress_percentage: goal.target_value > 0 ? Math.round((goal.current_value / goal.target_value) * 100) : 0,
    }));

    return {
      type: 'goals',
      summary: {
        total_goals: healthGoals.length,
        active_goals: activeGoals.length,
        completed_goals: completedGoals.length,
        avg_progress: progressGoals.length > 0 ? Math.round(progressGoals.reduce((sum, goal) => sum + goal.progress_percentage, 0) / progressGoals.length) : 0,
      },
      goals: progressGoals,
      recommendations: [], // ให้ AI วิเคราะห์และให้คำแนะนำเอง
    };
  }

  /**
   * วิเคราะห์สุขภาพโดยรวม
   */
  private async analyzeOverallHealth(userId: number, dateFrom: string, dateTo: string): Promise<any> {
    const [nutritionData, exerciseData, sleepData, waterData, goalsData] = await Promise.all([
      this.analyzeNutritionData(userId, dateFrom, dateTo),
      this.analyzeExerciseData(userId, dateFrom, dateTo),
      this.analyzeSleepData(userId, dateFrom, dateTo),
      this.analyzeWaterData(userId, dateFrom, dateTo),
      this.analyzeGoalsData(userId),
    ]);

    return {
      type: 'overall',
      period: `${dateFrom} ถึง ${dateTo}`,
      nutrition: nutritionData,
      exercise: exerciseData,
      sleep: sleepData,
      water: waterData,
      goals: goalsData,
      overall_score: this.calculateOverallScore(nutritionData, exerciseData, sleepData, waterData),
    };
  }

  /**
   * คำนวณคะแนนสุขภาพโดยรวม
   */
  private calculateOverallScore(nutrition: any, exercise: any, sleep: any, water: any): number {
    const nutritionScore = Math.min(100, (nutrition.summary.avg_calories_per_day / 2000) * 100);
    const exerciseScore = Math.min(100, (exercise.summary.avg_duration_per_day / 30) * 100);
    const sleepScore = Math.min(100, (sleep.summary.avg_sleep_hours / 8) * 100);
    const waterScore = Math.min(100, (water.summary.avg_water_per_day / 2000) * 100);
    
    return Math.round((nutritionScore + exerciseScore + sleepScore + waterScore) / 4);
  }






  /**
   * ดึงข้อมูลกิจกรรมล่าสุดของผู้ใช้
   */
  async getRecentUserActivities(userId: number): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [recentFoodLogs, recentExerciseLogs, recentSleepLogs, recentWaterLogs] = await Promise.all([
        this.supabaseService.getFoodLogs(userId, {
          date_from: weekAgo,
          date_to: today,
        }),
        this.supabaseService.getExerciseLogs(userId, {
          exercise_date_from: weekAgo,
          exercise_date_to: today,
        }),
        this.supabaseService.getSleepLogsByUserId(userId),
        this.supabaseService.getWaterLogs(userId, {
          date_from: weekAgo,
          date_to: today,
        }),
      ]);

      return {
        food_logs: recentFoodLogs.slice(0, 5), // 5 รายการล่าสุด
        exercise_logs: recentExerciseLogs.slice(0, 5),
        sleep_logs: recentSleepLogs.slice(0, 7), // 7 วันล่าสุด
        water_logs: recentWaterLogs.slice(0, 7),
        summary: {
          total_food_entries: recentFoodLogs.length,
          total_exercise_entries: recentExerciseLogs.length,
          total_sleep_entries: recentSleepLogs.length,
          total_water_entries: recentWaterLogs.length,
          period: `${weekAgo} ถึง ${today}`,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get recent activities for user ${userId}`, error);
      return {
        food_logs: [],
        exercise_logs: [],
        sleep_logs: [],
        water_logs: [],
        summary: {
          total_food_entries: 0,
          total_exercise_entries: 0,
          total_sleep_entries: 0,
          total_water_entries: 0,
          period: 'ไม่สามารถดึงข้อมูลได้',
        },
      };
    }
  }

  /**
   * สร้างข้อความตอบกลับแบบ fallback เมื่อ AI ไม่สามารถตอบได้
   */
  private getFallbackResponse(userMessage: string): string {
    const fallbackResponses = [
      'ขออภัยค่ะ ตอนนี้ระบบ AI มีปัญหาชั่วคราว แต่ฉันสามารถช่วยคุณได้ด้วยข้อมูลพื้นฐาน',
      'ขออภัยค่ะ ระบบ AI ไม่สามารถตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
      'ขออภัยค่ะ มีปัญหาการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้งในภายหลัง',
      'ขออภัยค่ะ ระบบ AI กำลังปรับปรุง กรุณาลองใหม่อีกครั้ง',
    ];

    // เลือกข้อความตอบกลับแบบสุ่ม
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
  }

  /**
   * ตรวจสอบสถานะการเชื่อมต่อ AI
   */
  async checkAIStatus(): Promise<boolean> {
    try {
      return await this.openRouterService.healthCheck();
    } catch (error) {
      this.logger.error('AI status check failed', error);
      return false;
    }
  }
}
