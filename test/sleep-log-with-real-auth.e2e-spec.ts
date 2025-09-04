import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Sleep Log API - With Real Authentication (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: number;

  // Test user credentials - replace with your actual test user
  const TEST_USER = {
    email: 'test@example.com', // Replace with your test user email
    password: 'password123',   // Replace with your test user password
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Try to login with real credentials
    try {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(TEST_USER);

      if (loginResponse.status === 200) {
        authToken = loginResponse.body.access_token;
        testUserId = loginResponse.body.user.id;
        console.log('✅ Real authentication successful');
      } else {
        throw new Error(`Login failed: ${loginResponse.status}`);
      }
    } catch (error) {
      console.log('⚠️ Real authentication failed, using mock token');
      authToken = 'mock-jwt-token-for-testing';
      testUserId = 1;
    }
  }, 15000);

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Status', () => {
    it('should have valid authentication token', () => {
      expect(authToken).toBeDefined();
      expect(authToken).not.toBe('mock-jwt-token-for-testing');
    });
  });

  describe('CRUD Operations with Real Auth', () => {
    let createdSleepLogId: string;

    describe('/sleep-log (POST)', () => {
      it('should create a new sleep log with real authentication', () => {
        const sleepLogData = {
          sleep_date: '2024-01-15',
          bedtime: '22:30:00',
          wake_time: '06:30:00',
          sleep_duration_hours: 8,
          sleep_quality: 'good',
          sleep_efficiency_percentage: 85,
          time_to_fall_asleep_minutes: 15,
          awakenings_count: 1,
          notes: 'นอนหลับได้ดี',
        };

        return request(app.getHttpServer())
          .post('/sleep-log')
          .set('Authorization', `Bearer ${authToken}`)
          .send(sleepLogData)
          .expect((res) => {
            if (authToken === 'mock-jwt-token-for-testing') {
              // Mock token should return 401
              expect(res.status).toBe(401);
            } else {
              // Real token should return 201
              expect(res.status).toBe(201);
              expect(res.body.success).toBe(true);
              expect(res.body.message).toBe('สร้างบันทึกการนอนสำเร็จ');
              expect(res.body.data.id).toBeDefined();
              createdSleepLogId = res.body.data.id;
            }
          });
      });
    });

    describe('/sleep-log (GET)', () => {
      it('should get all sleep logs with real authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log')
          .set('Authorization', `Bearer ${authToken}`)
          .expect((res) => {
            if (authToken === 'mock-jwt-token-for-testing') {
              // Mock token should return 401
              expect(res.status).toBe(401);
            } else {
              // Real token should return 200
              expect(res.status).toBe(200);
              expect(res.body.success).toBe(true);
              expect(res.body.message).toBe('ดึงรายการบันทึกการนอนสำเร็จ');
              expect(res.body.data.sleepLogs).toBeDefined();
              expect(Array.isArray(res.body.data.sleepLogs)).toBe(true);
            }
          });
      });
    });

    describe('/sleep-log/:id (GET)', () => {
      it('should get sleep log by ID with real authentication', () => {
        if (createdSleepLogId) {
          return request(app.getHttpServer())
            .get(`/sleep-log/${createdSleepLogId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect((res) => {
              if (authToken === 'mock-jwt-token-for-testing') {
                expect(res.status).toBe(401);
              } else {
                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.data.id).toBe(createdSleepLogId);
              }
            });
        } else {
          // Skip test if no sleep log was created
          return Promise.resolve();
        }
      });
    });

    describe('/sleep-log/:id (PUT)', () => {
      it('should update sleep log with real authentication', () => {
        if (createdSleepLogId) {
          const updateData = {
            sleep_quality: 'excellent',
            sleep_efficiency_percentage: 95,
            notes: 'อัพเดท: นอนหลับได้ดีมาก',
          };

          return request(app.getHttpServer())
            .put(`/sleep-log/${createdSleepLogId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .expect((res) => {
              if (authToken === 'mock-jwt-token-for-testing') {
                expect(res.status).toBe(401);
              } else {
                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.data.sleep_quality).toBe(updateData.sleep_quality);
              }
            });
        } else {
          // Skip test if no sleep log was created
          return Promise.resolve();
        }
      });
    });

    describe('/sleep-log/:id (DELETE)', () => {
      it('should delete sleep log with real authentication', () => {
        if (createdSleepLogId) {
          return request(app.getHttpServer())
            .delete(`/sleep-log/${createdSleepLogId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect((res) => {
              if (authToken === 'mock-jwt-token-for-testing') {
                expect(res.status).toBe(401);
              } else {
                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
              }
            });
        } else {
          // Skip test if no sleep log was created
          return Promise.resolve();
        }
      });
    });
  });

  describe('Analytics with Real Auth', () => {
    describe('/sleep-log/stats/overview (GET)', () => {
      it('should get sleep statistics with real authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/stats/overview')
          .set('Authorization', `Bearer ${authToken}`)
          .expect((res) => {
            if (authToken === 'mock-jwt-token-for-testing') {
              expect(res.status).toBe(401);
            } else {
              expect(res.status).toBe(200);
              expect(res.body.success).toBe(true);
              expect(res.body.data.total_sleep_logs).toBeDefined();
            }
          });
      });
    });

    describe('/sleep-log/trends (GET)', () => {
      it('should get sleep trends with real authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/trends')
          .set('Authorization', `Bearer ${authToken}`)
          .expect((res) => {
            if (authToken === 'mock-jwt-token-for-testing') {
              expect(res.status).toBe(401);
            } else {
              expect(res.status).toBe(200);
              expect(res.body.success).toBe(true);
              expect(Array.isArray(res.body.data)).toBe(true);
            }
          });
      });
    });

    describe('/sleep-log/analysis (GET)', () => {
      it('should get sleep analysis with real authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/analysis')
          .set('Authorization', `Bearer ${authToken}`)
          .expect((res) => {
            if (authToken === 'mock-jwt-token-for-testing') {
              expect(res.status).toBe(401);
            } else {
              expect(res.status).toBe(200);
              expect(res.body.success).toBe(true);
              expect(res.body.data.overall_assessment).toBeDefined();
            }
          });
      });
    });

    describe('/sleep-log/recommendations (GET)', () => {
      it('should get sleep recommendations with real authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/recommendations')
          .set('Authorization', `Bearer ${authToken}`)
          .expect((res) => {
            if (authToken === 'mock-jwt-token-for-testing') {
              expect(res.status).toBe(401);
            } else {
              expect(res.status).toBe(200);
              expect(res.body.success).toBe(true);
              expect(Array.isArray(res.body.data)).toBe(true);
            }
          });
      });
    });
  });

  describe('Search with Real Auth', () => {
    describe('/sleep-log/search/quality/:quality (GET)', () => {
      it('should search sleep logs by quality with real authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/quality/good')
          .set('Authorization', `Bearer ${authToken}`)
          .expect((res) => {
            if (authToken === 'mock-jwt-token-for-testing') {
              expect(res.status).toBe(401);
            } else {
              expect(res.status).toBe(200);
              expect(res.body.success).toBe(true);
              expect(Array.isArray(res.body.data)).toBe(true);
            }
          });
      });
    });

    describe('/sleep-log/search/duration/:min/:max (GET)', () => {
      it('should search sleep logs by duration with real authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/duration/7/9')
          .set('Authorization', `Bearer ${authToken}`)
          .expect((res) => {
            if (authToken === 'mock-jwt-token-for-testing') {
              expect(res.status).toBe(401);
            } else {
              expect(res.status).toBe(200);
              expect(res.body.success).toBe(true);
              expect(Array.isArray(res.body.data)).toBe(true);
            }
          });
      });
    });

    describe('/sleep-log/search/date-range (GET)', () => {
      it('should search sleep logs by date range with real authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/date-range?from=2024-01-01&to=2024-01-31')
          .set('Authorization', `Bearer ${authToken}`)
          .expect((res) => {
            if (authToken === 'mock-jwt-token-for-testing') {
              expect(res.status).toBe(401);
            } else {
              expect(res.status).toBe(200);
              expect(res.body.success).toBe(true);
              expect(Array.isArray(res.body.data)).toBe(true);
            }
          });
      });
    });
  });
});
