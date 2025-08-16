import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class SleepLogService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createSleepLog(sleepLogData: any) {
    return await this.supabaseService.createSleepLog(sleepLogData);
  }

  async getSleepLogs(userId: number, query?: any) {
    return await this.supabaseService.getSleepLogs(userId, query);
  }

  async getSleepLogById(id: string, userId: number) {
    return await this.supabaseService.getSleepLogById(id, userId);
  }

  async updateSleepLog(id: string, userId: number, updateData: any) {
    return await this.supabaseService.updateSleepLog(id, userId, updateData);
  }

  async deleteSleepLog(id: string, userId: number) {
    return await this.supabaseService.deleteSleepLog(id, userId);
  }


}
