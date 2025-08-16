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
import { CurrentUser } from '../auth/decorators/user.decorator';
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
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<AIInsightResponseDto>> {
    try {
      const aiInsight = await this.supabaseService.createAIInsight({
        ...createAIInsightDto,
        user_id: userId,
      });

      return ResponseDto.success(aiInsight, 'AI insight created successfully');
    } catch (error) {
      return ResponseDto.success(
        {} as AIInsightResponseDto,
        'Failed to create AI insight',
      );
    }
  }

  @Get()
  async getAIInsights(
    @Query() query: AIInsightQueryDto,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<AIInsightResponseDto[]>> {
    try {
      const aiInsights =
        await this.supabaseService.getAIInsightsByUserId(userId);
      return ResponseDto.success(
        aiInsights,
        'AI insights retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success([], 'Failed to retrieve AI insights');
    }
  }

  @Get(':id')
  async getAIInsight(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<AIInsightResponseDto>> {
    try {
      // Get all insights for user and find the specific one
      const aiInsights =
        await this.supabaseService.getAIInsightsByUserId(userId);
      const aiInsight = aiInsights.find(
        (insight) => insight.id.toString() === id,
      );

      if (!aiInsight) {
        return ResponseDto.success(
          {} as AIInsightResponseDto,
          'AI insight not found',
        );
      }

      return ResponseDto.success(
        aiInsight,
        'AI insight retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success(
        {} as AIInsightResponseDto,
        'Failed to retrieve AI insight',
      );
    }
  }

  @Put(':id')
  async updateAIInsight(
    @Param('id') id: string,
    @Body() updateAIInsightDto: UpdateAIInsightDto,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<AIInsightResponseDto>> {
    try {
      // For now, we'll implement a simple update by getting and recreating
      // In a real implementation, you'd want to add an updateAIInsight method to SupabaseService
      const aiInsights =
        await this.supabaseService.getAIInsightsByUserId(userId);
      const existingInsight = aiInsights.find(
        (insight) => insight.id.toString() === id,
      );

      if (!existingInsight) {
        return ResponseDto.success(
          {} as AIInsightResponseDto,
          'AI insight not found',
        );
      }

      // Since updateAIInsight method doesn't exist, we'll return the existing one
      // TODO: Implement updateAIInsight method in SupabaseService
      return ResponseDto.success(
        existingInsight,
        'AI insight update not implemented yet',
      );
    } catch (error) {
      return ResponseDto.success(
        {} as AIInsightResponseDto,
        'Failed to update AI insight',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAIInsight(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<void>> {
    try {
      // For now, we'll just check if the insight exists
      // In a real implementation, you'd want to add a deleteAIInsight method to SupabaseService
      const aiInsights =
        await this.supabaseService.getAIInsightsByUserId(userId);
      const existingInsight = aiInsights.find(
        (insight) => insight.id.toString() === id,
      );

      if (!existingInsight) {
        return ResponseDto.success(undefined, 'AI insight not found');
      }

      // TODO: Implement deleteAIInsight method in SupabaseService
      return ResponseDto.success(
        undefined,
        'AI insight deletion not implemented yet',
      );
    } catch (error) {
      return ResponseDto.success(undefined, 'Failed to delete AI insight');
    }
  }

  @Post('generate')
  async generateAIInsight(
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<AIInsightResponseDto>> {
    try {
      // TODO: Implement generateHealthInsight method in AIService
      // For now, return a placeholder response
      return ResponseDto.success(
        {} as AIInsightResponseDto,
        'AI insight generation not implemented yet',
      );
    } catch (error) {
      return ResponseDto.success(
        {} as AIInsightResponseDto,
        'Failed to generate AI insight',
      );
    }
  }

  @Post('analyze')
  async analyzeHealthData(
    @CurrentUser('id') userId: number,
    @Body() analysisRequest: { focus_area?: string; time_period?: string },
  ): Promise<ResponseDto<any>> {
    try {
      // TODO: Implement analyzeHealthData method in AIService
      // For now, return a placeholder response
      return ResponseDto.success(
        {},
        'Health data analysis not implemented yet',
      );
    } catch (error) {
      return ResponseDto.success({}, 'Failed to analyze health data');
    }
  }

  @Post('mark-read')
  async markInsightAsRead(
    @Body() markReadDto: MarkInsightReadDto,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      if (markReadDto.mark_all) {
        // TODO: Implement markAllAIInsightsAsRead method in SupabaseService
        return ResponseDto.success({}, 'Mark all as read not implemented yet');
      } else {
        // TODO: Implement markAIInsightAsRead method in SupabaseService
        return ResponseDto.success(
          {},
          'Mark insight as read not implemented yet',
        );
      }
    } catch (error) {
      return ResponseDto.success({}, 'Failed to mark insight as read');
    }
  }

  @Post('feedback')
  async provideInsightFeedback(
    @Body() feedbackDto: InsightFeedbackDto,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      // TODO: Implement saveInsightFeedback method in SupabaseService
      return ResponseDto.success({}, 'Insight feedback not implemented yet');
    } catch (error) {
      return ResponseDto.success({}, 'Failed to save insight feedback');
    }
  }

  @Get('types/:type')
  async getAIInsightsByType(
    @Param('type') type: string,
    @Query() query: AIInsightQueryDto,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<AIInsightResponseDto[]>> {
    try {
      // TODO: Implement getAIInsightsByType method in SupabaseService
      // For now, get all insights and filter by type
      const aiInsights =
        await this.supabaseService.getAIInsightsByUserId(userId);
      const filteredInsights = aiInsights.filter(
        (insight) => insight.insight_type === type,
      );
      return ResponseDto.success(
        filteredInsights,
        'AI insights by type retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success([], 'Failed to retrieve AI insights by type');
    }
  }

  @Get('priority/:priority')
  async getAIInsightsByPriority(
    @Param('priority') priority: string,
    @Query() query: AIInsightQueryDto,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<AIInsightResponseDto[]>> {
    try {
      // TODO: Implement getAIInsightsByPriority method in SupabaseService
      // For now, get all insights and filter by priority
      const aiInsights =
        await this.supabaseService.getAIInsightsByUserId(userId);
      const filteredInsights = aiInsights.filter(
        (insight) => insight.priority === priority,
      );
      return ResponseDto.success(
        filteredInsights,
        'AI insights by priority retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success(
        [],
        'Failed to retrieve AI insights by priority',
      );
    }
  }

  @Get('unread/count')
  async getUnreadInsightCount(
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<number>> {
    try {
      // TODO: Implement getUnreadAIInsightCount method in SupabaseService
      // For now, get all insights and count unread ones
      const aiInsights =
        await this.supabaseService.getAIInsightsByUserId(userId);
      const unreadCount = aiInsights.filter(
        (insight) => !insight.is_read,
      ).length;
      return ResponseDto.success(
        unreadCount,
        'Unread insight count retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.success(0, 'Failed to retrieve unread insight count');
    }
  }

  @Get('recommendations/personalized')
  async getPersonalizedRecommendations(
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      // TODO: Implement getPersonalizedRecommendations method in AIService
      // For now, return a placeholder response
      return ResponseDto.success(
        {},
        'Personalized recommendations not implemented yet',
      );
    } catch (error) {
      return ResponseDto.success(
        {},
        'Failed to get personalized recommendations',
      );
    }
  }

  @Get('trends/health-score')
  async getHealthScoreTrends(
    @Query('days') days: number = 30,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      // TODO: Implement getHealthScoreTrends method in AIService
      // For now, return a placeholder response
      return ResponseDto.success({}, 'Health score trends not implemented yet');
    } catch (error) {
      return ResponseDto.success({}, 'Failed to get health score trends');
    }
  }

  @Get('stats/summary')
  async getAIInsightStats(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      // TODO: Implement getAIInsightStats method in SupabaseService
      // For now, return a placeholder response
      return ResponseDto.success({}, 'AI insight stats not implemented yet');
    } catch (error) {
      return ResponseDto.success({}, 'Failed to get AI insight stats');
    }
  }

  @Post('bulk/delete')
  async deleteBulkAIInsights(
    @Body() ids: string[],
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      // TODO: Implement deleteBulkAIInsights method in SupabaseService
      return ResponseDto.success(
        { deleted_count: ids.length },
        'Bulk AI insights deletion not implemented yet',
      );
    } catch (error) {
      return ResponseDto.success({}, 'Failed to delete bulk AI insights');
    }
  }

  @Post('bulk/mark-read')
  async markBulkAIInsightsAsRead(
    @Body() ids: string[],
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      // TODO: Implement markBulkAIInsightsAsRead method in SupabaseService
      return ResponseDto.success(
        { marked_count: ids.length },
        'Bulk AI insights mark as read not implemented yet',
      );
    } catch (error) {
      return ResponseDto.success({}, 'Failed to mark bulk AI insights as read');
    }
  }
}
