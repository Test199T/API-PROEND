import { Module } from '@nestjs/common';
import { SleepLogController } from '../controllers/sleep-log.controller';
import { SleepLogService } from '../services/sleep-log.service';
import { SupabaseService } from '../services/supabase.service';

@Module({
  controllers: [SleepLogController],
  providers: [SleepLogService, SupabaseService],
  exports: [SleepLogService],
})
export class SleepLogModule {}
