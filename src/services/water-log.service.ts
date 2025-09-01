import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class WaterLogService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createWaterLog(waterLogData: any) {
    return await this.supabaseService.createWaterLog(waterLogData);
  }

  async getWaterLogs(userId: number, query?: any) {
    return await this.supabaseService.getWaterLogs(userId, query);
  }

  async getWaterLogById(id: string, userId: number) {
    return await this.supabaseService.getWaterLogById(id, userId);
  }

  async updateWaterLog(id: string, userId: number, updateData: any) {
    return await this.supabaseService.updateWaterLog(id, userId, updateData);
  }

  async deleteWaterLog(id: string, userId: number) {
    return await this.supabaseService.deleteWaterLog(id, userId);
  }
}
