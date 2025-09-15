import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly isEnabled: boolean;

  // HTTP Metrics
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestTotal: Counter<string>;
  private readonly httpRequestErrors: Counter<string>;

  // Cache Metrics
  private readonly cacheHits: Counter<string>;
  private readonly cacheMisses: Counter<string>;
  private readonly cacheOperations: Counter<string>;

  // Business Metrics
  private readonly activeUsers: Gauge<string>;
  private readonly apiResponseTime: Histogram<string>;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled = this.configService.get<boolean>('performance.monitoring.prometheusEnabled', false);
    
    if (this.isEnabled) {
      // Collect default metrics
      collectDefaultMetrics({ register });

      // HTTP Metrics
      this.httpRequestDuration = new Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      });

      this.httpRequestTotal = new Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
      });

      this.httpRequestErrors = new Counter({
        name: 'http_request_errors_total',
        help: 'Total number of HTTP request errors',
        labelNames: ['method', 'route', 'error_type'],
      });

      // Cache Metrics
      this.cacheHits = new Counter({
        name: 'cache_hits_total',
        help: 'Total number of cache hits',
        labelNames: ['cache_type', 'key_pattern'],
      });

      this.cacheMisses = new Counter({
        name: 'cache_misses_total',
        help: 'Total number of cache misses',
        labelNames: ['cache_type', 'key_pattern'],
      });

      this.cacheOperations = new Counter({
        name: 'cache_operations_total',
        help: 'Total number of cache operations',
        labelNames: ['operation', 'cache_type'],
      });

      // Business Metrics
      this.activeUsers = new Gauge({
        name: 'active_users_total',
        help: 'Total number of active users',
      });

      this.apiResponseTime = new Histogram({
        name: 'api_response_time_seconds',
        help: 'API response time in seconds',
        labelNames: ['endpoint', 'method'],
        buckets: [0.1, 0.5, 1, 2, 5, 10],
      });

      // Register all metrics
      register.registerMetric(this.httpRequestDuration);
      register.registerMetric(this.httpRequestTotal);
      register.registerMetric(this.httpRequestErrors);
      register.registerMetric(this.cacheHits);
      register.registerMetric(this.cacheMisses);
      register.registerMetric(this.cacheOperations);
      register.registerMetric(this.activeUsers);
      register.registerMetric(this.apiResponseTime);

      this.logger.log('Prometheus metrics initialized');
    }
  }

  /**
   * Record HTTP request duration
   */
  recordHttpRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    if (!this.isEnabled) return;

    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
  }

  /**
   * Record HTTP request total
   */
  recordHttpRequestTotal(
    method: string,
    route: string,
    statusCode: number,
  ): void {
    if (!this.isEnabled) return;

    this.httpRequestTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  /**
   * Record HTTP request error
   */
  recordHttpRequestError(
    method: string,
    route: string,
    errorType: string,
  ): void {
    if (!this.isEnabled) return;

    this.httpRequestErrors
      .labels(method, route, errorType)
      .inc();
  }

  /**
   * Record cache hit
   */
  recordCacheHit(cacheType: string, keyPattern: string): void {
    if (!this.isEnabled) return;

    this.cacheHits.labels(cacheType, keyPattern).inc();
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(cacheType: string, keyPattern: string): void {
    if (!this.isEnabled) return;

    this.cacheMisses.labels(cacheType, keyPattern).inc();
  }

  /**
   * Record cache operation
   */
  recordCacheOperation(operation: string, cacheType: string): void {
    if (!this.isEnabled) return;

    this.cacheOperations.labels(operation, cacheType).inc();
  }

  /**
   * Set active users count
   */
  setActiveUsers(count: number): void {
    if (!this.isEnabled) return;

    this.activeUsers.set(count);
  }

  /**
   * Record API response time
   */
  recordApiResponseTime(endpoint: string, method: string, duration: number): void {
    if (!this.isEnabled) return;

    this.apiResponseTime
      .labels(endpoint, method)
      .observe(duration);
  }

  /**
   * Get all metrics as string
   */
  async getMetrics(): Promise<string> {
    if (!this.isEnabled) {
      return '# Prometheus metrics disabled\n';
    }

    return register.metrics();
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    if (!this.isEnabled) return;

    register.clear();
    this.logger.log('All metrics cleared');
  }
}
