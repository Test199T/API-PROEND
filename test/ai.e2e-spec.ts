import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AI API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token for testing
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'password123';

    // Register and login to get token
    await request(app.getHttpServer()).post('/auth/register').send({
      email: testEmail,
      password: testPassword,
      firstName: 'ทดสอบ',
      lastName: 'ผู้ใช้',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/ai/analyze (POST)', () => {
    it('should analyze health data with valid token', () => {
      return request(app.getHttpServer())
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          focus_area: 'overall',
          time_period: 'current',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.analysis).toBeDefined();
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/ai/analyze')
        .send({
          focus_area: 'overall',
          time_period: 'current',
        })
        .expect(401);
    });

    it('should reject invalid token', () => {
      return request(app.getHttpServer())
        .post('/ai/analyze')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          focus_area: 'overall',
          time_period: 'current',
        })
        .expect(401);
    });
  });

  describe('/ai/chat/start (POST)', () => {
    it('should start chat session with valid token', () => {
      return request(app.getHttpServer())
        .post('/ai/chat/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          initial_message: 'สวัสดีครับ',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.session_id).toBeDefined();
          expect(res.body.ai_response).toBeDefined();
        });
    });

    it('should require authentication for chat', () => {
      return request(app.getHttpServer())
        .post('/ai/chat/start')
        .send({
          initial_message: 'สวัสดีครับ',
        })
        .expect(401);
    });
  });

  describe('/ai/recommendations/{user_id} (GET)', () => {
    it('should get AI recommendations with valid token', () => {
      return request(app.getHttpServer())
        .get('/ai/recommendations/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.recommendations).toBeDefined();
        });
    });

    it('should require authentication for recommendations', () => {
      return request(app.getHttpServer())
        .get('/ai/recommendations/1')
        .expect(401);
    });
  });
});
