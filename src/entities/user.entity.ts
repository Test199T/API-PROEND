import { HealthGoal } from './health-goal.entity';
import { FoodLog } from './food-log.entity';
import { ExerciseLog } from './exercise-log.entity';
import { SleepLog } from './sleep-log.entity';
import { WaterLog } from './water-log.entity';
import { HealthMetric } from './health-metric.entity';
import { ChatSession } from './chat-session.entity';
import { Notification } from './notification.entity';
import { AIInsight } from './ai-insight.entity';
import { UserPreference } from './user-preference.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTREMELY_ACTIVE = 'extremely_active',
}

export class User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;

  // Relations
  healthGoals: HealthGoal[];
  foodLogs: FoodLog[];
  exerciseLogs: ExerciseLog[];
  sleepLogs: SleepLog[];
  waterLogs: WaterLog[];
  healthMetrics: HealthMetric[];
  chatSessions: ChatSession[];
  notifications: Notification[];
  aiInsights: AIInsight[];
  userPreference: UserPreference;

  // Computed properties
  get age(): number | null {
    if (!this.date_of_birth) return null;
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  get bmi(): number | null {
    if (!this.height_cm || !this.weight_kg) return null;
    const heightInMeters = this.height_cm / 100;
    return Number(
      (this.weight_kg / (heightInMeters * heightInMeters)).toFixed(2),
    );
  }

  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
