import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw BadRequestException for invalid registration', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Mock Supabase to return an error
      jest.spyOn(service as any, 'supabase').mockReturnValue({
        auth: {
          signUp: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'User already exists' },
          }),
        },
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Mock Supabase to return an error
      jest.spyOn(service as any, 'supabase').mockReturnValue({
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid credentials' },
          }),
        },
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
