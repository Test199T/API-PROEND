import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PerformanceService } from '../src/performance/performance.service';
import { MetricsService } from '../src/performance/metrics.service';

describe('Performance Integration Tests', () => {
  let app: INestApplication;
  let performanceService: PerformanceService;
  let metricsService: MetricsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same configuration as main.ts
    app.setGlobalPrefix('api');
    
    performanceService = moduleFixture.get<PerformanceService>(PerformanceService);
    metricsService = moduleFixture.get<MetricsService>(MetricsService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Cache Integration', () => {
    it('should cache and retrieve data', async () => {
      const testData = { id: 1, name: 'test user' };
      const cacheKey = 'test:integration:user';

      // Set data in cache
      await performanceService.set(cacheKey, testData, 60);
      
      // Retrieve data from cache
      const cachedData = await performanceService.get(cacheKey);
      
      expect(cachedData).toEqual(testData);
    });

    it('should handle cache expiration', async () => {
      const testData = { id: 2, name: 'expiring user' };
      const cacheKey = 'test:integration:expiring';

      // Set data with very short TTL
      await performanceService.set(cacheKey, testData, 1);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Try to retrieve expired data
      const cachedData = await performanceService.get(cacheKey);
      
      expect(cachedData).toBeUndefined();
    });

    it('should generate correct cache keys', () => {
      const userKey = performanceService.generateUserCacheKey('user123', 'profile');
      const apiKey = performanceService.generateApiCacheKey('users.list', { page: 1 });

      expect(userKey).toBe('user:user123:profile');
      expect(apiKey).toMatch(/^api:users\.list:/);
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should apply rate limiting to requests', async () => {
      const requests = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app.getHttpServer())
            .get('/api/health')
            .expect((res) => {
              expect(res.status).toBeLessThan(429);
            })
        );
      }

      await Promise.all(requests);
    });

    it('should handle rate limit exceeded', async () => {
      // Make many requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 15; i++) {
        requests.push(request(app.getHttpServer()).get('/api/health'));
      }

      const responses = await Promise.all(requests);
      
      // At least one request should be rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Health Check Integration', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
    });

    it('should return detailed health information', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('configuration');
    });

    it('should return readiness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return liveness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Metrics Integration', () => {
    it('should return metrics endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/metrics');

      // Should return either metrics (200) or not found (404) if disabled
      expect([200, 404]).toContain(response.status);
    });

    it('should record metrics for requests', async () => {
      // Make a request to generate metrics
      await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      // Get metrics
      const metrics = await metricsService.getMetrics();
      expect(typeof metrics).toBe('string');
    });
  });

  describe('Security Headers Integration', () => {
    it('should include security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      // Check for common security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Response Compression Integration', () => {
    it('should compress responses when appropriate', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/detailed')
        .expect(200);

      // Check if response is compressed
      const contentEncoding = response.headers['content-encoding'];
      const contentLength = parseInt(response.headers['content-length'] || '0');
      
      // If compressed, should have gzip encoding
      if (contentEncoding) {
        expect(contentEncoding).toMatch(/gzip|deflate/);
      }
      
      // Response should have reasonable size
      expect(contentLength).toBeGreaterThan(0);
    });
  });

  describe('CORS Integration', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      // Should include CORS headers
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });
  });
});
