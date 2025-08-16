import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

@Entity('food_log')
export class FoodLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.foodLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: MealType,
  })
  meal_type: MealType;

  @Column({ type: 'varchar', length: 200 })
  food_name: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  calories: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  protein_g: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  carbs_g: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  fat_g: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  fiber_g: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  sugar_g: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  sodium_mg: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp' })
  consumed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Computed properties
  get total_nutrition() {
    return {
      calories: this.calories || 0,
      protein: this.protein_g || 0,
      carbs: this.carbs_g || 0,
      fat: this.fat_g || 0,
      fiber: this.fiber_g || 0,
      sugar: this.sugar_g || 0,
      sodium: this.sodium_mg || 0,
    };
  }

  get is_complete_nutrition(): boolean {
    return !!(this.calories && this.protein_g && this.carbs_g && this.fat_g);
  }

  get meal_time(): string {
    return this.consumed_at.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get meal_date(): string {
    return this.consumed_at.toLocaleDateString('th-TH');
  }
}
