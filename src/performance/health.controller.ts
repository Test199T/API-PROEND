import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PerformanceService } from './performance.service';
import { MetricsService } from './metrics.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly performanceService: PerformanceService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get()
  async getHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        api: 'healthy',
        cache: await this.checkCacheHealth(),
        metrics: this.checkMetricsHealth(),
      },
    };

    return health;
  }

  @Get('detailed')
  async getDetailedHealth() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      system: {
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      },
      services: {
        api: 'healthy',
        cache: await this.checkCacheHealth(),
        metrics: this.checkMetricsHealth(),
      },
      configuration: {
        rateLimiting: {
          enabled: true,
          ttl: this.configService.get('performance.throttle.ttl', 60),
          limit: this.configService.get('performance.throttle.limit', 100),
        },
        compression: {
          enabled: true,
          level: this.configService.get('performance.compression.level', 6),
          threshold: this.configService.get('performance.compression.threshold', 1024),
        },
        security: {
          helmet: {
            csp: this.configService.get('performance.helmet.cspEnabled', true),
            hsts: this.configService.get('performance.helmet.hstsEnabled', true),
          },
        },
        monitoring: {
          prometheus: this.configService.get('performance.monitoring.prometheusEnabled', false),
        },
      },
    };
  }

  @Get('ready')
  async getReadiness() {
    const cacheHealth = await this.checkCacheHealth();
    
    if (cacheHealth.status !== 'healthy') {
      return {
        status: 'not ready',
        reason: 'Cache service unavailable',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  private async checkCacheHealth() {
    try {
      // Test cache connectivity
      const testKey = 'health-check';
      const testValue = 'test';
      
      await this.performanceService.set(testKey, testValue, 10);
      const retrieved = await this.performanceService.get(testKey);
      await this.performanceService.del(testKey);
      
      if (retrieved === testValue) {
        return {
          status: 'healthy',
          type: 'redis',
        };
      } else {
        return {
          status: 'unhealthy',
          type: 'redis',
          error: 'Cache read/write test failed',
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        type: 'redis',
        error: error.message,
      };
    }
  }

  private checkMetricsHealth() {
    const isEnabled = this.configService.get('performance.monitoring.prometheusEnabled', false);
    
    return {
      status: isEnabled ? 'healthy' : 'disabled',
      type: 'prometheus',
      enabled: isEnabled,
    };
  }
}
