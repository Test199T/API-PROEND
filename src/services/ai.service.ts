import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { OpenRouterService } from './openrouter.service';

export interface HealthAnalysis {
  nutritionScore: number;
  exerciseScore: number;
  sleepScore: number;
  waterScore: number;
  overallScore: number;
  recommendations: string[];
  insights: string[];
  riskFactors: string[];
}

export interface AIRecommendation {
  type: 'nutrition' | 'exercise' | 'sleep' | 'lifestyle' | 'goal';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable: boolean;
  estimatedImpact: number;
  timeToImplement: string;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly openRouterService: OpenRouterService,
  ) {}

  /**
   * วิเคราะห์สุขภาพของผู้ใช้ด้วย AI
   */
  async analyzeUserHealth(userId: number): Promise<any> {
    try {
      // ตรวจสอบ userId
      if (!userId || userId <= 0) {
        throw new Error('User ID not found. Please login again.');
      }

      // ดึงข้อมูลผู้ใช้และสุขภาพ
      const userData = await this.supabaseService.getUserById(userId);
      if (!userData) {
        throw new Error('User ID not found. Please login again.');
      }
      
      const healthData = await this.getHealthDataForAnalysis(userId);

      // ใช้ OpenRouter AI วิเคราะห์ข้อมูล
      let aiAnalysis: string;
      try {
        aiAnalysis = await this.openRouterService.analyzeHealthData(
          userData,
          healthData,
          'การวิเคราะห์สุขภาพโดยรวม',
        );
      } catch (aiError) {
        this.logger.warn(
          `AI analysis failed, using fallback: ${aiError.message}`,
        );
        aiAnalysis = this.generateFallbackHealthAnalysis(userData, healthData);
      }

      // คำนวณคะแนนสุขภาพ
      const healthScores = this.calculateHealthScores(healthData);

      return {
        user: userData,
        healthScores,
        aiAnalysis,
        recommendations: await this.generateAIRecommendations(userId),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to analyze user health for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * สร้างคำแนะนำจาก AI
   */
  async generateAIRecommendations(userId: number): Promise<any> {
    try {
      const userData = await this.supabaseService.getUserById(userId);
      const healthMetrics =
        await this.getHealthMetricsForRecommendations(userId);

      // ใช้ OpenRouter AI สร้างคำแนะนำ
      let aiRecommendations: string;
      try {
        aiRecommendations =
          await this.openRouterService.generateHealthRecommendations(
            userData,
            healthMetrics,
          );
      } catch (aiError) {
        this.logger.warn(
          `AI recommendations failed, using fallback: ${aiError.message}`,
        );
        aiRecommendations = this.generateFallbackRecommendations(
          userData,
          healthMetrics,
        );
      }

      return {
        recommendations: aiRecommendations,
        generatedAt: new Date().toISOString(),
        confidence: 0.85, // AI confidence score
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate AI recommendations for user ${userId}`,
        error,
      );
      // Fallback to basic recommendations if AI fails
      return this.generateBasicRecommendations(userId);
    }
  }

  /**
   * บันทึกข้อมูลเชิงลึกจาก AI
   */
  async saveAIInsight(userId: number, insightData: any): Promise<any> {
    try {
      const insight = {
        user_id: userId,
        insight_type: insightData.type || 'health_analysis',
        title: insightData.title || 'การวิเคราะห์สุขภาพจาก AI',
        description: insightData.description || insightData.analysis || '',
        confidence_score: insightData.confidence || 0.8,
        data_sources: insightData.dataSources || [
          'health_logs',
          'user_profile',
        ],
        actionable_items: insightData.actionableItems || [],
        created_at: new Date().toISOString(),
      };

      const result = await this.supabaseService.createAIInsight(insight);
      this.logger.log(`AI insight saved for user ${userId}: ${result.id}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to save AI insight for user ${userId}`, error);
      throw error;
    }
  }

  // Private methods สำหรับการคำนวณคะแนน
  private calculateNutritionScore(foodLogs: any[], userData: any): number {
    if (foodLogs.length === 0) return 50;

    const today = new Date().toISOString().split('T')[0];
    const todayFoods = foodLogs.filter((food) =>
      food.consumed_at.startsWith(today),
    );

    if (todayFoods.length === 0) return 50;

    let score = 100;
    const totalCalories = todayFoods.reduce(
      (sum, food) => sum + (food.calories || 0),
      0,
    );
    const totalProtein = todayFoods.reduce(
      (sum, food) => sum + (food.protein_g || 0),
      0,
    );
    const totalCarbs = todayFoods.reduce(
      (sum, food) => sum + (food.carbs_g || 0),
      0,
    );
    const totalFat = todayFoods.reduce(
      (sum, food) => sum + (food.fat_g || 0),
      0,
    );

    // คำนวณ BMR และแคลอรี่ที่แนะนำ
    const bmr = this.calculateBMR(userData);
    const recommendedCalories = this.calculateRecommendedCalories(
      bmr,
      userData.activity_level,
    );

    // หักคะแนนตามความเบี่ยงเบนจากค่าที่แนะนำ
    if (totalCalories > 0) {
      const calorieDeviation =
        Math.abs(totalCalories - recommendedCalories) / recommendedCalories;
      if (calorieDeviation > 0.3) score -= 20;
      else if (calorieDeviation > 0.2) score -= 15;
      else if (calorieDeviation > 0.1) score -= 10;
    }

    // ตรวจสอบความสมดุลของสารอาหาร
    if (totalProtein < 50) score -= 15;
    if (totalCarbs < 100) score -= 10;
    if (totalFat < 20) score -= 10;

    return Math.max(0, score);
  }

  private calculateExerciseScore(exerciseLogs: any[], userData: any): number {
    if (exerciseLogs.length === 0) return 30;

    const today = new Date().toISOString().split('T')[0];
    const todayExercises = exerciseLogs.filter(
      (exercise) => exercise.exercise_date === today,
    );

    if (todayExercises.length === 0) return 30;

    let score = 100;
    const totalDuration = todayExercises.reduce(
      (sum, exercise) => sum + (exercise.duration_minutes || 0),
      0,
    );
    const totalCaloriesBurned = todayExercises.reduce(
      (sum, exercise) => sum + (exercise.calories_burned || 0),
      0,
    );

    // เป้าหมายการออกกำลังกาย: 30 นาทีต่อวัน
    if (totalDuration < 15) score -= 40;
    else if (totalDuration < 30) score -= 20;
    else if (totalDuration < 45) score -= 10;

    // ตรวจสอบความเข้มข้น
    const highIntensityExercises = todayExercises.filter(
      (exercise) =>
        exercise.intensity === 'high' || exercise.intensity === 'very_high',
    );
    if (highIntensityExercises.length === 0) score -= 15;

    return Math.max(0, score);
  }

  private calculateSleepScore(sleepLogs: any[]): number {
    if (sleepLogs.length === 0) return 50;

    const today = new Date().toISOString().split('T')[0];
    const todaySleep = sleepLogs.find((sleep) => sleep.sleep_date === today);

    if (!todaySleep) return 50;

    let score = 100;
    const sleepHours = todaySleep.total_sleep_hours || 0;
    const sleepQuality = todaySleep.sleep_quality || 5;

    // ตรวจสอบเวลาการนอน
    if (sleepHours < 6) score -= 30;
    else if (sleepHours < 7) score -= 20;
    else if (sleepHours < 8) score -= 10;
    else if (sleepHours > 9) score -= 15;

    // ตรวจสอบคุณภาพการนอน
    if (sleepQuality < 5) score -= 25;
    else if (sleepQuality < 7) score -= 15;
    else if (sleepQuality < 8) score -= 10;

    return Math.max(0, score);
  }

  private calculateWaterScore(waterLogs: any[], userData: any): number {
    if (waterLogs.length === 0) return 50;

    const today = new Date().toISOString().split('T')[0];
    const todayWater = waterLogs.filter((water) =>
      water.consumed_at.startsWith(today),
    );

    if (todayWater.length === 0) return 50;

    let score = 100;
    const totalWater = todayWater.reduce(
      (sum, water) => sum + (water.amount_ml || 0),
      0,
    );

    // เป้าหมายการดื่มน้ำ: 2-3 ลิตรต่อวัน (ขึ้นอยู่กับน้ำหนัก)
    const recommendedWater = (userData.weight_kg || 70) * 35; // 35 ml ต่อน้ำหนัก 1 kg

    if (totalWater < recommendedWater * 0.5) score -= 40;
    else if (totalWater < recommendedWater * 0.7) score -= 25;
    else if (totalWater < recommendedWater * 0.9) score -= 15;
    else if (totalWater > recommendedWater * 1.5) score -= 10;

    return Math.max(0, score);
  }

  // Private methods สำหรับการสร้างคำแนะนำ
  private generateRecommendations(data: any): string[] {
    const recommendations: string[] = [];

    if (data.nutritionScore < 70) {
      recommendations.push('ควรปรับปรุงโภชนาการให้สมดุลมากขึ้น');
    }

    if (data.exerciseScore < 70) {
      recommendations.push('ควรเพิ่มการออกกำลังกายให้สม่ำเสมอ');
    }

    if (data.sleepScore < 70) {
      recommendations.push('ควรปรับปรุงคุณภาพการนอน');
    }

    if (data.waterScore < 70) {
      recommendations.push('ควรดื่มน้ำให้เพียงพอ');
    }

    return recommendations;
  }

  private generateInsights(data: any): string[] {
    const insights: string[] = [];

    if (data.nutritionScore > 80) {
      insights.push('โภชนาการของคุณอยู่ในเกณฑ์ดี');
    }

    if (data.exerciseScore > 80) {
      insights.push('การออกกำลังกายของคุณสม่ำเสมอ');
    }

    if (data.sleepScore > 80) {
      insights.push('คุณภาพการนอนของคุณดี');
    }

    if (data.waterScore > 80) {
      insights.push('การดื่มน้ำของคุณเพียงพอ');
    }

    return insights;
  }

  private identifyRiskFactors(data: any): string[] {
    const riskFactors: string[] = [];

    if (data.nutritionScore < 50) {
      riskFactors.push('โภชนาการไม่สมดุลอาจส่งผลต่อสุขภาพ');
    }

    if (data.exerciseScore < 50) {
      riskFactors.push('การออกกำลังกายน้อยอาจส่งผลต่อสุขภาพหัวใจ');
    }

    if (data.sleepScore < 50) {
      riskFactors.push('การนอนไม่เพียงพออาจส่งผลต่อระบบภูมิคุ้มกัน');
    }

    if (data.waterScore < 50) {
      riskFactors.push('การดื่มน้ำน้อยอาจส่งผลต่อการทำงานของร่างกาย');
    }

    return riskFactors;
  }

  // Helper methods
  private calculateBMR(userData: any): number {
    const weight = userData.weight_kg || 70;
    const height = userData.height_cm || 170;
    const age = userData.age || 30;
    const gender = userData.gender || 'male';

    if (gender === 'male') {
      return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }
  }

  private calculateRecommendedCalories(
    bmr: number,
    activityLevel: string,
  ): number {
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };

    const multiplier = activityMultipliers[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
  }

  private getNutritionRecommendation(score: number, userData: any): string {
    if (score < 50) {
      return 'ควรปรึกษาโภชนากรเพื่อวางแผนโภชนาการที่เหมาะสม';
    } else if (score < 70) {
      return 'ควรเพิ่มการรับประทานผักผลไม้และลดอาหารแปรรูป';
    } else {
      return 'ควรรักษาโภชนาการที่ดีไว้และปรับปรุงให้สมดุลมากขึ้น';
    }
  }

  private getExerciseRecommendation(score: number, userData: any): string {
    if (score < 50) {
      return 'ควรเริ่มออกกำลังกายเบาๆ เช่น เดินเร็ว 30 นาทีต่อวัน';
    } else if (score < 70) {
      return 'ควรเพิ่มความถี่และความเข้มข้นของการออกกำลังกาย';
    } else {
      return 'ควรรักษาระดับการออกกำลังกายและเพิ่มความหลากหลาย';
    }
  }

  private getSleepRecommendation(score: number): string {
    if (score < 50) {
      return 'ควรปรับเวลานอนให้เป็นเวลาและสร้างสภาพแวดล้อมที่เหมาะสม';
    } else if (score < 70) {
      return 'ควรปรับปรุงคุณภาพการนอนและลดการใช้อุปกรณ์อิเล็กทรอนิกส์ก่อนนอน';
    } else {
      return 'ควรรักษาคุณภาพการนอนที่ดีไว้';
    }
  }

  private getWaterRecommendation(score: number, userData: any): string {
    const recommendedWater = (userData.weight_kg || 70) * 35;
    return `ควรดื่มน้ำให้ได้ ${Math.round(recommendedWater / 1000)} ลิตรต่อวัน และดื่มน้ำก่อนมื้ออาหาร`;
  }

  private getGoalRecommendation(goals: any[]): string {
    if (goals.length === 1) {
      return `ติดตามเป้าหมาย: ${goals[0].title}`;
    } else {
      return `ติดตามเป้าหมายสุขภาพ ${goals.length} ข้อให้สม่ำเสมอ`;
    }
  }

  // Nutrition Analysis Methods
  async analyzeNutrition(userId: number, date?: string): Promise<any> {
    try {
      const userData = await this.supabaseService.getUserById(userId);
      const foodLogs = await this.supabaseService.getFoodLogs(userId, {
        date_from: date,
        date_to: date,
      });

      const analysis = {
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        total_fiber: 0,
        meal_breakdown: {} as Record<string, number>,
        nutrition_score: 0,
        recommendations: [] as string[],
        insights: [] as string[],
      };

      foodLogs.forEach((log) => {
        analysis.total_calories += log.calories || 0;
        analysis.total_protein += log.protein_g || 0;
        analysis.total_carbs += log.carbs_g || 0;
        analysis.total_fat += log.fat_g || 0;
        analysis.total_fiber += log.fiber_g || 0;

        if (!analysis.meal_breakdown[log.meal_type]) {
          analysis.meal_breakdown[log.meal_type] = 0;
        }
        analysis.meal_breakdown[log.meal_type]++;
      });

      // คำนวณคะแนนโภชนาการ
      const bmr = this.calculateBMR(userData);
      const recommendedCalories = this.calculateRecommendedCalories(
        bmr,
        userData.activity_level,
      );

      if (analysis.total_calories > 0) {
        const calorieRatio = Math.min(
          analysis.total_calories / recommendedCalories,
          1.5,
        );
        analysis.nutrition_score = Math.round(calorieRatio * 100);
      }

      // สร้างคำแนะนำ
      if (analysis.total_calories < recommendedCalories * 0.8) {
        analysis.recommendations.push(
          'ควรเพิ่มการรับประทานอาหารเพื่อให้ได้แคลอรี่ที่เพียงพอ',
        );
      } else if (analysis.total_calories > recommendedCalories * 1.2) {
        analysis.recommendations.push(
          'ควรลดการรับประทานอาหารเพื่อควบคุมน้ำหนัก',
        );
      }

      if (analysis.total_protein < 50) {
        analysis.recommendations.push(
          'ควรเพิ่มการรับประทานโปรตีน เช่น เนื้อสัตว์ ไข่ ถั่ว',
        );
      }

      if (analysis.total_fiber < 25) {
        analysis.recommendations.push(
          'ควรเพิ่มการรับประทานผักผลไม้เพื่อเพิ่มไฟเบอร์',
        );
      }

      // สร้างข้อมูลเชิงลึก
      analysis.insights.push(
        `ได้รับแคลอรี่ ${analysis.total_calories} จากที่แนะนำ ${recommendedCalories}`,
      );
      analysis.insights.push(
        `โปรตีน ${analysis.total_protein}g, คาร์โบไฮเดรต ${analysis.total_carbs}g, ไขมัน ${analysis.total_fat}g`,
      );

      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze nutrition: ${error.message}`);
    }
  }

  async getFoodRecommendations(userId: number): Promise<any> {
    try {
      const userData = await this.supabaseService.getUserById(userId);
      const healthGoals =
        await this.supabaseService.getHealthGoalsByUserId(userId);

      const recommendations = {
        daily_calories: 0,
        meal_suggestions: {} as Record<string, string>,
        food_groups: [] as string[],
        hydration_tips: [] as string[],
      };

      const bmr = this.calculateBMR(userData);
      recommendations.daily_calories = this.calculateRecommendedCalories(
        bmr,
        userData.activity_level,
      );

      // แนะนำอาหารตามเป้าหมาย
      const weightGoal = healthGoals.find(
        (goal) =>
          goal.goal_type === 'weight_loss' || goal.goal_type === 'weight_gain',
      );
      if (weightGoal) {
        if (weightGoal.goal_type === 'weight_loss') {
          recommendations.daily_calories = Math.round(
            recommendations.daily_calories * 0.8,
          );
          recommendations.food_groups.push(
            'ผักผลไม้',
            'โปรตีนไขมันต่ำ',
            'ธัญพืชเต็มเมล็ด',
          );
        } else {
          recommendations.daily_calories = Math.round(
            recommendations.daily_calories * 1.2,
          );
          recommendations.food_groups.push(
            'โปรตีนคุณภาพสูง',
            'คาร์โบไฮเดรตเชิงซ้อน',
            'ไขมันดี',
          );
        }
      }

      // แนะนำมื้ออาหาร
      recommendations.meal_suggestions = {
        breakfast: 'ข้าวโอ๊ตกับผลไม้และนม หรือไข่กับขนมปังโฮลวีท',
        lunch: 'ข้าวกล้องกับเนื้อสัตว์ไขมันต่ำและผัก',
        dinner: 'ปลาหรือเนื้อสัตว์ไขมันต่ำกับผักและข้าวกล้อง',
        snack: 'ผลไม้ ถั่ว หรือโยเกิร์ต',
      };

      recommendations.hydration_tips = [
        'ดื่มน้ำ 8-10 แก้วต่อวัน',
        'ดื่มน้ำก่อนมื้ออาหาร 30 นาที',
        'ดื่มน้ำหลังออกกำลังกาย',
        'หลีกเลี่ยงเครื่องดื่มที่มีน้ำตาล',
      ];

      return recommendations;
    } catch (error) {
      throw new Error(`Failed to get food recommendations: ${error.message}`);
    }
  }

  // Exercise Analysis Methods
  async analyzeExercise(userId: number, date?: string): Promise<any> {
    try {
      const userData = await this.supabaseService.getUserById(userId);
      const exerciseLogs = await this.supabaseService.getExerciseLogs(userId, {
        exercise_date_from: date,
        exercise_date_to: date,
      });

      const analysis = {
        total_exercises: exerciseLogs.length,
        total_duration: 0,
        total_calories_burned: 0,
        exercises_by_type: {} as Record<string, number>,
        intensity_breakdown: {} as Record<string, number>,
        exercise_score: 0,
        recommendations: [] as string[],
        insights: [] as string[],
      };

      exerciseLogs.forEach((log) => {
        analysis.total_duration += log.duration_minutes || 0;
        analysis.total_calories_burned += log.calories_burned || 0;

        if (log.exercise_type) {
          if (!analysis.exercises_by_type[log.exercise_type]) {
            analysis.exercises_by_type[log.exercise_type] = 0;
          }
          analysis.exercises_by_type[log.exercise_type]++;
        }

        if (log.intensity) {
          if (!analysis.intensity_breakdown[log.intensity]) {
            analysis.intensity_breakdown[log.intensity] = 0;
          }
          analysis.intensity_breakdown[log.intensity]++;
        }
      });

      // คำนวณคะแนนการออกกำลังกาย
      const recommendedMinutes =
        userData.activity_level === 'sedentary'
          ? 30
          : userData.activity_level === 'lightly_active'
            ? 45
            : userData.activity_level === 'moderately_active'
              ? 60
              : userData.activity_level === 'very_active'
                ? 90
                : 120;

      if (analysis.total_duration > 0) {
        const durationRatio = Math.min(
          analysis.total_duration / recommendedMinutes,
          2,
        );
        analysis.exercise_score = Math.round(durationRatio * 100);
      }

      // สร้างคำแนะนำ
      if (analysis.total_duration < recommendedMinutes * 0.5) {
        analysis.recommendations.push(
          'ควรเพิ่มเวลาการออกกำลังกายให้ได้อย่างน้อย 30 นาทีต่อวัน',
        );
      } else if (analysis.total_duration < recommendedMinutes) {
        analysis.recommendations.push(
          'ควรเพิ่มเวลาการออกกำลังกายให้ได้ตามที่แนะนำ',
        );
      }

      if (!analysis.exercises_by_type['cardio']) {
        analysis.recommendations.push(
          'ควรเพิ่มการออกกำลังกายแบบคาร์ดิโอ เช่น เดินเร็ว วิ่ง ปั่นจักรยาน',
        );
      }

      if (!analysis.exercises_by_type['strength']) {
        analysis.recommendations.push(
          'ควรเพิ่มการออกกำลังกายแบบเสริมสร้างกล้ามเนื้อ',
        );
      }

      // สร้างข้อมูลเชิงลึก
      analysis.insights.push(
        `ออกกำลังกาย ${analysis.total_duration} นาที จากที่แนะนำ ${recommendedMinutes} นาที`,
      );
      analysis.insights.push(
        `เผาผลาญแคลอรี่ ${analysis.total_calories_burned} แคลอรี่`,
      );
      analysis.insights.push(
        `ประเภทการออกกำลังกาย: ${Object.keys(analysis.exercises_by_type).join(', ')}`,
      );

      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze exercise: ${error.message}`);
    }
  }

  async getExerciseRecommendations(userId: number): Promise<any> {
    try {
      const userData = await this.supabaseService.getUserById(userId);
      const healthGoals =
        await this.supabaseService.getHealthGoalsByUserId(userId);

      const recommendations = {
        weekly_plan: {} as Record<string, any>,
        exercise_types: [] as string[],
        intensity_levels: [] as string[],
        duration_suggestions: {} as Record<string, string>,
        safety_tips: [] as string[],
      };

      // แนะนำตามระดับกิจกรรม
      const baseMinutes =
        userData.activity_level === 'sedentary'
          ? 30
          : userData.activity_level === 'lightly_active'
            ? 45
            : userData.activity_level === 'moderately_active'
              ? 60
              : userData.activity_level === 'very_active'
                ? 90
                : 120;

      recommendations.weekly_plan = {
        monday: {
          type: 'cardio',
          duration: baseMinutes,
          intensity: 'moderate',
        },
        tuesday: {
          type: 'strength',
          duration: baseMinutes * 0.8,
          intensity: 'moderate',
        },
        wednesday: {
          type: 'cardio',
          duration: baseMinutes,
          intensity: 'moderate',
        },
        thursday: {
          type: 'strength',
          duration: baseMinutes * 0.8,
          intensity: 'moderate',
        },
        friday: {
          type: 'cardio',
          duration: baseMinutes,
          intensity: 'moderate',
        },
        saturday: {
          type: 'flexibility',
          duration: baseMinutes * 0.6,
          intensity: 'low',
        },
        sunday: { type: 'rest', duration: 0, intensity: 'none' },
      };

      // แนะนำประเภทการออกกำลังกาย
      recommendations.exercise_types = [
        'คาร์ดิโอ: เดินเร็ว วิ่ง ปั่นจักรยาน ว่ายน้ำ',
        'เสริมสร้างกล้ามเนื้อ: ยกน้ำหนัก วิดพื้น ซิทอัพ',
        'ยืดกล้ามเนื้อ: โยคะ พิลาทิส',
        'สมดุล: ไทชิ โยคะ',
      ];

      recommendations.intensity_levels = [
        'ต่ำ: สามารถพูดคุยได้สบาย',
        'ปานกลาง: สามารถพูดคุยได้แต่เหนื่อย',
        'สูง: พูดคุยได้ยาก',
        'สูงมาก: พูดคุยไม่ได้',
      ];

      recommendations.duration_suggestions = {
        beginner: 'เริ่มต้น 15-20 นาทีต่อวัน',
        intermediate: '30-45 นาทีต่อวัน',
        advanced: '45-90 นาทีต่อวัน',
      };

      recommendations.safety_tips = [
        'วอร์มอัพก่อนออกกำลังกาย 5-10 นาที',
        'คูลดาวน์หลังออกกำลังกาย 5-10 นาที',
        'ดื่มน้ำให้เพียงพอ',
        'ฟังร่างกายและหยุดเมื่อรู้สึกไม่สบาย',
        'ปรึกษาแพทย์ก่อนเริ่มโปรแกรมใหม่',
      ];

      return recommendations;
    } catch (error) {
      throw new Error(
        `Failed to get exercise recommendations: ${error.message}`,
      );
    }
  }

  /**
   * ดึงข้อมูลสุขภาพสำหรับการวิเคราะห์
   */
  private async getHealthDataForAnalysis(userId: number): Promise<any> {
    const [foodLogs, exerciseLogs, sleepLogs, waterLogs, healthGoals] =
      await Promise.all([
        this.supabaseService.getFoodLogs(userId, {}),
        this.supabaseService.getExerciseLogs(userId, {}),
        this.supabaseService.getSleepLogsByUserId(userId),
        this.supabaseService.getWaterLogsByUserId(userId),
        this.supabaseService.getHealthGoalsByUserId(userId),
      ]);

    return {
      foodLogs,
      exerciseLogs,
      sleepLogs,
      waterLogs,
      healthGoals,
    };
  }

  /**
   * คำนวณคะแนนสุขภาพ
   */
  private calculateHealthScores(healthData: any): any {
    const userData = healthData.userData || {};
    const nutritionScore = this.calculateNutritionScore(
      healthData.foodLogs,
      userData,
    );
    const exerciseScore = this.calculateExerciseScore(
      healthData.exerciseLogs,
      userData,
    );
    const sleepScore = this.calculateSleepScore(healthData.sleepLogs);
    const waterScore = this.calculateWaterScore(healthData.waterLogs, userData);

    const overallScore = Math.round(
      (nutritionScore + exerciseScore + sleepScore + waterScore) / 4,
    );

    return {
      nutritionScore,
      exerciseScore,
      sleepScore,
      waterScore,
      overallScore,
    };
  }

  /**
   * ดึงข้อมูลสุขภาพสำหรับการสร้างคำแนะนำ
   */
  private async getHealthMetricsForRecommendations(
    userId: number,
  ): Promise<any> {
    const [healthAnalysis, healthGoals] = await Promise.all([
      this.analyzeUserHealth(userId),
      this.supabaseService.getHealthGoalsByUserId(userId),
    ]);

    return {
      healthAnalysis,
      healthGoals,
      userId,
    };
  }

  /**
   * สร้างคำแนะนำพื้นฐาน (fallback)
   */
  private async generateBasicRecommendations(userId: number): Promise<any> {
    // Fallback recommendations if AI fails
    return {
      recommendations: [
        'เพิ่มการรับประทานผักและผลไม้',
        'ออกกำลังกายอย่างน้อย 30 นาทีต่อวัน',
        'นอนหลับให้เพียงพอ 7-9 ชั่วโมง',
        'ดื่มน้ำให้เพียงพอ 8 แก้วต่อวัน',
        'ติดตามเป้าหมายสุขภาพอย่างสม่ำเสมอ',
      ],
      generatedAt: new Date().toISOString(),
      confidence: 0.6,
      source: 'basic_fallback',
    };
  }

  /**
   * สร้างการวิเคราะห์สุขภาพแบบ fallback
   */
  private generateFallbackHealthAnalysis(
    userData: any,
    healthData: any,
  ): string {
    const analysis: string[] = [];

    if (healthData.foodLogs && healthData.foodLogs.length > 0) {
      analysis.push('ข้อมูลโภชนาการ: มีการบันทึกอาหารอย่างสม่ำเสมอ');
    } else {
      analysis.push('ข้อมูลโภชนาการ: ควรเริ่มบันทึกอาหารเพื่อติดตามสุขภาพ');
    }

    if (healthData.exerciseLogs && healthData.exerciseLogs.length > 0) {
      analysis.push('ข้อมูลการออกกำลังกาย: มีการออกกำลังกายอย่างสม่ำเสมอ');
    } else {
      analysis.push('ข้อมูลการออกกำลังกาย: ควรเพิ่มการออกกำลังกาย');
    }

    if (healthData.sleepLogs && healthData.sleepLogs.length > 0) {
      analysis.push('ข้อมูลการนอน: มีการติดตามการนอน');
    } else {
      analysis.push('ข้อมูลการนอน: ควรติดตามคุณภาพการนอน');
    }

    if (healthData.waterLogs && healthData.waterLogs.length > 0) {
      analysis.push('ข้อมูลการดื่มน้ำ: มีการติดตามการดื่มน้ำ');
    } else {
      analysis.push('ข้อมูลการดื่มน้ำ: ควรติดตามการดื่มน้ำ');
    }

    return analysis.join('\n');
  }

  /**
   * สร้างคำแนะนำแบบ fallback
   */
  private generateFallbackRecommendations(
    userData: any,
    healthMetrics: any,
  ): string {
    const recommendations: string[] = [];

    // Basic health recommendations based on user data
    if (userData.age && userData.age > 40) {
      recommendations.push('ควรตรวจสุขภาพประจำปีอย่างสม่ำเสมอ');
    }

    if (userData.weight_kg && userData.height_cm) {
      const bmi = userData.weight_kg / Math.pow(userData.height_cm / 100, 2);
      if (bmi > 25) {
        recommendations.push('ควรควบคุมน้ำหนักให้อยู่ในเกณฑ์ปกติ');
      }
    }

    recommendations.push('ควรรับประทานอาหารให้ครบ 5 หมู่');
    recommendations.push('ควรออกกำลังกายอย่างน้อย 150 นาทีต่อสัปดาห์');
    recommendations.push('ควรนอนหลับให้เพียงพอ 7-9 ชั่วโมงต่อคืน');
    recommendations.push('ควรดื่มน้ำให้เพียงพอ 8-10 แก้วต่อวัน');

    return recommendations.join('\n');
  }
}
