import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { PerformanceService } from './performance.service';
import { MetricsService } from './metrics.service';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
  skipCache?: boolean; // Skip cache for this request
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly performanceService: PerformanceService,
    private readonly metricsService: MetricsService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const className = context.getClass().name;

    // Get cache options from metadata or use defaults
    const cacheOptions: CacheOptions = this.getCacheOptions(handler) || {
      ttl: 300, // 5 minutes default
    };

    // Skip cache if requested
    if (cacheOptions.skipCache || request.headers['x-skip-cache'] === 'true') {
      return next.handle();
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(request, cacheOptions.key, className, handler.name);

    try {
      // Try to get from cache
      const cachedData = await this.performanceService.get(cacheKey);
      
      if (cachedData) {
        this.metricsService.recordCacheHit('api', this.getKeyPattern(cacheKey));
        return of(cachedData);
      }

      this.metricsService.recordCacheMiss('api', this.getKeyPattern(cacheKey));

      // Execute the handler and cache the result
      return next.handle().pipe(
        tap(async (data) => {
          try {
            await this.performanceService.set(cacheKey, data, cacheOptions.ttl);
            this.metricsService.recordCacheOperation('set', 'api');
          } catch (error) {
            // Log error but don't fail the request
            console.error('Failed to cache response:', error);
          }
        }),
      );
    } catch (error) {
      // If cache fails, continue without caching
      console.error('Cache interceptor error:', error);
      return next.handle();
    }
  }

  private getCacheOptions(handler: any): CacheOptions | null {
    // This would typically use Reflector to get metadata
    // For now, we'll return null to use defaults
    return null;
  }

  private generateCacheKey(
    request: Request,
    customKey?: string,
    className?: string,
    methodName?: string,
  ): string {
    if (customKey) {
      return customKey;
    }

    const { method, path, query, body } = request;
    const userId = (request as any).user?.id || 'anonymous';
    
    // Create a hash of the request parameters
    const params = {
      method,
      path,
      query: JSON.stringify(query),
      body: method !== 'GET' ? JSON.stringify(body) : '',
    };

    return this.performanceService.generateApiCacheKey(
      `${className}.${methodName}`,
      { ...params, userId },
    );
  }

  private getKeyPattern(key: string): string {
    // Extract pattern from cache key for metrics
    const parts = key.split(':');
    return parts.length > 1 ? parts[1] : 'unknown';
  }
}
