import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ChatSession } from './chat-session.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VOICE = 'voice',
}

export enum UserFeedback {
  THUMBS_UP = 'thumbs_up',
  THUMBS_DOWN = 'thumbs_down',
  NONE = 'none',
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id' })
  sessionId: number;

  @ManyToOne(() => ChatSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: ChatSession;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.chatSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  message_text: string;

  @Column({ type: 'boolean' })
  is_user_message: boolean;

  // เก็บ url หรือ path ของไฟล์ภาพ (ถ้ามี)
  @Column({ name: 'image_url', type: 'text', nullable: true })
  image_url?: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  message_type: MessageType;

  @Column()
  ai_response_quality: number;

  @Column({
    type: 'enum',
    enum: UserFeedback,
    default: UserFeedback.NONE,
  })
  user_feedback: UserFeedback;

  // Computed properties
  get is_ai_message(): boolean {
    return !this.is_user_message;
  }

  get message_time(): string {
    return this.timestamp.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get message_date(): string {
    return this.timestamp.toLocaleDateString('th-TH');
  }

  get message_datetime(): string {
    return this.timestamp.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get is_recent(): boolean {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    return this.timestamp > oneHourAgo;
  }

  get quality_text(): string {
    if (!this.ai_response_quality) return 'ไม่ระบุ';

    const qualityMap = {
      1: 'แย่มาก',
      2: 'ไม่ดี',
      3: 'ปานกลาง',
      4: 'ดี',
      5: 'ดีมาก',
    };

    return qualityMap[this.ai_response_quality] || 'ไม่ระบุ';
  }

  get quality_color(): string {
    if (!this.ai_response_quality) return 'gray';

    const colorMap = {
      1: 'red',
      2: 'orange',
      3: 'yellow',
      4: 'lightgreen',
      5: 'green',
    };

    return colorMap[this.ai_response_quality] || 'gray';
  }

  get feedback_icon(): string {
    const iconMap = {
      [UserFeedback.THUMBS_UP]: '👍',
      [UserFeedback.THUMBS_DOWN]: '👎',
      [UserFeedback.NONE]: '',
    };

    return iconMap[this.user_feedback];
  }

  get message_preview(): string {
    if (this.message_text.length <= 50) {
      return this.message_text;
    }
    return this.message_text.substring(0, 50) + '...';
  }

  get has_attachment(): boolean {
    return this.message_type !== MessageType.TEXT;
  }

  get attachment_icon(): string {
    const iconMap = {
      [MessageType.IMAGE]: '🖼️',
      [MessageType.FILE]: '📎',
      [MessageType.VOICE]: '🎤',
      [MessageType.TEXT]: '',
    };

    return iconMap[this.message_type];
  }
}
