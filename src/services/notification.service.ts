import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class NotificationService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createNotification(notificationData: any) {
    return await this.supabaseService.createNotification(notificationData);
  }

  async getNotificationsByUserId(userId: number) {
    return await this.supabaseService.getNotificationsByUserId(userId);
  }

  async markNotificationAsRead(id: number) {
    return await this.supabaseService.markNotificationAsRead(id);
  }

  // User notification preferences (from user preferences)
  async getUserNotificationPreferences(userId: string) {
    return await this.supabaseService.getUserNotificationPreferences(userId);
  }

  async updateUserNotificationPreferences(userId: string, preferences: any) {
    return await this.supabaseService.updateUserNotificationPreferences(
      userId,
      preferences,
    );
  }
}
