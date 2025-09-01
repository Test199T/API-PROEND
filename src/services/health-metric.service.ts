import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class HealthMetricService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createHealthMetric(metricData: any) {
    return await this.supabaseService.createHealthMetric(metricData);
  }

  async getHealthMetricsByUserId(userId: number) {
    return await this.supabaseService.getHealthMetricsByUserId(userId);
  }

  async updateHealthMetric(id: string, userId: number, updateData: any) {
    return await this.supabaseService.updateHealthMetric(
      id,
      userId,
      updateData,
    );
  }

  async deleteHealthMetric(id: string, userId: number) {
    return await this.supabaseService.deleteHealthMetric(id, userId);
  }

  async getMetricsByType(userId: string, metricType: string, query?: any) {
    return await this.supabaseService.getMetricsByType(
      userId,
      metricType,
      query,
    );
  }

  async getLatestMetric(userId: string, metricType: string) {
    return await this.supabaseService.getLatestMetric(userId, metricType);
  }

  async getHealthMetricsSummary(
    userId: string,
    startDate: string,
    endDate: string,
  ) {
    return await this.supabaseService.getHealthMetricsSummary(
      userId,
      startDate,
      endDate,
    );
  }

  async getMetricTrends(userId: string, metricType: string, days: number = 30) {
    return await this.supabaseService.getMetricTrends(userId, metricType, days);
  }

  async getMetricRanges(userId: string, metricType: string, days?: number) {
    return await this.supabaseService.getMetricRanges(userId, metricType, days);
  }

  async createBulkHealthMetrics(metrics: any[]) {
    return await this.supabaseService.createBulkHealthMetrics(metrics);
  }

  async exportHealthMetrics(
    userId: string,
    format: string = 'json',
    query?: any,
  ) {
    return await this.supabaseService.exportHealthMetrics(
      userId,
      format,
      query,
    );
  }
}
