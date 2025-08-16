import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('health_metrics')
export class HealthMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.healthMetrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  metric_date: Date;

  @Column({ type: 'integer', nullable: true })
  blood_pressure_systolic: number;

  @Column({ type: 'integer', nullable: true })
  blood_pressure_diastolic: number;

  @Column({ type: 'integer', nullable: true })
  heart_rate: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  body_temperature: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  blood_sugar_mg_dl: number;

  @Column({ type: 'integer', nullable: true })
  cholesterol_total: number;

  @Column({ type: 'integer', nullable: true })
  cholesterol_hdl: number;

  @Column({ type: 'integer', nullable: true })
  cholesterol_ldl: number;

  @Column({ type: 'integer', nullable: true })
  triglycerides: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  bmi: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  body_fat_percentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  muscle_mass_kg: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  // Computed properties
  get blood_pressure_formatted(): string | null {
    if (!this.blood_pressure_systolic || !this.blood_pressure_diastolic)
      return null;
    return `${this.blood_pressure_systolic}/${this.blood_pressure_diastolic} mmHg`;
  }

  get blood_pressure_category(): string | null {
    if (!this.blood_pressure_systolic || !this.blood_pressure_diastolic)
      return null;

    const systolic = this.blood_pressure_systolic;
    const diastolic = this.blood_pressure_diastolic;

    if (systolic < 120 && diastolic < 80) return 'ปกติ';
    if (systolic < 130 && diastolic < 80) return 'สูงเล็กน้อย';
    if (systolic < 140 && diastolic < 90) return 'สูงเล็กน้อย';
    if (systolic < 160 && diastolic < 100) return 'สูงปานกลาง';
    if (systolic < 180 && diastolic < 110) return 'สูงมาก';
    return 'สูงมากมาก';
  }

  get heart_rate_category(): string | null {
    if (!this.heart_rate) return null;

    if (this.heart_rate < 60) return 'ช้า';
    if (this.heart_rate <= 100) return 'ปกติ';
    if (this.heart_rate <= 120) return 'เร็วเล็กน้อย';
    return 'เร็วมาก';
  }

  get bmi_category(): string | null {
    if (!this.bmi) return null;

    if (this.bmi < 18.5) return 'น้ำหนักต่ำกว่าเกณฑ์';
    if (this.bmi < 25) return 'น้ำหนักปกติ';
    if (this.bmi < 30) return 'น้ำหนักเกิน';
    if (this.bmi < 35) return 'อ้วนระดับ 1';
    if (this.bmi < 40) return 'อ้วนระดับ 2';
    return 'อ้วนระดับ 3';
  }

  get body_fat_category(): string | null {
    if (!this.body_fat_percentage) return null;

    // สำหรับผู้ชาย
    if (this.body_fat_percentage < 6) return 'ต่ำมาก';
    if (this.body_fat_percentage < 14) return 'ต่ำ';
    if (this.body_fat_percentage < 18) return 'ปกติ';
    if (this.body_fat_percentage < 25) return 'สูง';
    return 'สูงมาก';
  }

  get is_healthy_bmi(): boolean {
    if (!this.bmi) return false;
    return this.bmi >= 18.5 && this.bmi < 25;
  }

  get is_healthy_blood_pressure(): boolean {
    if (!this.blood_pressure_systolic || !this.blood_pressure_diastolic)
      return false;
    return (
      this.blood_pressure_systolic < 130 && this.blood_pressure_diastolic < 80
    );
  }

  get is_healthy_heart_rate(): boolean {
    if (!this.heart_rate) return false;
    return this.heart_rate >= 60 && this.heart_rate <= 100;
  }

  get metric_date_formatted(): string {
    return this.metric_date.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get has_complete_metrics(): boolean {
    return !!(
      this.bmi &&
      this.heart_rate &&
      this.blood_pressure_systolic &&
      this.blood_pressure_diastolic
    );
  }
}
