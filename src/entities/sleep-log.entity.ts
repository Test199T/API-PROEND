import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('sleep_log')
export class SleepLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.sleepLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  sleep_date: Date;

  @Column({ type: 'time', nullable: true })
  bedtime: string;

  @Column({ type: 'time', nullable: true })
  wake_time: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  total_sleep_hours: number;

  @Column({
    type: 'integer',
    nullable: true,
    check: 'sleep_quality >= 1 AND sleep_quality <= 10',
  })
  sleep_quality: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  deep_sleep_hours: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  rem_sleep_hours: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  light_sleep_hours: number;

  @Column({ type: 'text', nullable: true })
  sleep_notes: string;

  @Column({ type: 'text', array: true, nullable: true })
  factors_affecting_sleep: string[];

  @CreateDateColumn()
  created_at: Date;

  // Computed properties
  get sleep_efficiency(): number | null {
    if (!this.total_sleep_hours || !this.bedtime || !this.wake_time)
      return null;

    const bedtime = new Date(`2000-01-01 ${this.bedtime}`);
    const wakeTime = new Date(`2000-01-01 ${this.wake_time}`);

    if (wakeTime <= bedtime) {
      wakeTime.setDate(wakeTime.getDate() + 1);
    }

    const timeInBed =
      (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60 * 60);
    return Number(((this.total_sleep_hours / timeInBed) * 100).toFixed(1));
  }

  get sleep_quality_text(): string {
    if (!this.sleep_quality) return 'ไม่ระบุ';

    if (this.sleep_quality >= 9) return 'ดีมาก';
    if (this.sleep_quality >= 7) return 'ดี';
    if (this.sleep_quality >= 5) return 'ปานกลาง';
    if (this.sleep_quality >= 3) return 'ไม่ดี';
    return 'แย่มาก';
  }

  get sleep_quality_color(): string {
    if (!this.sleep_quality) return 'gray';

    if (this.sleep_quality >= 8) return 'green';
    if (this.sleep_quality >= 6) return 'yellow';
    if (this.sleep_quality >= 4) return 'orange';
    return 'red';
  }

  get is_adequate_sleep(): boolean {
    if (!this.total_sleep_hours) return false;
    return this.total_sleep_hours >= 7 && this.total_sleep_hours <= 9;
  }

  get sleep_cycle_count(): number | null {
    if (!this.total_sleep_hours) return null;
    // สมมติว่า 1 sleep cycle = 90 นาที
    return Math.round((this.total_sleep_hours * 60) / 90);
  }

  get sleep_date_formatted(): string {
    return this.sleep_date.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get bedtime_formatted(): string {
    if (!this.bedtime) return 'ไม่ระบุ';
    return this.bedtime;
  }

  get wake_time_formatted(): string {
    if (!this.wake_time) return 'ไม่ระบุ';
    return this.wake_time;
  }
}
