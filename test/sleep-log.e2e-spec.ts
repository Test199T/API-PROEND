import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Sleep Log API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Use real login instead of mock token
    try {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.TEST_USER_EMAIL || 'test@example.com',
          password: process.env.TEST_USER_PASSWORD || 'password123',
        });

      if (loginResponse.status === 200) {
        authToken = loginResponse.body.access_token;
        testUserId = loginResponse.body.user.id;
      } else {
        // Fallback to mock token if login fails
        authToken = 'mock-jwt-token-for-testing';
        testUserId = 1;
      }
    } catch (error) {
      // Fallback to mock token if login fails
      authToken = 'mock-jwt-token-for-testing';
      testUserId = 1;
    }
  }, 15000);

  afterAll(async () => {
    await app.close();
  });

  describe('Public Endpoints', () => {
    describe('/sleep-log/test/public (GET)', () => {
      it('should return public test message', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/test/public')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('ทดสอบสำเร็จ');
            expect(res.body.data.message).toBe('Sleep Log API ทำงานได้ปกติ!');
            expect(res.body.data.status).toBe('active');
          });
      });
    });

    describe('/sleep-log/test/health-check (GET)', () => {
      it('should return health check status', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/test/health-check')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('ตรวจสอบสถานะสำเร็จ');
            expect(res.body.data.service).toBe('Sleep Log API');
            expect(res.body.data.status).toBe('healthy');
            expect(res.body.data.endpoints).toBeDefined();
            expect(res.body.data.endpoints.public).toBeDefined();
            expect(res.body.data.endpoints.protected).toBeDefined();
          });
      });
    });

    describe('/sleep-log/test/sample-data (GET)', () => {
      it('should return sample sleep log data', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/test/sample-data')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('ดึงข้อมูลตัวอย่างสำเร็จ');
            expect(res.body.data.sleep_logs).toBeDefined();
            expect(Array.isArray(res.body.data.sleep_logs)).toBe(true);
            expect(res.body.data.sleep_logs.length).toBeGreaterThan(0);
            expect(res.body.data.stats).toBeDefined();
          });
      });
    });
  });

  describe('Protected Endpoints', () => {
    describe('/sleep-log (POST)', () => {
      it('should create a new sleep log', () => {
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
          .expect(201)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('สร้างบันทึกการนอนสำเร็จ');
            expect(res.body.data.id).toBeDefined();
            expect(res.body.data.sleep_date).toBe(sleepLogData.sleep_date);
            expect(res.body.data.bedtime).toBe(sleepLogData.bedtime);
            expect(res.body.data.wake_time).toBe(sleepLogData.wake_time);
            expect(res.body.data.sleep_duration_hours).toBe(sleepLogData.sleep_duration_hours);
            expect(res.body.data.sleep_quality).toBe(sleepLogData.sleep_quality);
            expect(res.body.data.sleep_score).toBeDefined();
            expect(res.body.data.is_optimal_duration).toBeDefined();
          });
      });

      it('should reject invalid sleep log data', () => {
        const invalidSleepLogData = {
          sleep_date: 'invalid-date',
          bedtime: 'invalid-time',
          sleep_duration_hours: -1,
          sleep_quality: 'invalid-quality',
        };

        return request(app.getHttpServer())
          .post('/sleep-log')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidSleepLogData)
          .expect(400);
      });

      it('should reject request without authentication', () => {
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
    });

    describe('/sleep-log (GET)', () => {
      let createdSleepLogId: string;

      beforeEach(async () => {
        // Create a test sleep log
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

        const response = await request(app.getHttpServer())
          .post('/sleep-log')
          .set('Authorization', `Bearer ${authToken}`)
          .send(sleepLogData);

        createdSleepLogId = response.body.data.id;
      });

      it('should get all sleep logs for authenticated user', () => {
        return request(app.getHttpServer())
          .get('/sleep-log')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('ดึงรายการบันทึกการนอนสำเร็จ');
            expect(res.body.data.sleepLogs).toBeDefined();
            expect(Array.isArray(res.body.data.sleepLogs)).toBe(true);
            expect(res.body.data.total).toBeDefined();
            expect(res.body.data.page).toBeDefined();
            expect(res.body.data.limit).toBeDefined();
            expect(res.body.data.stats).toBeDefined();
          });
      });

      it('should get sleep logs with pagination', () => {
        return request(app.getHttpServer())
          .get('/sleep-log?page=1&limit=5')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data.page).toBe(1);
            expect(res.body.data.limit).toBe(5);
            expect(res.body.data.sleepLogs.length).toBeLessThanOrEqual(5);
          });
      });

      it('should filter sleep logs by quality', () => {
        return request(app.getHttpServer())
          .get('/sleep-log?sleep_quality=good')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data.sleepLogs).toBeDefined();
            if (res.body.data.sleepLogs.length > 0) {
              expect(res.body.data.sleepLogs[0].sleep_quality).toBe('good');
            }
          });
      });

      it('should reject request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log')
          .expect(401);
      });
    });

    describe('/sleep-log/:id (GET)', () => {
      let createdSleepLogId: string;

      beforeEach(async () => {
        // Create a test sleep log
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

        const response = await request(app.getHttpServer())
          .post('/sleep-log')
          .set('Authorization', `Bearer ${authToken}`)
          .send(sleepLogData);

        createdSleepLogId = response.body.data.id;
      });

      it('should get sleep log by ID', () => {
        return request(app.getHttpServer())
          .get(`/sleep-log/${createdSleepLogId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('ดึงข้อมูลบันทึกการนอนสำเร็จ');
            expect(res.body.data.id).toBe(createdSleepLogId);
            expect(res.body.data.sleep_date).toBeDefined();
            expect(res.body.data.bedtime).toBeDefined();
            expect(res.body.data.wake_time).toBeDefined();
            expect(res.body.data.sleep_score).toBeDefined();
          });
      });

      it('should return 404 for non-existent sleep log', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/999999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('should reject request without authentication', () => {
        return request(app.getHttpServer())
          .get(`/sleep-log/${createdSleepLogId}`)
          .expect(401);
      });
    });

    describe('/sleep-log/:id (PUT)', () => {
      let createdSleepLogId: string;

      beforeEach(async () => {
        // Create a test sleep log
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

        const response = await request(app.getHttpServer())
          .post('/sleep-log')
          .set('Authorization', `Bearer ${authToken}`)
          .send(sleepLogData);

        createdSleepLogId = response.body.data.id;
      });

      it('should update sleep log', () => {
        const updateData = {
          sleep_quality: 'excellent',
          sleep_efficiency_percentage: 95,
          notes: 'อัพเดท: นอนหลับได้ดีมาก',
        };

        return request(app.getHttpServer())
          .put(`/sleep-log/${createdSleepLogId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('อัพเดทบันทึกการนอนสำเร็จ');
            expect(res.body.data.id).toBe(createdSleepLogId);
            expect(res.body.data.sleep_quality).toBe(updateData.sleep_quality);
            expect(res.body.data.sleep_efficiency_percentage).toBe(updateData.sleep_efficiency_percentage);
            expect(res.body.data.notes).toBe(updateData.notes);
          });
      });

      it('should return 404 for non-existent sleep log', () => {
        const updateData = {
          sleep_quality: 'excellent',
        };

        return request(app.getHttpServer())
          .put('/sleep-log/999999')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(404);
      });

      it('should reject request without authentication', () => {
        const updateData = {
          sleep_quality: 'excellent',
        };

        return request(app.getHttpServer())
          .put(`/sleep-log/${createdSleepLogId}`)
          .send(updateData)
          .expect(401);
      });
    });

    describe('/sleep-log/:id (DELETE)', () => {
      let createdSleepLogId: string;

      beforeEach(async () => {
        // Create a test sleep log
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

        const response = await request(app.getHttpServer())
          .post('/sleep-log')
          .set('Authorization', `Bearer ${authToken}`)
          .send(sleepLogData);

        createdSleepLogId = response.body.data.id;
      });

      it('should delete sleep log', () => {
        return request(app.getHttpServer())
          .delete(`/sleep-log/${createdSleepLogId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('ลบข้อมูลบันทึกการนอนสำเร็จ');
            expect(res.body.data.message).toBe('ลบข้อมูลบันทึกการนอนสำเร็จ');
          });
      });

      it('should return 404 for non-existent sleep log', () => {
        return request(app.getHttpServer())
          .delete('/sleep-log/999999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('should reject request without authentication', () => {
        return request(app.getHttpServer())
          .delete(`/sleep-log/${createdSleepLogId}`)
          .expect(401);
      });
    });

    describe('/sleep-log/stats/overview (GET)', () => {
      beforeEach(async () => {
        // Create multiple test sleep logs for stats
        const sleepLogs = [
          {
            sleep_date: '2024-01-15',
            bedtime: '22:30:00',
            wake_time: '06:30:00',
            sleep_duration_hours: 8,
            sleep_quality: 'good',
            sleep_efficiency_percentage: 85,
            time_to_fall_asleep_minutes: 15,
            awakenings_count: 1,
          },
          {
            sleep_date: '2024-01-14',
            bedtime: '23:00:00',
            wake_time: '07:00:00',
            sleep_duration_hours: 8,
            sleep_quality: 'excellent',
            sleep_efficiency_percentage: 90,
            time_to_fall_asleep_minutes: 10,
            awakenings_count: 0,
          },
        ];

        for (const sleepLog of sleepLogs) {
          await request(app.getHttpServer())
            .post('/sleep-log')
            .set('Authorization', `Bearer ${authToken}`)
            .send(sleepLog);
        }
      });

      it('should get sleep statistics', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/stats/overview')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('ดึงสถิติการนอนสำเร็จ');
            expect(res.body.data.total_sleep_logs).toBeDefined();
            expect(res.body.data.average_sleep_duration_hours).toBeDefined();
            expect(res.body.data.average_sleep_efficiency_percentage).toBeDefined();
            expect(res.body.data.average_sleep_score).toBeDefined();
            expect(res.body.data.sleep_quality_distribution).toBeDefined();
            expect(res.body.data.sleep_duration_distribution).toBeDefined();
          });
      });

      it('should reject request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/stats/overview')
          .expect(401);
      });
    });

    describe('/sleep-log/trends (GET)', () => {
      beforeEach(async () => {
        // Create test sleep logs for trends
        const sleepLogs = [
          {
            sleep_date: '2024-01-15',
            bedtime: '22:30:00',
            wake_time: '06:30:00',
            sleep_duration_hours: 8,
            sleep_quality: 'good',
            sleep_efficiency_percentage: 85,
          },
          {
            sleep_date: '2024-01-14',
            bedtime: '23:00:00',
            wake_time: '07:00:00',
            sleep_duration_hours: 8,
            sleep_quality: 'excellent',
            sleep_efficiency_percentage: 90,
          },
        ];

        for (const sleepLog of sleepLogs) {
          await request(app.getHttpServer())
            .post('/sleep-log')
            .set('Authorization', `Bearer ${authToken}`)
            .send(sleepLog);
        }
      });

      it('should get sleep trends', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/trends')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('ดึงแนวโน้มการนอนสำเร็จ');
            expect(Array.isArray(res.body.data)).toBe(true);
            if (res.body.data.length > 0) {
              expect(res.body.data[0].date).toBeDefined();
              expect(res.body.data[0].sleep_duration_hours).toBeDefined();
              expect(res.body.data[0].sleep_score).toBeDefined();
              expect(res.body.data[0].sleep_quality).toBeDefined();
            }
          });
      });

      it('should get sleep trends with custom days parameter', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/trends?days=14')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
          });
      });

      it('should reject request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/trends')
          .expect(401);
      });
    });

    describe('/sleep-log/analysis (GET)', () => {
      beforeEach(async () => {
        // Create test sleep logs for analysis
        const sleepLogs = [
          {
            sleep_date: '2024-01-15',
            bedtime: '22:30:00',
            wake_time: '06:30:00',
            sleep_duration_hours: 8,
            sleep_quality: 'good',
            sleep_efficiency_percentage: 85,
            time_to_fall_asleep_minutes: 15,
            awakenings_count: 1,
          },
          {
            sleep_date: '2024-01-14',
            bedtime: '23:00:00',
            wake_time: '07:00:00',
            sleep_duration_hours: 8,
            sleep_quality: 'excellent',
            sleep_efficiency_percentage: 90,
            time_to_fall_asleep_minutes: 10,
            awakenings_count: 0,
          },
        ];

        for (const sleepLog of sleepLogs) {
          await request(app.getHttpServer())
            .post('/sleep-log')
            .set('Authorization', `Bearer ${authToken}`)
            .send(sleepLog);
        }
      });

      it('should get sleep analysis', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/analysis')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('ดึงการวิเคราะห์การนอนสำเร็จ');
            expect(res.body.data.overall_assessment).toBeDefined();
            expect(Array.isArray(res.body.data.strengths)).toBe(true);
            expect(Array.isArray(res.body.data.areas_for_improvement)).toBe(true);
            expect(Array.isArray(res.body.data.recommendations)).toBe(true);
            expect(res.body.data.sleep_score_trend).toBeDefined();
            expect(Array.isArray(res.body.data.key_metrics)).toBe(true);
          });
      });

      it('should get sleep analysis with custom days parameter', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/analysis?days=14')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.overall_assessment).toBeDefined();
          });
      });

      it('should reject request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/analysis')
          .expect(401);
      });
    });

    describe('/sleep-log/recommendations (GET)', () => {
      it('should get sleep recommendations', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/recommendations')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('ดึงคำแนะนำการนอนสำเร็จ');
            expect(Array.isArray(res.body.data)).toBe(true);
            if (res.body.data.length > 0) {
              expect(res.body.data[0].title).toBeDefined();
              expect(res.body.data[0].description).toBeDefined();
              expect(res.body.data[0].goal_type).toBeDefined();
              expect(res.body.data[0].suggested_priority).toBeDefined();
            }
          });
      });

      it('should reject request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/recommendations')
          .expect(401);
      });
    });
  });

  describe('Search Endpoints', () => {
    beforeEach(async () => {
      // Create test sleep logs for search
      const sleepLogs = [
        {
          sleep_date: '2024-01-15',
          bedtime: '22:30:00',
          wake_time: '06:30:00',
          sleep_duration_hours: 8,
          sleep_quality: 'good',
          sleep_efficiency_percentage: 85,
          notes: 'นอนหลับได้ดี',
        },
        {
          sleep_date: '2024-01-14',
          bedtime: '23:00:00',
          wake_time: '07:00:00',
          sleep_duration_hours: 8,
          sleep_quality: 'excellent',
          sleep_efficiency_percentage: 90,
          notes: 'นอนหลับลึกมาก',
        },
      ];

      for (const sleepLog of sleepLogs) {
        await request(app.getHttpServer())
          .post('/sleep-log')
          .set('Authorization', `Bearer ${authToken}`)
          .send(sleepLog);
      }
    });

    describe('/sleep-log/search/quality/:quality (GET)', () => {
      it('should search sleep logs by quality', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/quality/good')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            if (res.body.data.length > 0) {
              expect(res.body.data[0].sleep_quality).toBe('good');
            }
          });
      });

      it('should return empty array for non-existent quality', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/quality/nonexistent')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(0);
          });
      });

      it('should reject request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/quality/good')
          .expect(401);
      });
    });

    describe('/sleep-log/search/duration/:min/:max (GET)', () => {
      it('should search sleep logs by duration range', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/duration/7/9')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            if (res.body.data.length > 0) {
              expect(res.body.data[0].sleep_duration_hours).toBeGreaterThanOrEqual(7);
              expect(res.body.data[0].sleep_duration_hours).toBeLessThanOrEqual(9);
            }
          });
      });

      it('should reject request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/duration/7/9')
          .expect(401);
      });
    });

    describe('/sleep-log/search/date-range (GET)', () => {
      it('should search sleep logs by date range', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/date-range?from=2024-01-01&to=2024-01-31')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
          });
      });

      it('should reject request without authentication', () => {
        return request(app.getHttpServer())
          .get('/sleep-log/search/date-range?from=2024-01-01&to=2024-01-31')
          .expect(401);
      });
    });
  });
});
