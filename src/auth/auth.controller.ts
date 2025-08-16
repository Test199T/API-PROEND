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
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Headers('authorization') authHeader: string,
  ): Promise<{ message: string }> {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }
    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: { refresh_token: string },
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @Headers('authorization') authHeader: string,
  ): Promise<ProfileResponseDto> {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }
    return this.authService.getProfile(token);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Headers('authorization') authHeader: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }
    return this.authService.updateProfile(token, updateProfileDto);
  }
}
