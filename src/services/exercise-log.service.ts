import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class ExerciseLogService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createExerciseLog(exerciseLogData: any) {
    return await this.supabaseService.createExerciseLog(exerciseLogData);
  }

  async getExerciseLogs(userId: number, query?: any) {
    return await this.supabaseService.getExerciseLogs(userId, query);
  }

  async getExerciseLog(id: string, userId: number) {
    return await this.supabaseService.getExerciseLog(id, userId);
  }

  async updateExerciseLog(id: string, userId: number, updateData: any) {
    return await this.supabaseService.updateExerciseLog(id, userId, updateData);
  }

  async deleteExerciseLog(id: string, userId: number) {
    return await this.supabaseService.deleteExerciseLog(id, userId);
  }

  async getExerciseLogsByType(
    userId: number,
    exerciseType: string,
    query?: any,
  ) {
    return await this.supabaseService.getExerciseLogsByType(
      userId,
      exerciseType,
      query,
    );
  }

  async getExerciseLogStats(userId: number, date?: string) {
    return await this.supabaseService.getExerciseLogStats(userId, date);
  }

  async getExerciseLogTrends(userId: number, days: number = 7) {
    return await this.supabaseService.getExerciseLogTrends(userId, days);
  }
}
