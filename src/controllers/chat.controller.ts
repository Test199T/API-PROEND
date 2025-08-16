import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  // ==================== CHAT SESSIONS ====================

  @Post('sessions')
  async createChatSession(@Request() req, @Body() body: { title?: string }) {
    const userId = req.user.id;

    try {
      const session = await this.chatService.createChatSession(
        userId,
        body.title,
      );
      return {
        success: true,
        data: session,
        message: 'Chat session created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('sessions')
  async getChatSessions(@Request() req) {
    const userId = req.user.id;

    try {
      const sessions = await this.chatService.getChatSessions(userId);
      return {
        success: true,
        data: sessions,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('sessions/:sessionId')
  async getChatSession(@Request() req, @Param('sessionId') sessionId: string) {
    const userId = req.user.id;

    try {
      const messages = await this.chatService.getChatMessages(
        parseInt(sessionId),
      );
      return {
        success: true,
        data: {
          sessionId: parseInt(sessionId),
          messages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== CHAT MESSAGES ====================

  @Post('sessions/:sessionId/messages')
  async sendMessage(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() body: { message: string },
  ) {
    const userId = req.user.id;

    try {
      const response = await this.chatService.sendMessage(
        parseInt(sessionId),
        userId,
        body.message,
      );

      return {
        success: true,
        data: response,
        message: 'Message sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('sessions/:sessionId/messages')
  async getChatMessages(@Request() req, @Param('sessionId') sessionId: string) {
    try {
      const messages = await this.chatService.getChatMessages(
        parseInt(sessionId),
      );
      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== AI INTERACTION ====================

  @Post('ai/analyze')
  async analyzeUserMessage(
    @Request() req,
    @Body() body: { message: string; context?: any },
  ) {
    const userId = req.user.id;

    try {
      // สร้างเซสชันชั่วคราวสำหรับการวิเคราะห์
      const session = await this.chatService.createChatSession(
        userId,
        'AI Analysis',
      );
      const response = await this.chatService.sendMessage(
        session.id,
        userId,
        body.message,
      );

      // ปิดเซสชันหลังจากวิเคราะห์เสร็จ
      await this.chatService.closeChatSession(session.id);

      return {
        success: true,
        data: response,
        message: 'Message analyzed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('ai/health-advice')
  async getHealthAdvice(
    @Request() req,
    @Body() body: { topic: string; specificQuestion?: string },
  ) {
    const userId = req.user.id;

    try {
      const question =
        body.specificQuestion || `ให้คำแนะนำเกี่ยวกับ${body.topic}`;
      const session = await this.chatService.createChatSession(
        userId,
        `Health Advice: ${body.topic}`,
      );
      const response = await this.chatService.sendMessage(
        session.id,
        userId,
        question,
      );

      // ปิดเซสชันหลังจากให้คำแนะนำเสร็จ
      await this.chatService.closeChatSession(session.id);

      return {
        success: true,
        data: response,
        message: 'Health advice generated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== FEEDBACK & RATING ====================

  @Put('messages/:messageId/rate')
  async rateAIResponse(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body() body: { rating: number; feedback?: string },
  ) {
    try {
      await this.chatService.rateAIResponse(
        parseInt(messageId),
        body.rating,
        body.feedback,
      );
      return {
        success: true,
        message: 'AI response rated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== SESSION MANAGEMENT ====================

  @Put('sessions/:sessionId/close')
  async closeChatSession(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    try {
      await this.chatService.closeChatSession(parseInt(sessionId));
      return {
        success: true,
        message: 'Chat session closed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== QUICK RESPONSES ====================

  @Get('quick-responses')
  async getQuickResponses(@Request() req) {
    const userId = req.user.id;

    try {
      // สร้างคำถามที่พบบ่อย
      const quickResponses = [
        {
          id: 1,
          question: 'ฉันควรออกกำลังกายอย่างไร?',
          category: 'exercise',
        },
        {
          id: 2,
          question: 'ฉันควรรับประทานอาหารอย่างไร?',
          category: 'nutrition',
        },
        {
          id: 3,
          question: 'ฉันควรนอนอย่างไร?',
          category: 'sleep',
        },
        {
          id: 4,
          question: 'ฉันควรตั้งเป้าหมายสุขภาพอย่างไร?',
          category: 'goals',
        },
        {
          id: 5,
          question: 'ฉันควรดื่มน้ำอย่างไร?',
          category: 'hydration',
        },
      ];

      return {
        success: true,
        data: quickResponses,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('quick-responses/:responseId/ask')
  async askQuickResponse(
    @Request() req,
    @Param('responseId') responseId: string,
  ) {
    const userId = req.user.id;

    try {
      const quickResponses = [
        'ฉันควรออกกำลังกายอย่างไร?',
        'ฉันควรรับประทานอาหารอย่างไร?',
        'ฉันควรนอนอย่างไร?',
        'ฉันควรตั้งเป้าหมายสุขภาพอย่างไร?',
        'ฉันควรดื่มน้ำอย่างไร?',
      ];

      const question =
        quickResponses[parseInt(responseId) - 1] ||
        'ฉันต้องการคำแนะนำเกี่ยวกับสุขภาพ';

      const session = await this.chatService.createChatSession(
        userId,
        'Quick Response',
      );
      const response = await this.chatService.sendMessage(
        session.id,
        userId,
        question,
      );

      // ปิดเซสชันหลังจากตอบเสร็จ
      await this.chatService.closeChatSession(session.id);

      return {
        success: true,
        data: response,
        message: 'Quick response generated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== CHAT STATISTICS ====================

  @Get('statistics')
  async getChatStatistics(@Request() req) {
    const userId = req.user.id;

    try {
      const sessions = await this.chatService.getChatSessions(userId);

      const stats = {
        totalSessions: sessions.length,
        activeSessions: sessions.filter((s) => s.isActive).length,
        totalMessages: 0,
        averageMessagesPerSession: 0,
        mostActiveDay: '',
        lastChatDate: sessions.length > 0 ? sessions[0].updatedAt : null,
      };

      // คำนวณจำนวนข้อความทั้งหมด
      for (const session of sessions) {
        const messages = await this.chatService.getChatMessages(session.id);
        stats.totalMessages += messages.length;
      }

      if (sessions.length > 0) {
        stats.averageMessagesPerSession = Math.round(
          stats.totalMessages / sessions.length,
        );
      }

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
