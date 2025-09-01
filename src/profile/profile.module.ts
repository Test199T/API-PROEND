import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { SupabaseService } from '../services/supabase.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, SupabaseService],
  exports: [ProfileService],
})
export class ProfileModule {}
