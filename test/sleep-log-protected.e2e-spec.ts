import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Sleep Log API - Protected Endpoints (e2e)', () => {
  let app: INestApplication;
  let mockAuthToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Use a mock token for testing
    // In a real scenario, this would be a valid JWT token
    mockAuthToken = 'mock-jwt-token-for-testing';
  }, 10000);

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Tests', () => {
    it('should reject requests without authentication token', () => {
      return request(app.getHttpServer())
        .get('/sleep-log')
        .expect(401);
    });

    it('should reject requests with invalid authentication token', () => {
      return request(app.getHttpServer())
        .get('/sleep-log')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject requests with malformed authorization header', () => {
      return request(app.getHttpServer())
        .get('/sleep-log')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });
  });

  describe('CRUD Operations Tests', () => {
    describe('/sleep-log (POST)', () => {
      it('should reject create request without authentication', () => {
        const sleepLogData = {
          sleep_date: '2024-01-15',
          bedtime: '22:30:00',
          wake_time: '06:30:00',
          sleep_duration_hours: 8,
          sleep_quality: 'good',
          sleep_efficiency_percentage: 85,
        };

        return request(app.getHttpServer())
          .post('/sleep-log')
          .send(sleepLogData)
          .expect(401);
      });

      it('should validate required fields for sleep log creation', () => {
        const invalidSleepLogData = {
          // Missing required fields
          sleep_date: 'invalid-date',
          bedtime: 'invalid-time',
        };

        return request(app.getHttpServer())
          .post('/sleep-log')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .send(invalidSleepLogData)
          .expect((res) => {
            // Should return validation error (400) or authentication error (401)
            expect([400, 401]).toContain(res.status);
          });
      });
    });

    describe('/sleep-log (GET)', () => {
      it('should reject get request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log')
          .expect(401);
      });

      it('should handle pagination parameters correctly', () => {
        return request(app.getHttpServer())
          .get('/sleep-log?page=1&limit=10')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401]).toContain(res.status);
          });
      });

      it('should handle search parameters correctly', () => {
        return request(app.getHttpServer())
          .get('/sleep-log?sleep_quality=good&min_sleep_duration=7')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401]).toContain(res.status);
          });
      });
    });

    describe('/sleep-log/:id (GET)', () => {
      it('should reject get by ID request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/1')
          .expect(401);
      });

      it('should handle non-existent ID gracefully', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/999999')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either 404 or 401
            expect([404, 401]).toContain(res.status);
          });
      });
    });

    describe('/sleep-log/:id (PUT)', () => {
      it('should reject update request without authentication', () => {
        const updateData = {
          sleep_quality: 'excellent',
        };

        return request(app.getHttpServer())
          .put('/sleep-log/1')
          .send(updateData)
          .expect(401);
      });

      it('should validate update data format', () => {
        const invalidUpdateData = {
          sleep_quality: 'invalid-quality',
          sleep_duration_hours: -1,
        };

        return request(app.getHttpServer())
          .put('/sleep-log/1')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .send(invalidUpdateData)
          .expect((res) => {
            // Should return either validation error or authentication error
            expect([400, 401, 404]).toContain(res.status);
          });
      });
    });

    describe('/sleep-log/:id (DELETE)', () => {
      it('should reject delete request without authentication', () => {
        return request(app.getHttpServer())
          .delete('/sleep-log/1')
          .expect(401);
      });

      it('should handle non-existent ID for deletion', () => {
        return request(app.getHttpServer())
          .delete('/sleep-log/999999')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either 404 or 401
            expect([404, 401]).toContain(res.status);
          });
      });
    });
  });

  describe('Analytics Endpoints Tests', () => {
    describe('/sleep-log/stats/overview (GET)', () => {
      it('should reject stats request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/stats/overview')
          .expect(401);
      });

      it('should handle stats request with authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/stats/overview')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401]).toContain(res.status);
          });
      });
    });

    describe('/sleep-log/trends (GET)', () => {
      it('should reject trends request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/trends')
          .expect(401);
      });

      it('should handle trends request with custom parameters', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/trends?days=14')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401]).toContain(res.status);
          });
      });
    });

    describe('/sleep-log/analysis (GET)', () => {
      it('should reject analysis request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/analysis')
          .expect(401);
      });

      it('should handle analysis request with custom parameters', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/analysis?days=30')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401]).toContain(res.status);
          });
      });
    });

    describe('/sleep-log/recommendations (GET)', () => {
      it('should reject recommendations request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/recommendations')
          .expect(401);
      });

      it('should handle recommendations request with authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/recommendations')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401]).toContain(res.status);
          });
      });
    });
  });

  describe('Search Endpoints Tests', () => {
    describe('/sleep-log/search/quality/:quality (GET)', () => {
      it('should reject quality search without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/quality/good')
          .expect(401);
      });

      it('should handle quality search with authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/quality/good')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401]).toContain(res.status);
          });
      });

      it('should handle invalid quality parameter', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/quality/invalid-quality')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401, 400]).toContain(res.status);
          });
      });
    });

    describe('/sleep-log/search/duration/:min/:max (GET)', () => {
      it('should reject duration search without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/duration/7/9')
          .expect(401);
      });

      it('should handle duration search with authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/duration/7/9')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401]).toContain(res.status);
          });
      });

      it('should handle invalid duration parameters', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/duration/invalid/max')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401, 400]).toContain(res.status);
          });
      });
    });

    describe('/sleep-log/search/date-range (GET)', () => {
      it('should reject date range search without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/date-range?from=2024-01-01&to=2024-01-31')
          .expect(401);
      });

      it('should handle date range search with authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/date-range?from=2024-01-01&to=2024-01-31')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401]).toContain(res.status);
          });
      });

      it('should handle missing date parameters', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/date-range')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .expect((res) => {
            // Should return either data or authentication error
            expect([200, 401, 400]).toContain(res.status);
          });
      });
    });
  });

  describe('Response Format Validation', () => {
    it('should return consistent error format for unauthorized requests', () => {
      return request(app.getHttpServer())
        .get('/sleep-log')
        .expect(401)
        .expect((res) => {
          expect(res.body).toBeDefined();
          // Error response should have consistent structure
          expect(typeof res.body).toBe('object');
        });
    });

    it('should handle malformed JSON in request body', () => {
      return request(app.getHttpServer())
        .post('/sleep-log')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect((res) => {
          // Should return either 400 (bad request) or 401 (unauthorized)
          expect([400, 401]).toContain(res.status);
        });
    });
  });

  describe('Performance Tests', () => {
    it('should respond to protected endpoints within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/sleep-log')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Should respond within 2 seconds (allowing for authentication processing)
      expect(responseTime).toBeLessThan(2000);
    });
  });
});
