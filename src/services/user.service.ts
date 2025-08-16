import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Gender, ActivityLevel } from '../entities/user.entity';
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
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // =====================================================
  // USER CRUD OPERATIONS
  // =====================================================

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // ตรวจสอบว่ามี username หรือ email ซ้ำหรือไม่
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว');
      }
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('อีเมลนี้มีอยู่ในระบบแล้ว');
      }
    }

    // เข้ารหัสพาสเวิร์ด
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // สร้างผู้ใช้ใหม่
    const user = this.userRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
      date_of_birth: createUserDto.date_of_birth
        ? new Date(createUserDto.date_of_birth)
        : null,
    });

    const savedUser = await this.userRepository.save(user);
    return this.mapToUserResponseDto(savedUser);
  }

  async findAllUsers(
    searchDto: UserSearchDto,
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    const {
      search,
      gender,
      activity_level,
      is_active,
      page = 1,
      limit = 10,
    } = searchDto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // เพิ่มเงื่อนไขการค้นหา
    if (search) {
      queryBuilder.andWhere(
        '(user.username ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (gender) {
      queryBuilder.andWhere('user.gender = :gender', { gender });
    }

    if (activity_level) {
      queryBuilder.andWhere('user.activity_level = :activity_level', {
        activity_level,
      });
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere('user.is_active = :is_active', { is_active });
    }

    // นับจำนวนทั้งหมด
    const total = await queryBuilder.getCount();

    // เพิ่มการแบ่งหน้าและเรียงลำดับ
    queryBuilder
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const users = await queryBuilder.getMany();
    const userResponses = users.map((user) => this.mapToUserResponseDto(user));

    return { users: userResponses, total };
  }

  async findUserById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }
    return this.mapToUserResponseDto(user);
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('ไม่พบชื่อผู้ใช้นี้');
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('ไม่พบอีเมลนี้');
    }
    return user;
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    // อัพเดทข้อมูล
    if (updateUserDto.date_of_birth) {
      updateUserDto.date_of_birth = new Date(updateUserDto.date_of_birth);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return this.mapToUserResponseDto(updatedUser);
  }

  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    // ตรวจสอบพาสเวิร์ดปัจจุบัน
    const isCurrentPasswordValid = await bcrypt.compare(
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
    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.new_password,
      12,
    );
    user.password_hash = hashedNewPassword;

    await this.userRepository.save(user);
    return { message: 'อัพเดทพาสเวิร์ดสำเร็จ' };
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    await this.userRepository.remove(user);
    return { message: 'ลบผู้ใช้สำเร็จ' };
  }

  async deactivateUser(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    user.is_active = false;
    await this.userRepository.save(user);
    return { message: 'ปิดการใช้งานผู้ใช้สำเร็จ' };
  }

  async activateUser(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้นี้');
    }

    user.is_active = true;
    await this.userRepository.save(user);
    return { message: 'เปิดการใช้งานผู้ใช้สำเร็จ' };
  }

  // =====================================================
  // USER PROFILE & DASHBOARD
  // =====================================================

  async getUserProfile(id: number): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'healthGoals',
        'foodLogs',
        'exerciseLogs',
        'sleepLogs',
        'waterLogs',
        'healthMetrics',
      ],
    });

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
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { is_active: true },
    });
    const inactiveUsers = totalUsers - activeUsers;

    // สถิติตามเพศ
    const usersByGender = await this.userRepository
      .createQueryBuilder('user')
      .select('user.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.gender')
      .getRawMany();

    const genderStats = usersByGender.reduce(
      (acc, curr) => {
        acc[curr.gender] = parseInt(curr.count);
        return acc;
      },
      {} as Record<Gender, number>,
    );

    // สถิติตามระดับกิจกรรม
    const usersByActivityLevel = await this.userRepository
      .createQueryBuilder('user')
      .select('user.activity_level', 'activity_level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.activity_level')
      .getRawMany();

    const activityStats = usersByActivityLevel.reduce(
      (acc, curr) => {
        acc[curr.activity_level] = parseInt(curr.count);
        return acc;
      },
      {} as Record<ActivityLevel, number>,
    );

    // สถิติอื่นๆ
    const today = new Date();
    const usersCreatedToday = await this.userRepository.count({
      where: {
        created_at: today,
      },
    });

    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const usersCreatedThisWeek = await this.userRepository.count({
      where: {
        created_at: weekAgo,
      },
    });

    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const usersCreatedThisMonth = await this.userRepository.count({
      where: {
        created_at: monthAgo,
      },
    });

    return {
      total_users: totalUsers,
      active_users: activeUsers,
      inactive_users: inactiveUsers,
      users_by_gender: genderStats,
      users_by_activity_level: activityStats,
      average_age: 0, // TODO: คำนวณอายุเฉลี่ย
      average_bmi: 0, // TODO: คำนวณ BMI เฉลี่ย
      users_created_today: usersCreatedToday,
      users_created_this_week: usersCreatedThisWeek,
      users_created_this_month: usersCreatedThisMonth,
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
      age: user.age,
      bmi: user.bmi,
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
