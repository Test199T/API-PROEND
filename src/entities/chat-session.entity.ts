import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.chatSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 200, nullable: true })
  session_title: string;

  @Column({ type: 'varchar', length: 50, default: 'Claude Sonnet 4' })
  ai_model: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Relations
  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.session)
  messages: ChatMessage[];

  // Computed properties
  get last_message_time(): Date | null {
    if (!this.messages || this.messages.length === 0) return null;
    return this.messages[this.messages.length - 1].timestamp;
  }

  get message_count(): number {
    return this.messages ? this.messages.length : 0;
  }

  get has_messages(): boolean {
    return this.message_count > 0;
  }

  get is_recent(): boolean {
    if (!this.updated_at) return false;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return this.updated_at > oneDayAgo;
  }

  get session_duration(): string {
    if (!this.created_at || !this.updated_at) return '';

    const duration = this.updated_at.getTime() - this.created_at.getTime();
    const minutes = Math.floor(duration / (1000 * 60));

    if (minutes < 60) {
      return `${minutes} นาที`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} ชั่วโมง`;
    }

    return `${hours} ชั่วโมง ${remainingMinutes} นาที`;
  }

  get auto_title(): string {
    if (this.session_title) return this.session_title;

    if (!this.messages || this.messages.length === 0) {
      return 'แชทใหม่';
    }

    const firstMessage = this.messages[0];
    if (firstMessage.is_user_message) {
      const text = firstMessage.message_text.substring(0, 30);
      return text.length === 30 ? text + '...' : text;
    }

    return 'แชทกับ AI';
  }
}
