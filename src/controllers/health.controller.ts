import { Controller, Get, Logger } from '@nestjs/common';
import { OpenRouterService } from '../services/openrouter.service';
import { SupabaseService } from '../services/supabase.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly openRouterService: OpenRouterService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  async healthCheck() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unknown',
        ai: 'unknown',
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };

    try {
      // ตรวจสอบการเชื่อมต่อฐานข้อมูล
      await this.supabaseService.healthCheck();
      health.services.database = 'healthy';
    } catch (error) {
      this.logger.error('Database health check failed', error);
      health.services.database = 'unhealthy';
      health.status = 'degraded';
    }

    try {
      // ตรวจสอบการเชื่อมต่อ AI service
      const aiHealth = await this.openRouterService.healthCheck();
      health.services.ai = aiHealth ? 'healthy' : 'unhealthy';
      if (!aiHealth) {
        health.status = 'degraded';
      }
    } catch (error) {
      this.logger.error('AI service health check failed', error);
      health.services.ai = 'unhealthy';
      health.status = 'degraded';
    }

    return health;
  }

  @Get('detailed')
  async detailedHealthCheck() {
    const detailedHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'unknown',
          details: {},
        },
        ai: {
          status: 'unknown',
          details: {},
        },
      },
      system: {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
      },
    };

    try {
      // ตรวจสอบฐานข้อมูลแบบละเอียด
      const dbStart = Date.now();
      await this.supabaseService.healthCheck();
      const dbLatency = Date.now() - dbStart;

      detailedHealth.services.database = {
        status: 'healthy',
        details: {
          latency: `${dbLatency}ms`,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      detailedHealth.services.database = {
        status: 'unhealthy',
        details: {
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      };
      detailedHealth.status = 'degraded';
    }

    try {
      // ตรวจสอบ AI service แบบละเอียด
      const aiStart = Date.now();
      const aiHealth = await this.openRouterService.healthCheck();
      const aiLatency = Date.now() - aiStart;

      detailedHealth.services.ai = {
        status: aiHealth ? 'healthy' : 'unhealthy',
        details: {
          latency: `${aiLatency}ms`,
          timestamp: new Date().toISOString(),
          apiKeyConfigured: !!process.env.OPENROUTER_API_KEY,
          baseUrl: process.env.OPENROUTER_BASE_URL || 'default',
          model: process.env.OPENROUTER_MODEL || 'default',
        },
      };

      if (!aiHealth) {
        detailedHealth.status = 'degraded';
      }
    } catch (error) {
      detailedHealth.services.ai = {
        status: 'unhealthy',
        details: {
          error: error.message,
          timestamp: new Date().toISOString(),
          apiKeyConfigured: !!process.env.OPENROUTER_API_KEY,
          baseUrl: process.env.OPENROUTER_BASE_URL || 'default',
          model: process.env.OPENROUTER_MODEL || 'default',
        },
      };
      detailedHealth.status = 'degraded';
    }

    return detailedHealth;
  }
}
