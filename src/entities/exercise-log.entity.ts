import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ExerciseType {
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
  SPORTS = 'sports',
  OTHER = 'other',
}

export enum ExerciseIntensity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

@Entity('exercise_log')
export class ExerciseLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.exerciseLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 200 })
  exercise_name: string;

  @Column({
    type: 'enum',
    enum: ExerciseType,
    nullable: true,
  })
  exercise_type: ExerciseType;

  @Column({ type: 'integer', nullable: true })
  duration_minutes: number;

  @Column({ type: 'integer', nullable: true })
  sets: number;

  @Column({ type: 'integer', nullable: true })
  reps: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  weight_kg: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  distance_km: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  calories_burned: number;

  @Column({
    type: 'enum',
    enum: ExerciseIntensity,
    nullable: true,
  })
  intensity: ExerciseIntensity;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'date' })
  exercise_date: Date;

  @Column({ type: 'time', nullable: true })
  exercise_time: string;

  @CreateDateColumn()
  created_at: Date;

  // Computed properties
  get total_volume(): number | null {
    if (this.sets && this.reps) {
      return this.sets * this.reps;
    }
    return null;
  }

  get is_strength_training(): boolean {
    return (
      this.exercise_type === ExerciseType.STRENGTH &&
      (!!this.sets || !!this.reps || !!this.weight_kg)
    );
  }

  get is_cardio(): boolean {
    return (
      this.exercise_type === ExerciseType.CARDIO &&
      (!!this.duration_minutes || !!this.distance_km)
    );
  }

  get exercise_duration_formatted(): string {
    if (!this.duration_minutes) return '';

    const hours = Math.floor(this.duration_minutes / 60);
    const minutes = this.duration_minutes % 60;

    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`;
    }
    return `${minutes} นาที`;
  }

  get exercise_date_formatted(): string {
    return this.exercise_date.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get calories_per_minute(): number | null {
    if (this.calories_burned && this.duration_minutes) {
      return Number((this.calories_burned / this.duration_minutes).toFixed(2));
    }
    return null;
  }
}
