import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  Logger,
  HttpStatus,
  HttpCode,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/user.decorator';
// import { Public } from '../auth/decorators/public.decorator';
import { AIService } from '../services/ai.service';
import { Request } from 'express';
import { FoodAnalysisDto } from '../dto/ai-food-analysis.dto';

export interface AIAnalysisRequest {
  userId: number;
  analysisType: 'complete' | 'nutrition' | 'exercise' | 'sleep' | 'quick';
  timeframe?: 'week' | 'month' | 'quarter';
  includeRecommendations?: boolean;
  includeInsights?: boolean;
}

export interface AIRecommendationRequest {
  userId: number;
  category: 'nutrition' | 'exercise' | 'sleep' | 'lifestyle' | 'goal';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  limit?: number;
}

export interface AIChatRequest {
  userId: number;
  message: string;
  sessionId?: string;
  context?: {
    healthData?: any;
    recentLogs?: any;
    goals?: any;
  };
}

@UseGuards(AuthGuard)
@Controller('ai-service')
export class AIServiceController {
  private readonly logger = new Logger(AIServiceController.name);
  private readonly requestCache = new Map<string, { timestamp: number; result: any }>();
  private readonly CACHE_DURATION = 0; // ปิด cache (0 = ไม่ใช้ cache)
  private readonly rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private readonly RATE_LIMIT = 5; // 5 requests per minute
  private readonly RATE_WINDOW = 60000; // 1 minute

  constructor(private readonly aiService: AIService) {}

  /**
   * วิเคราะห์สุขภาพด้วย AI
   * POST /api/ai-service/analyze
   */
  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  async analyzeHealth(
    @Body() request: AIAnalysisRequest,
    @Req() req: Request,
  ) {
    try {
      // ตรวจสอบ userId
      if (!request.userId || request.userId <= 0) {
        return {
          success: false,
          error: 'User ID not found. Please login again.',
          timestamp: new Date().toISOString(),
        };
      }

      // ตรวจสอบ rate limit
      const rateLimitKey = `rate_${request.userId}`;
      const now = Date.now();
      const rateLimit = this.rateLimitMap.get(rateLimitKey);
      
      if (rateLimit) {
        if (now < rateLimit.resetTime) {
          if (rateLimit.count >= this.RATE_LIMIT) {
            return {
              success: false,
              error: 'Too many requests. Please wait before trying again.',
              timestamp: new Date().toISOString(),
              retryAfter: Math.ceil((rateLimit.resetTime - now) / 1000),
            };
          }
          rateLimit.count++;
        } else {
          this.rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + this.RATE_WINDOW });
        }
      } else {
        this.rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + this.RATE_WINDOW });
      }

      // ตรวจสอบ cache
      const cacheKey = `analyze_${request.userId}_${request.analysisType}_${request.timeframe}`;
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        this.logger.log(`Returning cached result for user ${request.userId}`);
        // เพิ่ม cache status ใน response
        return {
          ...cached.result,
          fromCache: true,
          cacheTimestamp: cached.timestamp,
          cacheAge: Date.now() - cached.timestamp
        };
      }

      this.logger.log(`AI Health Analysis requested for user ${request.userId}`, {
        userId: request.userId,
        analysisType: request.analysisType,
        timeframe: request.timeframe,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      const result = await this.aiService.analyzeUserHealth(request.userId);
      
      this.logger.log(`AI Health Analysis completed for user ${request.userId}`, {
        userId: request.userId,
        overallScore: result.healthScores?.overallScore,
        hasRecommendations: !!result.recommendations,
        hasInsights: !!result.aiAnalysis,
      });
      
      const response = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };

      // เก็บใน cache
      this.requestCache.set(cacheKey, {
        timestamp: Date.now(),
        result: response,
      });

      return response;
    } catch (error) {
      this.logger.error(`AI Analysis failed for user ${request.userId}`, {
        userId: request.userId,
        error: error.message,
        stack: error.stack,
        ip: req.ip,
      });
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      };
    }
  }

  /**
   * สร้างคำแนะนำจาก AI
   * POST /api/ai-service/recommendations
   */
  @Post('recommendations')
  @HttpCode(HttpStatus.OK)
  async generateRecommendations(
    @Body() request: AIRecommendationRequest,
    @Req() req: Request,
  ) {
    try {
      this.logger.log(`AI Recommendations requested for user ${request.userId}`);
      
      const result = await this.aiService.generateAIRecommendations(request.userId);
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`AI Recommendations failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * วิเคราะห์โภชนาการ
   * GET /api/ai-service/nutrition/:userId
   */
  @Get('nutrition/:userId')
  async analyzeNutrition(
    @Param('userId') userId: number,
    @Query('date') date?: string,
  ) {
    try {
      this.logger.log(`Nutrition analysis requested for user ${userId}`);
      
      const result = await this.aiService.analyzeNutrition(userId, date);
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Nutrition analysis failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * วิเคราะห์การออกกำลังกาย
   * GET /api/ai-service/exercise/:userId
   */
  @Get('exercise/:userId')
  async analyzeExercise(
    @Param('userId') userId: number,
    @Query('date') date?: string,
  ) {
    try {
      this.logger.log(`Exercise analysis requested for user ${userId}`);
      
      const result = await this.aiService.analyzeExercise(userId, date);
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Exercise analysis failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * แนะนำอาหาร
   * GET /api/ai-service/food-recommendations/:userId
   */
  @Get('food-recommendations/:userId')
  async getFoodRecommendations(@Param('userId') userId: number) {
    try {
      this.logger.log(`Food recommendations requested for user ${userId}`);
      
      const result = await this.aiService.getFoodRecommendations(userId);
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Food recommendations failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * แนะนำการออกกำลังกาย
   * GET /api/ai-service/exercise-recommendations/:userId
   */
  @Get('exercise-recommendations/:userId')
  async getExerciseRecommendations(@Param('userId') userId: number) {
    try {
      this.logger.log(`Exercise recommendations requested for user ${userId}`);
      
      const result = await this.aiService.getExerciseRecommendations(userId);
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Exercise recommendations failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * บันทึก AI Insight
   * POST /api/ai-service/insights
   */
  @Post('insights')
  @HttpCode(HttpStatus.CREATED)
  async saveAIInsight(
    @Body() body: { userId: number; insightData: any },
    @Req() req: Request,
  ) {
    try {
      this.logger.log(`AI Insight save requested for user ${body.userId}`);
      
      const result = await this.aiService.saveAIInsight(body.userId, body.insightData);
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`AI Insight save failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }  /**
   * วิเคราะห์รูปภาพอาหาร
   * POST /api/ai-service/analyze-food-image
   */
  @Post('analyze-food-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Food image to analyze',
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async analyzeFoodImage(
    @UploadedFile() image: any,
    @CurrentUser('id') userId: number,
  ) {
    this.logger.log(`Food image analysis requested for user ${userId}`);

    if (!image) {
      return {
        success: false,
        error: 'No image file uploaded.',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const analysisResult = await this.aiService.analyzeFoodImage(image.buffer);
      return {
        success: true,
        data: analysisResult,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Food image analysis failed for user ${userId}`,
        error.stack,
      );
      return {
        success: false,
        message: `Error analyzing food image: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
