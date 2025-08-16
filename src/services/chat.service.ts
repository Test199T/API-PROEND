import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { OpenRouterService } from './openrouter.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly openRouterService: OpenRouterService,
  ) {}

  /**
   * สร้างเซสชันแชทใหม่
   */
  async createChatSession(userId: number, sessionTitle?: string): Promise<any> {
    try {
      const session = {
        user_id: userId,
        session_title: sessionTitle || `แชทสุขภาพ ${new Date().toLocaleDateString('th-TH')}`,
        ai_model: 'OpenRouter AI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      const result = await this.supabaseService.createChatSession(session);
      this.logger.log(`Chat session created for user ${userId}: ${result.id}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to create chat session for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * ดึงเซสชันแชทของผู้ใช้
   */
  async getChatSessions(userId: number): Promise<any[]> {
    try {
      return await this.supabaseService.getChatSessionsByUserId(userId);
    } catch (error) {
      this.logger.error(`Failed to get chat sessions for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * ดึงข้อความในแชท
   */
  async getChatMessages(sessionId: number): Promise<any[]> {
    try {
      return await this.supabaseService.getChatMessagesBySessionId(sessionId);
    } catch (error) {
      this.logger.error(`Failed to get chat messages for session ${sessionId}`, error);
      throw error;
    }
  }

  /**
   * ส่งข้อความและรับการตอบกลับจาก AI
   */
  async sendMessage(sessionId: number, userId: number, messageText: string): Promise<any> {
    try {
      // บันทึกข้อความของผู้ใช้
      const userMessage = {
        session_id: sessionId,
        user_id: userId,
        message_text: messageText,
        is_user_message: true,
        timestamp: new Date().toISOString(),
        message_type: 'text',
      };

      const savedUserMessage = await this.supabaseService.createChatMessage(userMessage);

      // ดึงข้อมูลผู้ใช้และประวัติการแชท
      const [userData, chatHistory] = await Promise.all([
        this.supabaseService.getUserById(userId),
        this.getChatMessages(sessionId),
      ]);

      // ใช้ OpenRouter AI ตอบกลับ
      let aiResponse: string;
      try {
        aiResponse = await this.openRouterService.respondToChat(
          userData,
          messageText,
          chatHistory
        );
      } catch (aiError) {
        this.logger.warn(`AI response failed, using fallback: ${aiError.message}`);
        aiResponse = this.getFallbackResponse(messageText);
      }

      // บันทึกการตอบกลับของ AI
      const aiMessage = {
        session_id: sessionId,
        user_id: userId,
        message_text: aiResponse,
        is_user_message: false,
        timestamp: new Date().toISOString(),
        message_type: 'text',
        ai_response_quality: 4, // Default quality score
      };

      const savedAiMessage = await this.supabaseService.createChatMessage(aiMessage);

      // อัพเดทเซสชัน
      await this.supabaseService.updateChatSession(sessionId, {
        updated_at: new Date().toISOString(),
      });

      return {
        userMessage: savedUserMessage,
        aiMessage: savedAiMessage,
        sessionId,
      };
    } catch (error) {
      this.logger.error(`Failed to send message in session ${sessionId}`, error);
      throw error;
    }
  }

  /**
   * ให้คะแนนการตอบกลับของ AI
   */
  async rateAIResponse(messageId: number, rating: number, feedback?: string): Promise<any> {
    try {
      const updateData: any = {
        ai_response_quality: rating,
      };

      if (feedback) {
        updateData.user_feedback = feedback;
      }

      const result = await this.supabaseService.updateChatMessage(messageId, updateData);
      this.logger.log(`AI response rated: message ${messageId}, rating ${rating}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to rate AI response for message ${messageId}`, error);
      throw error;
    }
  }

  /**
   * ปิดเซสชันแชท
   */
  async closeChatSession(sessionId: number): Promise<any> {
    try {
      const result = await this.supabaseService.updateChatSession(sessionId, {
        is_active: false,
        updated_at: new Date().toISOString(),
      });
      
      this.logger.log(`Chat session ${sessionId} closed`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to close chat session ${sessionId}`, error);
      throw error;
    }
  }

  /**
   * ลบเซสชันแชท
   */
  async deleteChatSession(sessionId: number): Promise<any> {
    try {
      // ลบข้อความทั้งหมดในเซสชันก่อน
      await this.supabaseService.deleteChatMessagesBySessionId(sessionId);
      
      // ลบเซสชัน
      const result = await this.supabaseService.deleteChatSession(sessionId);
      
      this.logger.log(`Chat session ${sessionId} deleted`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete chat session ${sessionId}`, error);
      throw error;
    }
  }

  /**
   * สร้างข้อความตอบกลับแบบ fallback เมื่อ AI ไม่สามารถตอบได้
   */
  private getFallbackResponse(userMessage: string): string {
    const fallbackResponses = [
      'ขออภัยค่ะ ตอนนี้ระบบ AI มีปัญหาชั่วคราว แต่ฉันสามารถช่วยคุณได้ด้วยข้อมูลพื้นฐาน',
      'ขออภัยค่ะ ระบบ AI ไม่สามารถตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
      'ขออภัยค่ะ มีปัญหาการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้งในภายหลัง',
      'ขออภัยค่ะ ระบบ AI กำลังปรับปรุง กรุณาลองใหม่อีกครั้ง',
    ];

    // เลือกข้อความตอบกลับแบบสุ่ม
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
  }

  /**
   * ตรวจสอบสถานะการเชื่อมต่อ AI
   */
  async checkAIStatus(): Promise<boolean> {
    try {
      return await this.openRouterService.healthCheck();
    } catch (error) {
      this.logger.error('AI status check failed', error);
      return false;
    }
  }
}
