import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum DrinkType {
  WATER = 'water',
  TEA = 'tea',
  COFFEE = 'coffee',
  JUICE = 'juice',
  SPORTS_DRINK = 'sports_drink',
  OTHER = 'other',
}

@Entity('water_log')
export class WaterLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.waterLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'integer' })
  amount_ml: number;

  @Column({
    type: 'enum',
    enum: DrinkType,
    default: DrinkType.WATER,
  })
  drink_type: DrinkType;

  @Column({ type: 'timestamp' })
  consumed_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  // Computed properties
  get amount_liters(): number {
    return Number((this.amount_ml / 1000).toFixed(2));
  }

  get amount_oz(): number {
    return Number((this.amount_ml * 0.033814).toFixed(1));
  }

  get drink_type_text(): string {
    const typeMap = {
      [DrinkType.WATER]: 'น้ำเปล่า',
      [DrinkType.TEA]: 'ชา',
      [DrinkType.COFFEE]: 'กาแฟ',
      [DrinkType.JUICE]: 'น้ำผลไม้',
      [DrinkType.SPORTS_DRINK]: 'เครื่องดื่มเกลือแร่',
      [DrinkType.OTHER]: 'อื่นๆ',
    };
    return typeMap[this.drink_type];
  }

  get drink_type_icon(): string {
    const iconMap = {
      [DrinkType.WATER]: '💧',
      [DrinkType.TEA]: '🍵',
      [DrinkType.COFFEE]: '☕',
      [DrinkType.JUICE]: '🧃',
      [DrinkType.SPORTS_DRINK]: '🥤',
      [DrinkType.OTHER]: '🥤',
    };
    return iconMap[this.drink_type];
  }

  get consumed_time(): string {
    return this.consumed_at.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get consumed_date(): string {
    return this.consumed_at.toLocaleDateString('th-TH');
  }

  get is_water(): boolean {
    return this.drink_type === DrinkType.WATER;
  }

  get is_caffeinated(): boolean {
    return (
      this.drink_type === DrinkType.COFFEE || this.drink_type === DrinkType.TEA
    );
  }
}
