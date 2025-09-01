import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ProfileService } from './profile.service';
import { ProfileUpdateDto, ApiResponse } from './profile.types';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /users/profile - ดึงข้อมูล profile (main endpoint)
  @Get('users/profile')
  @UseGuards(AuthGuard)
  async getUserProfile(@Request() req: any): Promise<ApiResponse<any>> {
    try {
      const email = req.user.email as string; // ✅ ใช้ email แทน user ID
      console.log('👤 Getting profile for email:', email);
      const profile = await this.profileService.getUserProfileByEmail(email);

      return {
        data: profile,
        message: 'Profile retrieved successfully',
      };
    } catch (error: any) {
      console.error('❌ Profile retrieval error:', error);
      throw new HttpException(
        'Failed to retrieve profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /user/profile - Alternative endpoint (without 's')
  @Get('user/profile')
  @UseGuards(AuthGuard)
  async getUserProfileAlt(@Request() req: any): Promise<ApiResponse<any>> {
    return this.getUserProfile(req);
  }

  // GET /profile - Short endpoint
  @Get('profile')
  @UseGuards(AuthGuard)
  async getUserProfileShort(@Request() req: any): Promise<ApiResponse<any>> {
    return this.getUserProfile(req);
  }

  // GET /me - User info endpoint
  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Request() req: any): Promise<ApiResponse<any>> {
    return this.getUserProfile(req);
  }

  // PUT /users/profile - อัพเดทข้อมูล profile (main endpoint)
  @Put('users/profile')
  @UseGuards(AuthGuard)
  async updateUserProfile(
    @Request() req: any,
    @Body() updateData: ProfileUpdateDto,
  ): Promise<ApiResponse<any>> {
    try {
      const email = req.user.email as string; // ✅ ใช้ email แทน user ID
      console.log('🔄 Updating profile for email:', email);
      console.log('Update data:', updateData);

      const updatedProfile = await this.profileService.updateUserProfileByEmail(
        email,
        updateData,
      );

      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: updatedProfile,
        message: 'Profile updated successfully',
      };
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      throw new HttpException(
        'Failed to update profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // PUT /user/profile - Alternative endpoint (without 's')
  @Put('user/profile')
  @UseGuards(AuthGuard)
  async updateUserProfileAlt(@Request() req: any, @Body() updateData: any) {
    return this.updateUserProfile(req, updateData as ProfileUpdateDto);
  }

  // PUT /profile - Short endpoint
  @Put('profile')
  @UseGuards(AuthGuard)
  async updateUserProfileShort(@Request() req: any, @Body() updateData: any) {
    return this.updateUserProfile(req, updateData as ProfileUpdateDto);
  }

  // PUT /me - User info update endpoint
  @Put('me')
  @UseGuards(AuthGuard)
  async updateMe(@Request() req: any, @Body() updateData: any) {
    return this.updateUserProfile(req, updateData as ProfileUpdateDto);
  }

  // PATCH endpoints for partial updates
  @Patch('users/profile')
  @UseGuards(AuthGuard)
  async patchUserProfile(@Request() req: any, @Body() updateData: any) {
    return this.updateUserProfile(req, updateData as ProfileUpdateDto);
  }

  @Patch('user/profile')
  @UseGuards(AuthGuard)
  async patchUserProfileAlt(@Request() req: any, @Body() updateData: any) {
    return this.updateUserProfile(req, updateData as ProfileUpdateDto);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  async patchProfile(@Request() req: any, @Body() updateData: any) {
    return this.updateUserProfile(req, updateData as ProfileUpdateDto);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async patchMe(@Request() req: any, @Body() updateData: any) {
    return this.updateUserProfile(req, updateData as ProfileUpdateDto);
  }

  // POST /users/profile - Create new profile (main endpoint)
  @Post('users/profile')
  @UseGuards(AuthGuard)
  async createUserProfile(
    @Request() req: any,
    @Body() profileData: ProfileUpdateDto,
  ): Promise<ApiResponse<any>> {
    try {
      const email = req.user.email as string; // ✅ ใช้ email แทน user ID
      console.log('🆕 Creating profile for email:', email);
      console.log('Profile data:', profileData);

      const newProfile = await this.profileService.createUserProfileByEmail(
        email,
        profileData,
      );

      return {
        data: newProfile,
        message: 'Profile created successfully',
      };
    } catch (error: any) {
      console.error('❌ Profile creation error:', error);
      throw new HttpException(
        'Failed to create profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // POST /user/profile - Alternative endpoint (without 's')
  @Post('user/profile')
  @UseGuards(AuthGuard)
  async createUserProfileAlt(@Request() req: any, @Body() profileData: any) {
    return this.createUserProfile(req, profileData as ProfileUpdateDto);
  }

  // POST /profile - Short endpoint
  @Post('profile')
  @UseGuards(AuthGuard)
  async createProfileShort(@Request() req: any, @Body() profileData: any) {
    return this.createUserProfile(req, profileData as ProfileUpdateDto);
  }
  // POST endpoint for profile updates (some frontends use POST)
  @Post('user/profile/update')
  @UseGuards(AuthGuard)
  async postUpdateUserProfile(@Request() req: any, @Body() updateData: any) {
    return this.updateUserProfile(req, updateData as ProfileUpdateDto);
  }
}
