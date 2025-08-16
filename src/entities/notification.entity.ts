import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  REMINDER = 'reminder',
  ACHIEVEMENT = 'achievement',
  ALERT = 'alert',
  INFO = 'info',
  GOAL_UPDATE = 'goal_update',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    nullable: true,
  })
  notification_type: NotificationType;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date | null;

  // Computed properties
  get is_scheduled(): boolean {
    return !!this.scheduled_at;
  }

  get is_overdue(): boolean {
    if (!this.scheduled_at) return false;
    return new Date() > this.scheduled_at;
  }

  get is_urgent(): boolean {
    return this.priority === NotificationPriority.URGENT;
  }

  get is_high_priority(): boolean {
    return (
      this.priority === NotificationPriority.HIGH ||
      this.priority === NotificationPriority.URGENT
    );
  }

  get notification_icon(): string {
    const iconMap = {
      [NotificationType.REMINDER]: '⏰',
      [NotificationType.ACHIEVEMENT]: '🏆',
      [NotificationType.ALERT]: '⚠️',
      [NotificationType.INFO]: 'ℹ️',
      [NotificationType.GOAL_UPDATE]: '🎯',
    };

    return iconMap[this.notification_type] || '📢';
  }

  get priority_color(): string {
    const colorMap = {
      [NotificationPriority.LOW]: 'gray',
      [NotificationPriority.NORMAL]: 'blue',
      [NotificationPriority.HIGH]: 'orange',
      [NotificationPriority.URGENT]: 'red',
    };

    return colorMap[this.priority];
  }

  get priority_text(): string {
    const textMap = {
      [NotificationPriority.LOW]: 'ต่ำ',
      [NotificationPriority.NORMAL]: 'ปกติ',
      [NotificationPriority.HIGH]: 'สูง',
      [NotificationPriority.URGENT]: 'เร่งด่วน',
    };

    return textMap[this.priority];
  }

  get type_text(): string {
    const typeMap = {
      [NotificationType.REMINDER]: 'การแจ้งเตือน',
      [NotificationType.ACHIEVEMENT]: 'ความสำเร็จ',
      [NotificationType.ALERT]: 'คำเตือน',
      [NotificationType.INFO]: 'ข้อมูล',
      [NotificationType.GOAL_UPDATE]: 'อัพเดทเป้าหมาย',
    };

    return typeMap[this.notification_type] || 'การแจ้งเตือน';
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

  get scheduled_time_formatted(): string | null {
    if (!this.scheduled_at) return null;
    return this.scheduled_at.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get read_time_formatted(): string | null {
    if (!this.read_at) return null;
    return this.read_at.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  markAsRead(): void {
    this.is_read = true;
    this.read_at = new Date();
  }

  markAsUnread(): void {
    this.is_read = false;
    this.read_at = null;
  }
}
