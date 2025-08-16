import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { User, Gender, ActivityLevel } from '../entities/user.entity';
import { SupabaseService } from './supabase.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  UserResponseDto,
  UserProfileDto,
  UserSearchDto,
  UserStatsDto,
  UserDashboardDto,
} from '../dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private async hashPassword(password: string): Promise<string> {
    // ใช้ crypto module แทน bcrypt
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  }

  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }

  // =====================================================
  // USER CRUD OPERATIONS
  // =====================================================

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // ตรวจสอบว่ามี username หรือ email ซ้ำหรือไม่
    const existingUser = await this.supabaseService.getUserByUsername(
      createUserDto.username,
    );
    if (existingUser) {
      throw new ConflictException('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว');
    }

    const existingEmail = await this.supabaseService.getUserByEmail(
      createUserDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('อีเมลนี้มีอยู่ในระบบแล้ว');
    }

    // เข้ารหัสพาสเวิร์ด
    const hashedPassword = await this.hashPassword(createUserDto.password);

    // สร้างผู้ใช้ใหม่
    const userData = {
      ...createUserDto,
      password_hash: hashedPassword,
      date_of_birth: createUserDto.date_of_birth || null,
    };

    const savedUser = await this.supabaseService.createUser(userData);
    return this.mapToUserResponseDto(savedUser);
  }

  async findAllUsers(
    searchDto: UserSearchDto,
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    // TODO: Implement search with Supabase
    // For now, return empty result
    return { users: [], total: 0 };
  }

  async findUserById(id: number): Promise<UserResponseDto> {
    const user = await this.supabaseService.getUserById(id);
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }
    return this.mapToUserResponseDto(user);
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.supabaseService.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException('ไม่พบชื่อผู้ใช้นี้');
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.supabaseService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('ไม่พบอีเมลนี้');
    }
    return user;
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.supabaseService.getUserById(id);
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    // อัพเดทข้อมูล
    if (updateUserDto.date_of_birth) {
      updateUserDto.date_of_birth = updateUserDto.date_of_birth;
    }

    const updatedUser = await this.supabaseService.updateUser(
      id,
      updateUserDto,
    );
    return this.mapToUserResponseDto(updatedUser);
  }

  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.supabaseService.getUserById(id);
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    // ตรวจสอบพาสเวิร์ดปัจจุบัน
    const isCurrentPasswordValid = await this.verifyPassword(
      updatePasswordDto.current_password,
      user.password_hash,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('พาสเวิร์ดปัจจุบันไม่ถูกต้อง');
    }

    // ตรวจสอบว่าพาสเวิร์ดใหม่ตรงกับยืนยันหรือไม่
    if (updatePasswordDto.new_password !== updatePasswordDto.confirm_password) {
      throw new BadRequestException('พาสเวิร์ดใหม่ไม่ตรงกับยืนยัน');
    }

    // เข้ารหัสพาสเวิร์ดใหม่
    const hashedNewPassword = await this.hashPassword(
      updatePasswordDto.new_password,
    );

    await this.supabaseService.updateUser(id, {
      password_hash: hashedNewPassword,
    });
    return { message: 'อัพเดทพาสเวิร์ดสำเร็จ' };
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.supabaseService.getUserById(id);
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    // TODO: Implement delete with Supabase
    return { message: 'ลบผู้ใช้สำเร็จ' };
  }

  async deactivateUser(id: number): Promise<{ message: string }> {
    const user = await this.supabaseService.getUserById(id);
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    await this.supabaseService.updateUser(id, { is_active: false });
    return { message: 'ปิดการใช้งานผู้ใช้สำเร็จ' };
  }

  async activateUser(id: number): Promise<{ message: string }> {
    const user = await this.supabaseService.getUserById(id);
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    await this.supabaseService.updateUser(id, { is_active: true });
    return { message: 'เปิดการใช้งานผู้ใช้สำเร็จ' };
  }

  // =====================================================
  // USER PROFILE & DASHBOARD
  // =====================================================

  async getUserProfile(id: number): Promise<UserProfileDto> {
    const user = await this.supabaseService.getUserById(id);

    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    return this.mapToUserProfileDto(user);
  }

  async getUserDashboard(id: number): Promise<UserDashboardDto> {
    const user = await this.getUserProfile(id);

    // คำนวณสถิติวันนี้
    const today = new Date();
    const todayStats = await this.calculateTodayStats(id, today);

    // คำนวณสถิติสัปดาห์นี้
    const weekStats = await this.calculateWeekStats(id, today);

    // คำนวณสถิติเดือนนี้
    const monthStats = await this.calculateMonthStats(id, today);

    // กิจกรรมล่าสุด
    const recentActivities = await this.getRecentActivities(id);

    // เป้าหมายที่กำลังดำเนินการ
    const upcomingGoals = await this.getUpcomingGoals(id);

    // เคล็ดลับสุขภาพ
    const healthTips = this.generateHealthTips(user, todayStats);

    return {
      user,
      today_stats: todayStats,
      weekly_stats: weekStats,
      monthly_stats: monthStats,
      recent_activities: recentActivities,
      upcoming_goals: upcomingGoals,
      health_tips: healthTips,
    };
  }

  // =====================================================
  // STATISTICS & ANALYTICS
  // =====================================================

  async getUserStats(): Promise<UserStatsDto> {
    // TODO: Implement stats with Supabase
    // For now, return empty stats
    return {
      total_users: 0,
      active_users: 0,
      inactive_users: 0,
      users_by_gender: {} as Record<Gender, number>,
      users_by_activity_level: {} as Record<ActivityLevel, number>,
      average_age: 0,
      average_bmi: 0,
      users_created_today: 0,
      users_created_this_week: 0,
      users_created_this_month: 0,
    };
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private mapToUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      height_cm: user.height_cm,
      weight_kg: user.weight_kg,
      activity_level: user.activity_level,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_active: user.is_active,
      age: user.age || undefined,
      bmi: user.bmi || undefined,
      fullName: user.fullName,
    };
  }

  private mapToUserProfileDto(user: User): UserProfileDto {
    return {
      ...this.mapToUserResponseDto(user),
      healthGoals: user.healthGoals || [],
      recentFoodLogs: user.foodLogs || [],
      recentExerciseLogs: user.exerciseLogs || [],
      recentSleepLogs: user.sleepLogs || [],
      recentWaterLogs: user.waterLogs || [],
      healthMetrics: user.healthMetrics || [],
    };
  }

  private async calculateTodayStats(userId: number, date: Date): Promise<any> {
    // TODO: คำนวณสถิติวันนี้จากฐานข้อมูล
    return {
      calories_consumed: 0,
      calories_burned: 0,
      water_consumed_ml: 0,
      sleep_hours: 0,
      sleep_quality: 0,
    };
  }

  private async calculateWeekStats(userId: number, date: Date): Promise<any> {
    // TODO: คำนวณสถิติสัปดาห์นี้จากฐานข้อมูล
    return {
      total_calories: 0,
      total_exercise_minutes: 0,
      average_sleep_hours: 0,
      average_water_ml: 0,
    };
  }

  private async calculateMonthStats(userId: number, date: Date): Promise<any> {
    // TODO: คำนวณสถิติเดือนนี้จากฐานข้อมูล
    return {
      weight_change: 0,
      bmi_change: 0,
      goals_completed: 0,
      goals_in_progress: 0,
    };
  }

  private async getRecentActivities(userId: number): Promise<any[]> {
    // TODO: ดึงกิจกรรมล่าสุดจากฐานข้อมูล
    return [];
  }

  private async getUpcomingGoals(userId: number): Promise<any[]> {
    // TODO: ดึงเป้าหมายที่กำลังดำเนินการจากฐานข้อมูล
    return [];
  }

  private generateHealthTips(user: UserProfileDto, todayStats: any): string[] {
    const tips: string[] = [];

    // เคล็ดลับตามข้อมูลสุขภาพ
    if (user.bmi && user.bmi > 25) {
      tips.push('น้ำหนักเกินเกณฑ์ ควรออกกำลังกายและควบคุมอาหาร');
    }

    if (todayStats.calories_consumed < 1200) {
      tips.push('แคลอรี่ที่บริโภคต่ำเกินไป ควรเพิ่มอาหารที่มีประโยชน์');
    }

    if (todayStats.sleep_hours < 7) {
      tips.push('ควรนอนให้ได้ 7-9 ชั่วโมงต่อวัน');
    }

    if (todayStats.water_consumed_ml < 2000) {
      tips.push('ควรดื่มน้ำให้ได้ 2-3 ลิตรต่อวัน');
    }

    if (tips.length === 0) {
      tips.push('สุขภาพดีแล้ว! ดูแลตัวเองต่อไป');
    }

    return tips;
  }
}
