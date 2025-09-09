import { Controller, Get } from '@nestjs/common';
import { AIService } from '../services/ai.service';

@Controller('ai-service')
export class AIHealthController {
  constructor(private readonly aiService: AIService) {}

  /**
   * Health Check (Public endpoint - no auth required)
   * GET /api/ai-service/health
   */
  @Get('health')
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'AI Service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Test AI Service (Public endpoint - no auth required)
   * GET /api/ai-service/test
   */
  @Get('test')
  async testAIService() {
    try {
      // Test basic AI functionality without requiring auth
      const result = await this.aiService.analyzeUserHealth(161); // Use known user ID
      
      return {
        success: true,
        message: 'AI Service is working correctly',
        data: {
          user: result.user ? 'User found' : 'User not found',
          healthScores: result.healthScores ? 'Health scores calculated' : 'No health scores',
          aiAnalysis: result.aiAnalysis ? 'AI analysis generated' : 'No AI analysis',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'AI Service test failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
