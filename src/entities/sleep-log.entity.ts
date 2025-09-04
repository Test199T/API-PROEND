import { User } from './user.entity';

export enum SleepQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  VERY_POOR = 'very_poor',
}

export enum SleepStage {
  DEEP = 'deep',
  LIGHT = 'light',
  REM = 'rem',
  AWAKE = 'awake',
}

export class SleepLog {
  id: number;
  userId: number;
  user: User;
  
  // Basic sleep information
  sleep_date: Date;
  bedtime: string; // HH:MM format
  wake_time: string; // HH:MM format
  sleep_duration_hours: number;
  
  // Sleep quality and metrics
  sleep_quality: SleepQuality;
  sleep_efficiency_percentage: number; // percentage of time actually sleeping
  time_to_fall_asleep_minutes: number; // minutes to fall asleep
  awakenings_count: number; // number of times woke up during night
  
  // Sleep stages (in minutes)
  deep_sleep_minutes: number;
  light_sleep_minutes: number;
  rem_sleep_minutes: number;
  awake_minutes: number;
  
  // Additional metrics
  heart_rate_avg: number; // average heart rate during sleep
  heart_rate_min: number; // minimum heart rate during sleep
  heart_rate_max: number; // maximum heart rate during sleep
  oxygen_saturation_avg: number; // average oxygen saturation
  
  // Environmental factors
  room_temperature_celsius: number;
  noise_level_db: number;
  light_level_lux: number;
  
  // Lifestyle factors
  caffeine_intake_mg: number; // caffeine consumed before sleep
  alcohol_intake_ml: number; // alcohol consumed before sleep
  exercise_before_bed_hours: number; // hours between last exercise and bedtime
  screen_time_before_bed_minutes: number; // minutes of screen time before bed
  
  // Sleep aids and medications
  sleep_aids_used: string[]; // array of sleep aids used
  medications_taken: string[]; // array of medications taken
  
  // Subjective ratings (1-10 scale)
  stress_level: number;
  mood_before_sleep: number;
  mood_after_wake: number;
  energy_level: number;
  
  // Notes and observations
  notes: string;
  dreams_remembered: boolean;
  nightmares: boolean;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;

  // Computed properties
  get total_sleep_time_minutes(): number {
    return this.sleep_duration_hours * 60;
  }

  get sleep_stages_total_minutes(): number {
    return this.deep_sleep_minutes + this.light_sleep_minutes + 
           this.rem_sleep_minutes + this.awake_minutes;
  }

  get deep_sleep_percentage(): number {
    if (this.total_sleep_time_minutes === 0) return 0;
    return Math.round((this.deep_sleep_minutes / this.total_sleep_time_minutes) * 100);
  }

  get light_sleep_percentage(): number {
    if (this.total_sleep_time_minutes === 0) return 0;
    return Math.round((this.light_sleep_minutes / this.total_sleep_time_minutes) * 100);
  }

  get rem_sleep_percentage(): number {
    if (this.total_sleep_time_minutes === 0) return 0;
    return Math.round((this.rem_sleep_minutes / this.total_sleep_time_minutes) * 100);
  }

  get awake_percentage(): number {
    if (this.total_sleep_time_minutes === 0) return 0;
    return Math.round((this.awake_minutes / this.total_sleep_time_minutes) * 100);
  }

  get sleep_duration_formatted(): string {
    const hours = Math.floor(this.sleep_duration_hours);
    const minutes = Math.round((this.sleep_duration_hours - hours) * 60);
    
    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`;
    }
    return `${minutes} นาที`;
  }

  get bedtime_formatted(): string {
    return this.bedtime;
  }

  get wake_time_formatted(): string {
    return this.wake_time;
  }

  get sleep_date_formatted(): string {
    return this.sleep_date.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get is_healthy_sleep_duration(): boolean {
    // Healthy sleep duration is typically 7-9 hours for adults
    return this.sleep_duration_hours >= 7 && this.sleep_duration_hours <= 9;
  }

  get is_healthy_sleep_efficiency(): boolean {
    // Healthy sleep efficiency is typically 85% or higher
    return this.sleep_efficiency_percentage >= 85;
  }

  get is_healthy_time_to_fall_asleep(): boolean {
    // Healthy time to fall asleep is typically 10-20 minutes
    return this.time_to_fall_asleep_minutes >= 10 && this.time_to_fall_asleep_minutes <= 20;
  }

  get sleep_score(): number {
    // Calculate overall sleep score (0-100)
    let score = 0;
    
    // Sleep duration (30 points)
    if (this.is_healthy_sleep_duration) {
      score += 30;
    } else if (this.sleep_duration_hours >= 6 && this.sleep_duration_hours < 7) {
      score += 20;
    } else if (this.sleep_duration_hours >= 9 && this.sleep_duration_hours <= 10) {
      score += 25;
    } else {
      score += 10;
    }
    
    // Sleep efficiency (25 points)
    if (this.is_healthy_sleep_efficiency) {
      score += 25;
    } else if (this.sleep_efficiency_percentage >= 75) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Time to fall asleep (20 points)
    if (this.is_healthy_time_to_fall_asleep) {
      score += 20;
    } else if (this.time_to_fall_asleep_minutes <= 30) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Sleep quality (15 points)
    switch (this.sleep_quality) {
      case SleepQuality.EXCELLENT:
        score += 15;
        break;
      case SleepQuality.GOOD:
        score += 12;
        break;
      case SleepQuality.FAIR:
        score += 8;
        break;
      case SleepQuality.POOR:
        score += 4;
        break;
      case SleepQuality.VERY_POOR:
        score += 0;
        break;
    }
    
    // Awakenings (10 points)
    if (this.awakenings_count <= 1) {
      score += 10;
    } else if (this.awakenings_count <= 3) {
      score += 7;
    } else if (this.awakenings_count <= 5) {
      score += 4;
    } else {
      score += 0;
    }
    
    return Math.min(score, 100);
  }

  get sleep_quality_description(): string {
    switch (this.sleep_quality) {
      case SleepQuality.EXCELLENT:
        return 'ยอดเยี่ยม';
      case SleepQuality.GOOD:
        return 'ดี';
      case SleepQuality.FAIR:
        return 'ปานกลาง';
      case SleepQuality.POOR:
        return 'แย่';
      case SleepQuality.VERY_POOR:
        return 'แย่มาก';
      default:
        return 'ไม่ระบุ';
    }
  }

  get sleep_score_description(): string {
    if (this.sleep_score >= 90) return 'ยอดเยี่ยม';
    if (this.sleep_score >= 80) return 'ดีมาก';
    if (this.sleep_score >= 70) return 'ดี';
    if (this.sleep_score >= 60) return 'ปานกลาง';
    if (this.sleep_score >= 50) return 'แย่';
    return 'แย่มาก';
  }
}