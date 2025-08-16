import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 50 })
  first_name: string;

  @Column({ type: 'varchar', length: 50 })
  last_name: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_kg: number;

  @Column({
    type: 'enum',
    enum: ActivityLevel,
    nullable: true,
  })
  activity_level: ActivityLevel;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Relations
  @OneToMany(() => HealthGoal, (healthGoal) => healthGoal.user)
  healthGoals: HealthGoal[];

  @OneToMany(() => FoodLog, (foodLog) => foodLog.user)
  foodLogs: FoodLog[];

  @OneToMany(() => ExerciseLog, (exerciseLog) => exerciseLog.user)
  exerciseLogs: ExerciseLog[];

  @OneToMany(() => SleepLog, (sleepLog) => sleepLog.user)
  sleepLogs: SleepLog[];

  @OneToMany(() => WaterLog, (waterLog) => waterLog.user)
  waterLogs: WaterLog[];

  @OneToMany(() => HealthMetric, (healthMetric) => healthMetric.user)
  healthMetrics: HealthMetric[];

  @OneToMany(() => ChatSession, (chatSession) => chatSession.user)
  chatSessions: ChatSession[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => AIInsight, (aiInsight) => aiInsight.user)
  aiInsights: AIInsight[];

  @OneToOne(() => UserPreference, (userPreference) => userPreference.user)
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
