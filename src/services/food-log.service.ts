import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class FoodLogService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createFoodLog(foodLogData: any) {
    return await this.supabaseService.createFoodLog(foodLogData);
  }

  async getFoodLogs(userId: number, query?: any) {
    return await this.supabaseService.getFoodLogs(userId, query);
  }

  async getFoodLog(id: string, userId: number) {
    return await this.supabaseService.getFoodLog(id, userId);
  }

  async updateFoodLog(id: string, userId: number, updateData: any) {
    return await this.supabaseService.updateFoodLog(id, userId, updateData);
  }

  async deleteFoodLog(id: string, userId: number) {
    return await this.supabaseService.deleteFoodLog(id, userId);
  }

  async getFoodLogsByMealType(userId: number, mealType: string, query?: any) {
    return await this.supabaseService.getFoodLogsByMealType(userId, mealType, query);
  }

  async getFoodLogStats(userId: number, date?: string) {
    return await this.supabaseService.getFoodLogStats(userId, date);
  }

  async getFoodLogTrends(userId: number, days: number = 7) {
    return await this.supabaseService.getFoodLogTrends(userId, days);
  }


}
