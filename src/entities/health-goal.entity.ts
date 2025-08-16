import { User } from './user.entity';

export enum GoalType {
  WEIGHT_LOSS = 'weight_loss',
  WEIGHT_GAIN = 'weight_gain',
  MUSCLE_GAIN = 'muscle_gain',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  STRESS_REDUCTION = 'stress_reduction',
  SLEEP_IMPROVEMENT = 'sleep_improvement',
  NUTRITION = 'nutrition',
  OTHER = 'other',
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class HealthGoal {
  id: number;
  userId: number;
  user: User;
  goal_type: GoalType;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: Date;
  target_date: Date;
  status: GoalStatus;
  priority: GoalPriority;
  created_at: Date;
  updated_at: Date;

  // Computed properties
  get progress_percentage(): number {
    if (!this.target_value || this.target_value === 0) return 0;
    const percentage = (this.current_value / this.target_value) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  }

  get is_overdue(): boolean {
    if (!this.target_date || this.status !== GoalStatus.ACTIVE) return false;
    return new Date() > this.target_date;
  }

  get days_remaining(): number | null {
    if (!this.target_date || this.status !== GoalStatus.ACTIVE) return null;
    const today = new Date();
    const target = new Date(this.target_date);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get is_completed(): boolean {
    if (this.status === GoalStatus.COMPLETED) return true;
    if (!this.target_value || !this.current_value) return false;
    return Number(this.current_value) >= Number(this.target_value);
  }
}
