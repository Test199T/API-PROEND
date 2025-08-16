import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum InsightType {
  HEALTH_TREND = 'health_trend',
  NUTRITION_ADVICE = 'nutrition_advice',
  EXERCISE_RECOMMENDATION = 'exercise_recommendation',
  LIFESTYLE_SUGGESTION = 'lifestyle_suggestion',
  RISK_ASSESSMENT = 'risk_assessment',
  GOAL_PROGRESS = 'goal_progress',
}

@Entity('ai_insights')
export class AIInsight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.aiInsights, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: InsightType,
  })
  insight_type: InsightType;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
    check: 'confidence_score >= 0 AND confidence_score <= 1',
  })
  confidence_score: number;

  @Column({ type: 'text', array: true, nullable: true })
  data_sources: string[];

  @Column({ type: 'text', array: true, nullable: true })
  actionable_items: string[];

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'boolean', default: false })
  is_implemented: boolean;

  // Computed properties
  get is_expired(): boolean {
    if (!this.expires_at) return false;
    return new Date() > this.expires_at;
  }

  get is_recent(): boolean {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.created_at > oneWeekAgo;
  }

  get confidence_percentage(): number {
    if (!this.confidence_score) return 0;
    return Math.round(this.confidence_score * 100);
  }

  get confidence_level(): string {
    if (!this.confidence_score) return 'ไม่ระบุ';

    if (this.confidence_score >= 0.9) return 'สูงมาก';
    if (this.confidence_score >= 0.7) return 'สูง';
    if (this.confidence_score >= 0.5) return 'ปานกลาง';
    if (this.confidence_score >= 0.3) return 'ต่ำ';
    return 'ต่ำมาก';
  }

  get confidence_color(): string {
    if (!this.confidence_score) return 'gray';

    if (this.confidence_score >= 0.8) return 'green';
    if (this.confidence_score >= 0.6) return 'lightgreen';
    if (this.confidence_score >= 0.4) return 'yellow';
    if (this.confidence_score >= 0.2) return 'orange';
    return 'red';
  }

  get type_icon(): string {
    const iconMap = {
      [InsightType.HEALTH_TREND]: '📈',
      [InsightType.NUTRITION_ADVICE]: '🍎',
      [InsightType.EXERCISE_RECOMMENDATION]: '🏃',
      [InsightType.LIFESTYLE_SUGGESTION]: '💡',
      [InsightType.RISK_ASSESSMENT]: '⚠️',
      [InsightType.GOAL_PROGRESS]: '🎯',
    };

    return iconMap[this.insight_type];
  }

  get type_text(): string {
    const typeMap = {
      [InsightType.HEALTH_TREND]: 'แนวโน้มสุขภาพ',
      [InsightType.NUTRITION_ADVICE]: 'คำแนะนำโภชนาการ',
      [InsightType.EXERCISE_RECOMMENDATION]: 'คำแนะนำการออกกำลังกาย',
      [InsightType.LIFESTYLE_SUGGESTION]: 'คำแนะนำไลฟ์สไตล์',
      [InsightType.RISK_ASSESSMENT]: 'การประเมินความเสี่ยง',
      [InsightType.GOAL_PROGRESS]: 'ความคืบหน้าเป้าหมาย',
    };

    return typeMap[this.insight_type];
  }

  get days_until_expiry(): number | null {
    if (!this.expires_at) return null;

    const now = new Date();
    const diffTime = this.expires_at.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  get expiry_status(): string {
    if (!this.expires_at) return 'ไม่มีวันหมดอายุ';

    if (this.is_expired) return 'หมดอายุแล้ว';

    const daysLeft = this.days_until_expiry;
    if (daysLeft === 0) return 'หมดอายุวันนี้';
    if (daysLeft === 1) return 'หมดอายุพรุ่งนี้';
    if (daysLeft <= 7) return `หมดอายุใน ${daysLeft} วัน`;

    return `หมดอายุใน ${daysLeft} วัน`;
  }

  get created_time_ago(): string {
    const now = new Date();
    const diff = now.getTime() - this.created_at.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} วันที่แล้ว`;
    } else if (hours > 0) {
      return `${hours} ชั่วโมงที่แล้ว`;
    } else if (minutes > 0) {
      return `${minutes} นาทีที่แล้ว`;
    } else {
      return 'เมื่อสักครู่';
    }
  }

  get actionable_items_count(): number {
    return this.actionable_items ? this.actionable_items.length : 0;
  }

  get has_actionable_items(): boolean {
    return this.actionable_items_count > 0;
  }

  get data_sources_count(): number {
    return this.data_sources ? this.data_sources.length : 0;
  }

  get has_data_sources(): boolean {
    return this.data_sources_count > 0;
  }

  markAsImplemented(): void {
    this.is_implemented = true;
  }

  markAsNotImplemented(): void {
    this.is_implemented = false;
  }

  isHighConfidence(): boolean {
    return this.confidence_score >= 0.7;
  }

  isMediumConfidence(): boolean {
    return this.confidence_score >= 0.4 && this.confidence_score < 0.7;
  }

  isLowConfidence(): boolean {
    return this.confidence_score < 0.4;
  }
}
