import { Module } from '@nestjs/common';
import { ExerciseLogController } from '../controllers/exercise-log.controller';
import { ExerciseLogService } from '../services/exercise-log.service';
import { SupabaseService } from '../services/supabase.service';
import { AIService } from '../services/ai.service';
import { OpenRouterService } from '../services/openrouter.service';

@Module({
  controllers: [ExerciseLogController],
  providers: [ExerciseLogService, SupabaseService, AIService, OpenRouterService],
  exports: [ExerciseLogService],
})
export class ExerciseLogModule {}
