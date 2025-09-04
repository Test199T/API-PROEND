import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import {
  HealthGoal,
  GoalType,
  GoalStatus,
  GoalPriority,
} from '../entities/health-goal.entity';
import { User } from '../entities/user.entity';
import {
  CreateHealthGoalDto,
  UpdateHealthGoalDto,
  HealthGoalResponseDto,
  HealthGoalListDto,
  HealthGoalSearchDto,
  HealthGoalProgressDto,
  HealthGoalStatsDto,
  HealthGoalTemplateDto,
  HealthGoalRecommendationDto,
} from '../dto/health-goal.dto';

@Injectable()
export class HealthGoalService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // =====================================================
  // HEALTH GOAL CRUD OPERATIONS
  // =====================================================

  async createHealthGoal(
    userId: number,
    createHealthGoalDto: CreateHealthGoalDto,
  ): Promise<HealthGoalResponseDto> {
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const user = await this.supabaseService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    // สร้างเป้าหมายใหม่
    const healthGoal = await this.supabaseService.createHealthGoal({
      ...createHealthGoalDto,
      user_id: userId,
      start_date: createHealthGoalDto.start_date,
      target_date: createHealthGoalDto.target_date || null,
      current_value: createHealthGoalDto.current_value || 0,
    });

    return this.mapToHealthGoalResponseDto(healthGoal);
  }

  async findAllHealthGoals(
    userId: number,
    searchDto: HealthGoalSearchDto,
  ): Promise<HealthGoalListDto> {
    const {
      goal_type,
      status,
      priority,
      search,
      start_date_from,
      start_date_to,
      target_date_from,
      target_date_to,
      page = 1,
      limit = 10,
    } = searchDto;

    // ใช้ Supabase service แทน TypeORM
    const searchParams: any = {
      page,
      limit,
    };

    if (goal_type) searchParams.goal_type = goal_type;
    if (status) searchParams.status = status;
    if (priority) searchParams.priority = priority;
    if (search) searchParams.search = search;
    if (start_date_from) searchParams.start_date_from = start_date_from;
    if (start_date_to) searchParams.start_date_to = start_date_to;
    if (target_date_from) searchParams.target_date_from = target_date_from;
    if (target_date_to) searchParams.target_date_to = target_date_to;

    const { data: goals, count: total } =
      await this.supabaseService.searchHealthGoals(userId, searchParams);

    const goalResponses = goals.map((goal) =>
      this.mapToHealthGoalResponseDto(goal),
    );

    // คำนวณสถิติ
    const stats = await this.calculateGoalStats(userId);

    return {
      goals: goalResponses,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      stats,
    };
  }

  async findHealthGoalById(
    id: number,
    userId: number,
  ): Promise<HealthGoalResponseDto> {
    const goal = await this.supabaseService.findHealthGoalById(id, userId);

    if (!goal) {
      throw new NotFoundException('ไม่พบเป้าหมายนี้');
    }

    return this.mapToHealthGoalResponseDto(goal);
  }

  async updateHealthGoal(
    id: number,
    userId: number,
    updateHealthGoalDto: UpdateHealthGoalDto,
  ): Promise<HealthGoalResponseDto> {
    const goal = await this.supabaseService.findHealthGoalById(id, userId);

    if (!goal) {
      throw new NotFoundException('ไม่พบเป้าหมายนี้');
    }

    // อัพเดทข้อมูล
    if (updateHealthGoalDto.start_date) {
      updateHealthGoalDto.start_date = updateHealthGoalDto.start_date;
    }

    if (updateHealthGoalDto.target_date) {
      updateHealthGoalDto.target_date = updateHealthGoalDto.target_date;
    }

    // ตรวจสอบว่าถ้าเปลี่ยน status เป็น COMPLETED แล้ว current_value ต้องถึง target_value
    if (updateHealthGoalDto.status === GoalStatus.COMPLETED) {
      if (goal.target_value && goal.current_value < goal.target_value) {
        throw new BadRequestException(
          'ไม่สามารถทำเป้าหมายให้เสร็จได้ เนื่องจากยังไม่ถึงเป้าหมาย',
        );
      }
    }

    const updatedGoal = await this.supabaseService.updateHealthGoal(
      id,
      userId,
      updateHealthGoalDto,
    );

    return this.mapToHealthGoalResponseDto(updatedGoal);
  }

  async deleteHealthGoal(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    const goal = await this.supabaseService.findHealthGoalById(id, userId);

    if (!goal) {
      throw new NotFoundException('ไม่พบเป้าหมายนี้');
    }

    await this.supabaseService.deleteHealthGoal(id, userId);
    return { message: 'ลบเป้าหมายสำเร็จ' };
  }

  // =====================================================
  // GOAL PROGRESS & UPDATES
  // =====================================================

  async updateGoalProgress(
    id: number,
    userId: number,
    currentValue: number,
  ): Promise<HealthGoalResponseDto> {
    const goal = await this.supabaseService.findHealthGoalById(id, userId);

    if (!goal) {
      throw new NotFoundException('ไม่พบเป้าหมายนี้');
    }

    if (goal.status === GoalStatus.COMPLETED) {
      throw new BadRequestException(
        'ไม่สามารถอัพเดทเป้าหมายที่เสร็จสิ้นแล้วได้',
      );
    }

    const updatedGoal = await this.supabaseService.updateGoalProgress(
      id,
      userId,
      currentValue,
    );
    return this.mapToHealthGoalResponseDto(updatedGoal);
  }

  async getGoalProgress(
    id: number,
    userId: number,
  ): Promise<HealthGoalProgressDto> {
    const goal = await this.supabaseService.findHealthGoalById(id, userId);

    if (!goal) {
      throw new NotFoundException('ไม่พบเป้าหมายนี้');
    }

    // TODO: ดึงประวัติความคืบหน้าจากฐานข้อมูล
    const progressHistory = [];

    return {
      goal_id: goal.id,
      goal_title: goal.title,
      goal_type: goal.goal_type,
      target_value: goal.target_value || 0,
      current_value: goal.current_value,
      unit: goal.unit || '',
      progress_percentage: goal.progress_percentage,
      days_remaining: goal.days_remaining || undefined,
      is_overdue: goal.is_overdue,
      is_completed: goal.is_completed,
      status: goal.status,
      priority: goal.priority,
      last_updated: goal.updated_at,
      progress_history: progressHistory,
    };
  }

  // =====================================================
  // BULK OPERATIONS
  // =====================================================



  // =====================================================
  // GOAL TEMPLATES & RECOMMENDATIONS
  // =====================================================

  async getGoalTemplates(): Promise<HealthGoalTemplateDto[]> {
    // TODO: ดึงเทมเพลตเป้าหมายจากฐานข้อมูลหรือไฟล์ config
    const templates: HealthGoalTemplateDto[] = [
      {
        name: 'ลดน้ำหนัก',
        description: 'เป้าหมายการลดน้ำหนักอย่างปลอดภัย',
        goal_type: GoalType.WEIGHT_LOSS,
        default_target_value: 5,
        default_unit: 'kg',
        default_duration_days: 90,
        default_priority: GoalPriority.HIGH,
        tags: ['น้ำหนัก', 'สุขภาพ', 'รูปร่าง'],
        category: 'น้ำหนัก',
      },
      {
        name: 'เพิ่มกล้ามเนื้อ',
        description: 'เป้าหมายการเพิ่มมวลกล้ามเนื้อ',
        goal_type: GoalType.MUSCLE_GAIN,
        default_target_value: 3,
        default_unit: 'kg',
        default_duration_days: 120,
        default_priority: GoalPriority.MEDIUM,
        tags: ['กล้ามเนื้อ', 'ออกกำลังกาย', 'ความแข็งแรง'],
        category: 'ฟิตเนส',
      },
      {
        name: 'วิ่งมาราธอน',
        description: 'เป้าหมายการวิ่งมาราธอน',
        goal_type: GoalType.ENDURANCE,
        default_target_value: 42.2,
        default_unit: 'km',
        default_duration_days: 180,
        default_priority: GoalPriority.HIGH,
        tags: ['วิ่ง', 'มาราธอน', 'ความทนทาน'],
        category: 'กีฬา',
      },
    ];

    return templates;
  }

  async getGoalRecommendations(
    userId: number,
  ): Promise<HealthGoalRecommendationDto[]> {
    // TODO: ใช้ AI หรือ algorithm เพื่อสร้างคำแนะนำ
    const user = await this.supabaseService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    const recommendations: HealthGoalRecommendationDto[] = [];

    // ตรวจสอบ BMI และแนะนำเป้าหมาย
    if (user.bmi && user.bmi > 25) {
      recommendations.push({
        title: 'ลดน้ำหนักเพื่อสุขภาพที่ดีขึ้น',
        description: 'น้ำหนักเกินเกณฑ์ ควรตั้งเป้าหมายการลดน้ำหนัก',
        goal_type: GoalType.WEIGHT_LOSS,
        suggested_target_value: Math.round(user.bmi - 22) * 2, // ลดให้ BMI ลงมาที่ 22
        suggested_unit: 'kg',
        suggested_duration_days: 90,
        suggested_priority: GoalPriority.HIGH,
        reasoning: `BMI ปัจจุบัน ${user.bmi.toFixed(1)} สูงกว่าเกณฑ์ปกติ (18.5-24.9)`,
        confidence_score: 0.9,
        related_goals: ['ออกกำลังกาย', 'ควบคุมอาหาร'],
      });
    }

    // ตรวจสอบเป้าหมายที่มีอยู่และแนะนำเพิ่มเติม
    const existingGoalTypes = user.healthGoals?.map((g) => g.goal_type) || [];

    if (!existingGoalTypes.includes(GoalType.ENDURANCE)) {
      recommendations.push({
        title: 'เพิ่มการออกกำลังกาย',
        description: 'ควรตั้งเป้าหมายการออกกำลังกายอย่างสม่ำเสมอ',
        goal_type: GoalType.ENDURANCE,
        suggested_target_value: 150,
        suggested_unit: 'นาที/สัปดาห์',
        suggested_duration_days: 30,
        suggested_priority: GoalPriority.MEDIUM,
        reasoning: 'ยังไม่มีเป้าหมายการออกกำลังกาย',
        confidence_score: 0.8,
        related_goals: ['ลดน้ำหนัก', 'เพิ่มกล้ามเนื้อ'],
      });
    }

    return recommendations;
  }

  // =====================================================
  // STATISTICS & ANALYTICS
  // =====================================================

  async getGoalStats(userId: number): Promise<HealthGoalStatsDto> {
    const goals = await this.supabaseService.getGoalStats(userId);

    const totalGoals = goals.length;
    const activeGoals = goals.filter(
      (g) => g.status === GoalStatus.ACTIVE,
    ).length;
    const completedGoals = goals.filter(
      (g) => g.status === GoalStatus.COMPLETED,
    ).length;
    const pausedGoals = goals.filter(
      (g) => g.status === GoalStatus.PAUSED,
    ).length;
    const cancelledGoals = goals.filter(
      (g) => g.status === GoalStatus.CANCELLED,
    ).length;
    const overdueGoals = goals.filter((g) => g.is_overdue).length;

    // สถิติตามประเภทเป้าหมาย
    const goalsByType = goals.reduce(
      (acc, goal) => {
        acc[goal.goal_type] = (acc[goal.goal_type] || 0) + 1;
        return acc;
      },
      {} as Record<GoalType, number>,
    );

    // สถิติตามความสำคัญ
    const goalsByPriority = goals.reduce(
      (acc, goal) => {
        acc[goal.priority] = (acc[goal.priority] || 0) + 1;
        return acc;
      },
      {} as Record<GoalPriority, number>,
    );

    // คำนวณสถิติอื่นๆ
    const completedGoalsWithDuration = goals.filter(
      (g) => g.status === GoalStatus.COMPLETED && g.start_date && g.updated_at,
    );

    let averageCompletionTime = 0;
    if (completedGoalsWithDuration.length > 0) {
      const totalDays = completedGoalsWithDuration.reduce((sum, goal) => {
        const start = new Date(goal.start_date);
        const end = new Date(goal.updated_at);
        return (
          sum +
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        );
      }, 0);
      averageCompletionTime = Math.round(
        totalDays / completedGoalsWithDuration.length,
      );
    }

    const successRate =
      totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // สถิติรายเดือน
    const monthlyProgress = await this.calculateMonthlyProgress(userId);

    return {
      total_goals: totalGoals,
      active_goals: activeGoals,
      completed_goals: completedGoals,
      paused_goals: pausedGoals,
      cancelled_goals: cancelledGoals,
      overdue_goals: overdueGoals,
      goals_by_type: goalsByType,
      goals_by_priority: goalsByPriority,
      average_completion_time_days: averageCompletionTime,
      success_rate_percentage: successRate,
      monthly_progress: monthlyProgress,
    };
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private mapToHealthGoalResponseDto(goal: HealthGoal): HealthGoalResponseDto {
    return {
      id: goal.id,
      userId: goal.userId,
      goal_type: goal.goal_type,
      title: goal.title,
      description: goal.description,
      target_value: goal.target_value,
      current_value: goal.current_value,
      unit: goal.unit,
      start_date: goal.start_date,
      target_date: goal.target_date,
      status: goal.status,
      priority: goal.priority,
      created_at: goal.created_at,
      updated_at: goal.updated_at,
      progress_percentage: goal.progress_percentage,
      is_overdue: goal.is_overdue,
      days_remaining: goal.days_remaining || undefined,
      is_completed: goal.is_completed,
      user: goal.user
        ? {
            id: goal.user.id,
            first_name: goal.user.first_name,
            last_name: goal.user.last_name,
            fullName: goal.user.fullName,
          }
        : undefined,
    };
  }

  private async calculateGoalStats(userId: number): Promise<any> {
    const goals = await this.supabaseService.getGoalStats(userId);

    const activeGoals = goals.filter(
      (g) => g.status === GoalStatus.ACTIVE,
    ).length;
    const completedGoals = goals.filter(
      (g) => g.status === GoalStatus.COMPLETED,
    ).length;
    const overdueGoals = goals.filter((g) => g.is_overdue).length;

    const totalProgress = goals.reduce(
      (sum, goal) => sum + goal.progress_percentage,
      0,
    );
    const averageProgress =
      goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;

    return {
      active_goals: activeGoals,
      completed_goals: completedGoals,
      overdue_goals: overdueGoals,
      total_progress: averageProgress,
    };
  }

  private async calculateMonthlyProgress(userId: number): Promise<any[]> {
    // TODO: คำนวณความคืบหน้ารายเดือนจากฐานข้อมูล
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyData: any[] = [];

    for (let i = 0; i < 6; i++) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;

      monthlyData.push({
        month: `${year}-${String(month + 1).padStart(2, '0')}`,
        goals_created: 0,
        goals_completed: 0,
        average_progress: 0,
      });
    }

    return monthlyData.reverse();
  }
}
