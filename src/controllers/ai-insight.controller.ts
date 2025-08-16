import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { SupabaseService } from '../services/supabase.service';
import { AIService } from '../services/ai.service';
import {
  CreateAIInsightDto,
  UpdateAIInsightDto,
  AIInsightQueryDto,
  AIInsightResponseDto,
  MarkInsightReadDto,
  InsightFeedbackDto,
} from '../dto/ai-insight.dto';
import { ResponseDto } from '../dto/common.dto';

@Controller('ai-insights')
@UseGuards(AuthGuard)
export class AIInsightController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly aiService: AIService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAIInsight(
    @Body() createAIInsightDto: CreateAIInsightDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<AIInsightResponseDto>> {
    try {
      const aiInsight = await this.supabaseService.createAIInsight({
        ...createAIInsightDto,
        user_id: userId,
      });

      return ResponseDto.success(aiInsight, 'AI insight created successfully');
    } catch (error) {
      return ResponseDto.error('Failed to create AI insight', error.message);
    }
  }

  @Get()
  async getAIInsights(
    @Query() query: AIInsightQueryDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<AIInsightResponseDto[]>> {
    try {
      const aiInsights = await this.supabaseService.getAIInsights({
        ...query,
        user_id: userId,
      });

      return ResponseDto.success(
        aiInsights,
        'AI insights retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error('Failed to retrieve AI insights', error.message);
    }
  }

  @Get(':id')
  async getAIInsight(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<AIInsightResponseDto>> {
    try {
      const aiInsight = await this.supabaseService.getAIInsightById(id, userId);

      if (!aiInsight) {
        return ResponseDto.error('AI insight not found');
      }

      return ResponseDto.success(
        aiInsight,
        'AI insight retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error('Failed to retrieve AI insight', error.message);
    }
  }

  @Put(':id')
  async updateAIInsight(
    @Param('id') id: string,
    @Body() updateAIInsightDto: UpdateAIInsightDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<AIInsightResponseDto>> {
    try {
      const aiInsight = await this.supabaseService.updateAIInsight(
        id,
        userId,
        updateAIInsightDto,
      );

      if (!aiInsight) {
        return ResponseDto.error('AI insight not found');
      }

      return ResponseDto.success(aiInsight, 'AI insight updated successfully');
    } catch (error) {
      return ResponseDto.error('Failed to update AI insight', error.message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAIInsight(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<null>> {
    try {
      const deleted = await this.supabaseService.deleteAIInsight(id, userId);

      if (!deleted) {
        return ResponseDto.error('AI insight not found');
      }

      return ResponseDto.success(null, 'AI insight deleted successfully');
    } catch (error) {
      return ResponseDto.error('Failed to delete AI insight', error.message);
    }
  }

  @Post('generate')
  async generateAIInsight(
    @User('id') userId: string,
  ): Promise<ResponseDto<AIInsightResponseDto>> {
    try {
      const insight = await this.aiService.generateHealthInsight(userId);
      return ResponseDto.success(insight, 'AI insight generated successfully');
    } catch (error) {
      return ResponseDto.error('Failed to generate AI insight', error.message);
    }
  }

  @Post('analyze')
  async analyzeHealthData(
    @User('id') userId: string,
    @Body() analysisRequest: { focus_area?: string; time_period?: string },
  ): Promise<ResponseDto<any>> {
    try {
      const analysis = await this.aiService.analyzeUserHealth(
        userId,
        analysisRequest.focus_area,
        analysisRequest.time_period,
      );
      return ResponseDto.success(
        analysis,
        'Health data analysis completed successfully',
      );
    } catch (error) {
      return ResponseDto.error('Failed to analyze health data', error.message);
    }
  }

  @Post('mark-read')
  async markInsightAsRead(
    @Body() markReadDto: MarkInsightReadDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      if (markReadDto.mark_all) {
        const result =
          await this.supabaseService.markAllAIInsightsAsRead(userId);
        return ResponseDto.success(result, 'All AI insights marked as read');
      } else {
        const result = await this.supabaseService.markAIInsightAsRead(
          markReadDto.insight_id,
          userId,
        );
        return ResponseDto.success(result, 'AI insight marked as read');
      }
    } catch (error) {
      return ResponseDto.error(
        'Failed to mark AI insight as read',
        error.message,
      );
    }
  }

  @Post('feedback')
  async provideInsightFeedback(
    @Body() feedbackDto: InsightFeedbackDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const feedback = await this.supabaseService.saveInsightFeedback(
        feedbackDto.insight_id,
        userId,
        feedbackDto,
      );
      return ResponseDto.success(
        feedback,
        'Insight feedback saved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to save insight feedback',
        error.message,
      );
    }
  }

  @Get('types/:type')
  async getInsightsByType(
    @Param('type') type: string,
    @Query() query: AIInsightQueryDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<AIInsightResponseDto[]>> {
    try {
      const insights = await this.supabaseService.getAIInsightsByType(
        userId,
        type,
        query,
      );
      return ResponseDto.success(
        insights,
        'AI insights by type retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve AI insights by type',
        error.message,
      );
    }
  }

  @Get('priority/:priority')
  async getInsightsByPriority(
    @Param('priority') priority: string,
    @Query() query: AIInsightQueryDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<AIInsightResponseDto[]>> {
    try {
      const insights = await this.supabaseService.getAIInsightsByPriority(
        userId,
        priority,
        query,
      );
      return ResponseDto.success(
        insights,
        'AI insights by priority retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve AI insights by priority',
        error.message,
      );
    }
  }

  @Get('unread/count')
  async getUnreadInsightCount(
    @User('id') userId: string,
  ): Promise<ResponseDto<number>> {
    try {
      const count = await this.supabaseService.getUnreadAIInsightCount(userId);
      return ResponseDto.success(
        count,
        'Unread AI insight count retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve unread AI insight count',
        error.message,
      );
    }
  }

  @Get('recommendations/personalized')
  async getPersonalizedRecommendations(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const recommendations =
        await this.aiService.getPersonalizedRecommendations(userId);
      return ResponseDto.success(
        recommendations,
        'Personalized recommendations retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve personalized recommendations',
        error.message,
      );
    }
  }

  @Get('trends/health-scores')
  async getHealthScoreTrends(
    @Query('days') days: number = 30,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const trends = await this.aiService.getHealthScoreTrends(userId, days);
      return ResponseDto.success(
        trends,
        'Health score trends retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve health score trends',
        error.message,
      );
    }
  }

  @Get('stats/summary')
  async getAIInsightStats(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const stats = await this.supabaseService.getAIInsightStats(
        userId,
        startDate,
        endDate,
      );
      return ResponseDto.success(
        stats,
        'AI insight stats retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve AI insight stats',
        error.message,
      );
    }
  }

  @Post('bulk/delete')
  async deleteBulkAIInsights(
    @Body() ids: string[],
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const result = await this.supabaseService.deleteBulkAIInsights(
        ids,
        userId,
      );
      return ResponseDto.success(
        result,
        'Bulk AI insights deleted successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to delete bulk AI insights',
        error.message,
      );
    }
  }

  @Post('bulk/mark-read')
  async markBulkAIInsightsAsRead(
    @Body() ids: string[],
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const result = await this.supabaseService.markBulkAIInsightsAsRead(
        ids,
        userId,
      );
      return ResponseDto.success(
        result,
        'Bulk AI insights marked as read successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to mark bulk AI insights as read',
        error.message,
      );
    }
  }
}
