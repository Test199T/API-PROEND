import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { CreateExerciseLogDto, UpdateExerciseLogDto, ExerciseLogQueryDto } from '../dto/exercise-log.dto';
import { ExerciseType, ExerciseIntensity } from '../entities/exercise-log.entity';

@Injectable()
export class ExerciseLogService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * สร้าง exercise log ใหม่
   */
  async createExerciseLog(exerciseLogData: CreateExerciseLogDto, userId: number) {
    try {
      // Validate exercise_type
      if (exerciseLogData.exercise_type && !Object.values(ExerciseType).includes(exerciseLogData.exercise_type)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: exercise_type ต้องเป็นหนึ่งใน ["cardio", "strength", "flexibility", "balance", "sports", "other"]');
      }

      // Validate duration_minutes
      if (exerciseLogData.duration_minutes && (exerciseLogData.duration_minutes <= 0 || !Number.isInteger(exerciseLogData.duration_minutes))) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: duration_minutes ต้องเป็น integer และมากกว่า 0');
      }

      // Validate sets and reps
      if (exerciseLogData.sets && (!Number.isInteger(exerciseLogData.sets) || exerciseLogData.sets <= 0)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: sets ต้องเป็น integer และมากกว่า 0');
      }
      if (exerciseLogData.reps && (!Number.isInteger(exerciseLogData.reps) || exerciseLogData.reps <= 0)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: reps ต้องเป็น integer และมากกว่า 0');
      }

      // Validate weight_kg and distance_km
      if (exerciseLogData.weight_kg && (typeof exerciseLogData.weight_kg !== 'number' || exerciseLogData.weight_kg <= 0)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: weight_kg ต้องเป็น float และมากกว่า 0');
      }
      if (exerciseLogData.distance_km && (typeof exerciseLogData.distance_km !== 'number' || exerciseLogData.distance_km <= 0)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: distance_km ต้องเป็น float และมากกว่า 0');
      }

      // Validate calories_burned
      if (exerciseLogData.calories_burned && (!Number.isInteger(exerciseLogData.calories_burned) || exerciseLogData.calories_burned < 0)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: calories_burned ต้องเป็น integer และมากกว่าหรือเท่ากับ 0');
      }

      // Validate intensity
      if (exerciseLogData.intensity && !Object.values(ExerciseIntensity).includes(exerciseLogData.intensity)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: intensity ต้องเป็นหนึ่งใน ["low", "moderate", "high", "very_high"]');
      }

      // Validate exercise_date format (YYYY-MM-DD)
      if (exerciseLogData.exercise_date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(exerciseLogData.exercise_date)) {
          throw new BadRequestException('ข้อมูลไม่ถูกต้อง: exercise_date ต้องเป็นรูปแบบ YYYY-MM-DD');
        }
      }

      // Validate exercise_time format (HH:MM:SS)
      if (exerciseLogData.exercise_time) {
        const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
        if (!timeRegex.test(exerciseLogData.exercise_time)) {
          throw new BadRequestException('ข้อมูลไม่ถูกต้อง: exercise_time ต้องเป็นรูปแบบ HH:MM:SS');
        }
      }

      // Check if user exists
      const userExists = await this.supabaseService.getUserById(userId);
      if (!userExists) {
        throw new BadRequestException('ไม่พบผู้ใช้ที่ระบุ');
      }

      const exerciseLog = await this.supabaseService.createExerciseLog({
        ...exerciseLogData,
        user_id: userId,
      });

      return exerciseLog;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  /**
   * ดึงข้อมูล exercise logs ของผู้ใช้
   */
  async getExerciseLogs(userId: number, query: ExerciseLogQueryDto) {
    try {
      const { page = 1, limit = 10, ...filters } = query;
      const offset = (page - 1) * limit;

      const exerciseLogs = await this.supabaseService.getExerciseLogs(userId, {
        ...filters,
        limit,
        offset,
      });

      return exerciseLogs;
    } catch (error) {
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  /**
   * ดึงข้อมูล exercise log ตาม ID
   */
  async getExerciseLog(id: string, userId: number) {
    try {
      const exerciseLog = await this.supabaseService.getExerciseLog(id, userId);
      
      if (!exerciseLog) {
        throw new NotFoundException('ไม่พบข้อมูล exercise log');
      }

      // Check if user owns this exercise log
      if (exerciseLog.user_id !== userId) {
        throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึง');
      }

      return exerciseLog;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  /**
   * อัปเดตข้อมูล exercise log
   */
  async updateExerciseLog(id: string, userId: number, updateData: UpdateExerciseLogDto) {
    try {
      // Check if exercise log exists and user owns it
      const existingLog = await this.supabaseService.getExerciseLog(id, userId);
      if (!existingLog) {
        throw new NotFoundException('ไม่พบข้อมูล exercise log');
      }

      if (existingLog.user_id !== userId) {
        throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึง');
      }

      // Validate updated data (same validation as create)
      if (updateData.exercise_type && !Object.values(ExerciseType).includes(updateData.exercise_type)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: exercise_type ต้องเป็นหนึ่งใน ["cardio", "strength", "flexibility", "balance", "sports", "other"]');
      }

      if (updateData.duration_minutes && (updateData.duration_minutes <= 0 || !Number.isInteger(updateData.duration_minutes))) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: duration_minutes ต้องเป็น integer และมากกว่า 0');
      }

      if (updateData.sets && (!Number.isInteger(updateData.sets) || updateData.sets <= 0)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: sets ต้องเป็น integer และมากกว่า 0');
      }

      if (updateData.reps && (!Number.isInteger(updateData.reps) || updateData.reps <= 0)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: reps ต้องเป็น integer และมากกว่า 0');
      }

      if (updateData.weight_kg && (typeof updateData.weight_kg !== 'number' || updateData.weight_kg <= 0)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: weight_kg ต้องเป็น float และมากกว่า 0');
      }

      if (updateData.distance_km && (typeof updateData.distance_km !== 'number' || updateData.distance_km <= 0)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: distance_km ต้องเป็น float และมากกว่า 0');
      }

      if (updateData.calories_burned && (!Number.isInteger(updateData.calories_burned) || updateData.calories_burned < 0)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: calories_burned ต้องเป็น integer และมากกว่าหรือเท่ากับ 0');
      }

      if (updateData.intensity && !Object.values(ExerciseIntensity).includes(updateData.intensity)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: intensity ต้องเป็นหนึ่งใน ["low", "moderate", "high", "very_high"]');
      }

      if (updateData.exercise_date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(updateData.exercise_date)) {
          throw new BadRequestException('ข้อมูลไม่ถูกต้อง: exercise_date ต้องเป็นรูปแบบ YYYY-MM-DD');
        }
      }

      if (updateData.exercise_time) {
        const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
        if (!timeRegex.test(updateData.exercise_time)) {
          throw new BadRequestException('ข้อมูลไม่ถูกต้อง: exercise_time ต้องเป็นรูปแบบ HH:MM:SS');
        }
      }

      const exerciseLog = await this.supabaseService.updateExerciseLog(id, userId, updateData);
      return exerciseLog;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  /**
   * ลบข้อมูล exercise log
   */
  async deleteExerciseLog(id: string, userId: number) {
    try {
      // Check if exercise log exists and user owns it
      const existingLog = await this.supabaseService.getExerciseLog(id, userId);
      if (!existingLog) {
        throw new NotFoundException('ไม่พบข้อมูล exercise log');
      }

      if (existingLog.user_id !== userId) {
        throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึง');
      }

      const deleted = await this.supabaseService.deleteExerciseLog(id, userId);
      return deleted;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  /**
   * ดึงข้อมูล exercise logs ตามประเภท
   */
  async getExerciseLogsByType(userId: number, exerciseType: string, query?: ExerciseLogQueryDto) {
    try {
      if (!Object.values(ExerciseType).includes(exerciseType as ExerciseType)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: exercise_type ไม่ถูกต้อง');
      }

      return await this.supabaseService.getExerciseLogsByType(userId, exerciseType, query);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  /**
   * ดึงสถิติ exercise log
   */
  async getExerciseLogStats(userId: number, date?: string) {
    try {
      return await this.supabaseService.getExerciseLogStats(userId, date);
    } catch (error) {
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  /**
   * ดึงแนวโน้ม exercise log
   */
  async getExerciseLogTrends(userId: number, days: number = 7) {
    try {
      if (days <= 0 || days > 365) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: days ต้องอยู่ระหว่าง 1-365');
      }
      return await this.supabaseService.getExerciseLogTrends(userId, days);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  /**
   * ดึงสรุปแคลอรี่ที่เผาผลาญ
   */
  async getCaloriesBurnedSummary(userId: number, startDate?: string, endDate?: string) {
    try {
      return await this.supabaseService.getCaloriesBurnedSummary(userId, startDate, endDate);
    } catch (error) {
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  /**
   * ดึงข้อมูล exercise streak ปัจจุบัน
   */
  async getCurrentExerciseStreak(userId: number) {
    try {
      return await this.supabaseService.getCurrentExerciseStreak(userId);
    } catch (error) {
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }
}
