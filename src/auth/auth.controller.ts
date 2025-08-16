import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  UpdateProfileDto,
  ProfileResponseDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      this.logger.log(`Registration request received for: ${registerDto.email}`);
      const result = await this.authService.register(registerDto);
      this.logger.log(`Registration successful for: ${registerDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Registration failed for ${registerDto.email}:`, error);
      throw error; // Re-throw to let the global exception filter handle it
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      this.logger.log(`Login attempt for: ${loginDto.email}`);
      const result = await this.authService.login(loginDto);
      this.logger.log(`Login successful for: ${loginDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Login failed for ${loginDto.email}:`, error);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Headers('authorization') authHeader: string,
  ): Promise<{ message: string }> {
    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
      await this.authService.logout(token);
      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error('Logout failed:', error);
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: { refresh_token: string },
  ): Promise<AuthResponseDto> {
    try {
      if (!body.refresh_token) {
        throw new BadRequestException('Refresh token is required');
      }
      return await this.authService.refreshToken(body.refresh_token);
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @Headers('authorization') authHeader: string,
  ): Promise<ProfileResponseDto> {
    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
      return await this.authService.getProfile(token);
    } catch (error) {
      this.logger.error('Profile retrieval failed:', error);
      throw error;
    }
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Headers('authorization') authHeader: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
      return await this.authService.updateProfile(token, updateProfileDto);
    } catch (error) {
      this.logger.error('Profile update failed:', error);
      throw error;
    }
  }
}
