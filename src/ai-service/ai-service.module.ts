import { Module } from '@nestjs/common';
import { AIServiceController } from './ai-service.controller';
import { AIHealthController } from './ai-health.controller';
import { AIService } from '../services/ai.service';
import { SupabaseService } from '../services/supabase.service';
import { OpenRouterService } from '../services/openrouter.service';

@Module({
  controllers: [AIServiceController, AIHealthController],
  providers: [AIService, SupabaseService, OpenRouterService],
  exports: [AIService],
})
export class AIServiceModule {}
