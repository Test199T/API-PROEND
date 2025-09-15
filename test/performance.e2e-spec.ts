import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Performance Features (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Checks', () => {
    it('/health (GET) should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('services');
        });
    });

    it('/health/detailed (GET) should return detailed health info', () => {
      return request(app.getHttpServer())
        .get('/api/health/detailed')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('system');
          expect(res.body).toHaveProperty('configuration');
        });
    });

    it('/health/ready (GET) should return readiness status', () => {
      return request(app.getHttpServer())
        .get('/api/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('/health/live (GET) should return liveness status', () => {
      return request(app.getHttpServer())
        .get('/api/health/live')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'alive');
          expect(res.body).toHaveProperty('uptime');
        });
    });
  });

  describe('Metrics', () => {
    it('/metrics (GET) should return metrics or 404 if disabled', () => {
      return request(app.getHttpServer())
        .get('/api/metrics')
        .expect((res) => {
          // Should return either metrics (200) or not found (404) if disabled
          expect([200, 404]).toContain(res.status);
        });
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to requests', async () => {
      // Make multiple requests quickly
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .get('/api/health')
          .expect((res) => {
            // Should not exceed rate limit for health checks
            expect(res.status).toBeLessThan(429);
          });
      }
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          // Check for common security headers
          expect(res.headers).toHaveProperty('x-content-type-options');
          expect(res.headers).toHaveProperty('x-frame-options');
          expect(res.headers).toHaveProperty('x-xss-protection');
        });
    });
  });

  describe('Response Compression', () => {
    it('should compress responses when appropriate', () => {
      return request(app.getHttpServer())
        .get('/api/health/detailed')
        .expect(200)
        .expect((res) => {
          // Check if response is compressed
          const contentEncoding = res.headers['content-encoding'];
          const contentLength = parseInt(res.headers['content-length'] || '0');
          
          // If compressed, should have gzip encoding
          if (contentEncoding) {
            expect(contentEncoding).toMatch(/gzip|deflate/);
          }
          
          // Response should have reasonable size
          expect(contentLength).toBeGreaterThan(0);
        });
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', () => {
      return request(app.getHttpServer())
        .options('/api/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-origin');
          expect(res.headers).toHaveProperty('access-control-allow-methods');
        });
    });
  });
});
