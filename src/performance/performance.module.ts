import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { performanceConfig } from '../config/performance.config';
import { PerformanceService } from './performance.service';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { HealthController } from './health.controller';
import { LoggingService } from './logging.service';
import { GracefulShutdownService } from './graceful-shutdown.service';

@Module({
  imports: [
    ConfigModule.forFeature(performanceConfig),
    
    // Rate Limiting Configuration
    ThrottlerModule.forRootAsync({
      useFactory: () => {
        return [
          {
            ttl: 60000, // 60 seconds in milliseconds
            limit: 100, // 100 requests per window
          },
        ];
      },
    }),

    // Cache Configuration - using memory store for now since Redis is not available
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      max: 100, // Maximum number of items in cache
    }),
  ],
  controllers: [MetricsController, HealthController],
  providers: [PerformanceService, MetricsService, LoggingService, GracefulShutdownService],
  exports: [PerformanceService, MetricsService, LoggingService, GracefulShutdownService],
})
export class PerformanceModule {}
