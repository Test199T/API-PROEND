import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { 
  CreateSleepLogDto, 
  UpdateSleepLogDto, 
  SleepLogSearchDto,
  SleepLogResponseDto,
  SleepLogListDto,
  SleepLogStatsDto,
  SleepLogTrendsDto,
  SleepLogAnalysisDto,
  SleepLogRecommendationDto
} from '../dto/sleep-log.dto';
import { SleepLog, SleepQuality } from '../entities/sleep-log.entity';

@Injectable()
export class SleepLogService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createSleepLog(sleepLogData: CreateSleepLogDto, userId: number): Promise<SleepLogResponseDto> {
    try {
      // Basic validation
      if (sleepLogData.sleep_duration_hours < 0 || sleepLogData.sleep_duration_hours > 24) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: sleep_duration_hours ต้องอยู่ระหว่าง 0-24');
      }

      if (!Object.values(SleepQuality).includes(sleepLogData.sleep_quality)) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: sleep_quality ไม่ถูกต้อง');
      }

      // Check if user exists
      const userExists = await this.supabaseService.getUserById(userId);
      if (!userExists) {
        throw new BadRequestException('ไม่พบผู้ใช้ที่ระบุ');
      }

      const sleepLog = await this.supabaseService.createSleepLog({
        ...sleepLogData,
        user_id: userId,
      });

      return this.mapToSleepLogResponseDto(sleepLog);
    } catch (error) {
      console.error('Create Sleep Log Error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`ข้อผิดพลาดภายในเซิร์ฟเวอร์: ${error.message}`);
    }
  }

  async getSleepLogs(userId: number, query: SleepLogSearchDto): Promise<SleepLogListDto> {
    try {
      const { page = 1, limit = 10, ...filters } = query;
      const offset = (page - 1) * limit;

      const sleepLogs = await this.supabaseService.getSleepLogs(userId, {
        ...filters,
        limit,
        offset,
      });

      const totalLogs = await this.supabaseService.getSleepLogs(userId, filters);
      const total = totalLogs.length;

      const sleepLogResponses = sleepLogs.map(log => this.mapToSleepLogResponseDto(log));

      return {
        sleep_logs: sleepLogResponses,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
        stats: {
          average_sleep_duration: 0,
          average_sleep_quality: 0,
          average_sleep_score: 0,
          total_sleep_logs: total,
        },
      };
    } catch (error) {
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  async getSleepLog(id: string, userId: number): Promise<SleepLogResponseDto> {
    try {
      const sleepLog = await this.supabaseService.getSleepLog(id, userId);
      
      if (!sleepLog) {
        throw new NotFoundException('ไม่พบข้อมูล sleep log');
      }

      if (sleepLog.user_id !== userId) {
        throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึง');
      }

      return this.mapToSleepLogResponseDto(sleepLog);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  async updateSleepLog(id: string, userId: number, updateData: UpdateSleepLogDto): Promise<SleepLogResponseDto> {
    try {
      const existingLog = await this.supabaseService.getSleepLog(id, userId);
      if (!existingLog) {
        throw new NotFoundException('ไม่พบข้อมูล sleep log');
      }

      if (existingLog.user_id !== userId) {
        throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึง');
      }

      const sleepLog = await this.supabaseService.updateSleepLog(id, userId, updateData);
      return this.mapToSleepLogResponseDto(sleepLog);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  async deleteSleepLog(id: string, userId: number): Promise<{ message: string }> {
    try {
      const existingLog = await this.supabaseService.getSleepLog(id, userId);
      if (!existingLog) {
        throw new NotFoundException('ไม่พบข้อมูล sleep log');
      }

      if (existingLog.user_id !== userId) {
        throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึง');
      }

      const deleted = await this.supabaseService.deleteSleepLog(id, userId);
      return deleted;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  async getSleepLogStats(userId: number, date?: string): Promise<SleepLogStatsDto> {
    try {
      const stats = await this.supabaseService.getSleepLogStats(userId, date);
      return stats as SleepLogStatsDto;
    } catch (error) {
      throw new BadRequestException('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  async getSleepLogTrends(userId: number, days: number = 7): Promise<SleepLogTrendsDto> {
    try {
      if (days <= 0 || days > 365) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: days ต้องอยู่ระหว่าง 1-365');
      }

      const trends = await this.supabaseService.getSleepLogTrends(userId, days);
      
      return {
        period: days <= 7 ? 'week' : days <= 30 ? 'month' : 'year',
        trends: trends,
        summary: {
          trend_direction: 'stable',
          average_change_percentage: 0,
          key_insights: [],
        },
      };
    } catch (error) {
      console.error('Get Sleep Log Trends Error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`ข้อผิดพลาดภายในเซิร์ฟเวอร์: ${error.message}`);
    }
  }

  async getSleepLogAnalysis(userId: number, days: number = 30): Promise<SleepLogAnalysisDto> {
    try {
      if (days <= 0 || days > 365) {
        throw new BadRequestException('ข้อมูลไม่ถูกต้อง: days ต้องอยู่ระหว่าง 1-365');
      }

      console.log(`Get Sleep Log Analysis Service: userId=${userId}, days=${days}`);
      const analysis = await this.supabaseService.getSleepLogAnalysis(userId, days);
      console.log('Analysis result from service:', analysis);
      return analysis as SleepLogAnalysisDto;
    } catch (error) {
      console.error('Get Sleep Log Analysis Service Error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`ข้อผิดพลาดภายในเซิร์ฟเวอร์: ${error.message}`);
    }
  }

  async getSleepRecommendations(userId: number): Promise<SleepLogRecommendationDto[]> {
    try {
      console.log(`Get Sleep Recommendations Service: userId=${userId}`);
      const allLogs = await this.supabaseService.getSleepLogsByUserId(userId);
      console.log(`Found ${allLogs.length} sleep logs for recommendations`);
      
      if (allLogs.length < 7) {
        const recommendations = [{
          category: 'data_collection',
          title: 'เริ่มบันทึกข้อมูลการนอน',
          description: 'บันทึกข้อมูลการนอนอย่างน้อย 7 วันเพื่อรับคำแนะนำที่แม่นยำ',
          priority: 'high' as const,
          actionable_steps: [
            'บันทึกเวลานอนและตื่นทุกวัน',
            'ให้คะแนนคุณภาพการนอน',
            'บันทึกปัจจัยที่อาจส่งผลต่อการนอน'
          ],
          expected_benefit: 'ได้รับข้อมูลที่แม่นยำสำหรับการวิเคราะห์',
          confidence_score: 1.0,
        }];
        console.log('Returning data collection recommendations:', recommendations);
        return recommendations;
      }

      console.log('Returning empty recommendations array');
      return [];
    } catch (error) {
      console.error('Get Sleep Recommendations Service Error:', error);
      throw new BadRequestException(`ข้อผิดพลาดภายในเซิร์ฟเวอร์: ${error.message}`);
    }
  }

  private mapToSleepLogResponseDto(sleepLog: any): SleepLogResponseDto {
    const sleepLogEntity = new SleepLog();
    Object.assign(sleepLogEntity, {
      ...sleepLog,
      sleep_date: new Date(sleepLog.sleep_date),
      created_at: new Date(sleepLog.created_at),
      updated_at: new Date(sleepLog.updated_at)
    });

    return {
      id: sleepLog.id,
      userId: sleepLog.user_id,
      sleep_date: new Date(sleepLog.sleep_date),
      bedtime: sleepLog.bedtime,
      wake_time: sleepLog.wake_time,
      sleep_duration_hours: sleepLog.sleep_duration_hours || 0,
      sleep_quality: sleepLog.sleep_quality,
      sleep_efficiency_percentage: sleepLog.sleep_efficiency_percentage || 0,
      time_to_fall_asleep_minutes: sleepLog.time_to_fall_asleep_minutes || 0,
      awakenings_count: sleepLog.awakenings_count || 0,
      
      // Sleep stages
      deep_sleep_minutes: sleepLog.deep_sleep_minutes || 0,
      light_sleep_minutes: sleepLog.light_sleep_minutes || 0,
      rem_sleep_minutes: sleepLog.rem_sleep_minutes || 0,
      awake_minutes: sleepLog.awake_minutes || 0,
      
      // Heart rate metrics
      heart_rate_avg: sleepLog.heart_rate_avg || 0,
      heart_rate_min: sleepLog.heart_rate_min || 0,
      heart_rate_max: sleepLog.heart_rate_max || 0,
      oxygen_saturation_avg: sleepLog.oxygen_saturation_avg || 0,
      
      // Environmental factors
      room_temperature_celsius: sleepLog.room_temperature_celsius || 0,
      noise_level_db: sleepLog.noise_level_db || 0,
      light_level_lux: sleepLog.light_level_lux || 0,
      
      // Lifestyle factors
      caffeine_intake_mg: sleepLog.caffeine_intake_mg || 0,
      alcohol_intake_ml: sleepLog.alcohol_intake_ml || 0,
      exercise_before_bed_hours: sleepLog.exercise_before_bed_hours || 0,
      screen_time_before_bed_minutes: sleepLog.screen_time_before_bed_minutes || 0,
      
      // Sleep aids and medications
      sleep_aids_used: sleepLog.sleep_aids_used || [],
      medications_taken: sleepLog.medications_taken || [],
      
      // Subjective ratings
      stress_level: sleepLog.stress_level || 0,
      mood_before_sleep: sleepLog.mood_before_sleep || 0,
      mood_after_wake: sleepLog.mood_after_wake || 0,
      energy_level: sleepLog.energy_level || 0,
      
      // Notes and observations
      notes: sleepLog.notes || '',
      dreams_remembered: sleepLog.dreams_remembered || false,
      nightmares: sleepLog.nightmares || false,
      
      // Timestamps
      created_at: new Date(sleepLog.created_at),
      updated_at: new Date(sleepLog.updated_at),
      
      // Computed properties
      total_sleep_time_minutes: sleepLogEntity.total_sleep_time_minutes,
      deep_sleep_percentage: sleepLogEntity.deep_sleep_percentage,
      light_sleep_percentage: sleepLogEntity.light_sleep_percentage,
      rem_sleep_percentage: sleepLogEntity.rem_sleep_percentage,
      awake_percentage: sleepLogEntity.awake_percentage,
      sleep_duration_formatted: sleepLogEntity.sleep_duration_formatted,
      bedtime_formatted: sleepLogEntity.bedtime_formatted,
      wake_time_formatted: sleepLogEntity.wake_time_formatted,
      sleep_date_formatted: sleepLogEntity.sleep_date_formatted,
      is_healthy_sleep_duration: sleepLogEntity.is_healthy_sleep_duration,
      is_healthy_sleep_efficiency: sleepLogEntity.is_healthy_sleep_efficiency,
      is_healthy_time_to_fall_asleep: sleepLogEntity.is_healthy_time_to_fall_asleep,
      sleep_score: sleepLogEntity.sleep_score,
      sleep_quality_description: sleepLogEntity.sleep_quality_description,
      sleep_score_description: sleepLogEntity.sleep_score_description,
      
      // User information
      user: sleepLog.user ? {
        id: sleepLog.user.id,
        first_name: sleepLog.user.first_name,
        last_name: sleepLog.user.last_name,
        fullName: sleepLog.user.fullName,
      } : undefined,
    };
  }
}