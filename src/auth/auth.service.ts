import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase.config';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      // First, create user in Supabase Auth
      const { data: authData, error: authError } =
        await this.supabase.auth.signUp({
          email: registerDto.email,
          password: registerDto.password,
        });

      if (authError) {
        throw new BadRequestException(authError.message);
      }

      if (!authData.user) {
        throw new BadRequestException('Registration failed');
      }

      // Then, create user record in our users table
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .insert({
          user_id: authData.user.id,
          email: registerDto.email,
          first_name: registerDto.firstName,
          last_name: registerDto.lastName,
          username: registerDto.email.split('@')[0], // Use email prefix as username
        })
        .select()
        .single();

      if (userError) {
        // If user creation fails, we should clean up the auth user
        await this.supabase.auth.admin.deleteUser(authData.user.id);
        throw new BadRequestException('Failed to create user profile');
      }

      return {
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
          firstName: userData.first_name || registerDto.firstName,
          lastName: userData.last_name || registerDto.lastName,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (error) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!data.user || !data.session) {
        throw new UnauthorizedException('Login failed');
      }

      // Get user profile from our users table
      const { data: userData } = await this.supabase
        .from('users')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          firstName: userData?.first_name || '',
          lastName: userData?.last_name || '',
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async logout(accessToken: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        throw new BadRequestException('Logout failed');
      }
    } catch (error) {
      throw new BadRequestException('Logout failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!data.user || !data.session) {
        throw new UnauthorizedException('Token refresh failed');
      }

      // Get user profile from our users table
      const { data: userData } = await this.supabase
        .from('users')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          firstName: userData?.first_name || '',
          lastName: userData?.last_name || '',
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  async getProfile(accessToken: string): Promise<any> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(accessToken);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Get user profile from our users table
      const { data: userData } = await this.supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email,
        firstName: userData?.first_name || '',
        lastName: userData?.last_name || '',
        username: userData?.username || '',
        dateOfBirth: userData?.date_of_birth || null,
        gender: userData?.gender || null,
        height: userData?.height || null,
        profileImageUrl: userData?.profile_image_url || null,
        createdAt: userData?.created_at || user.created_at,
        updatedAt: userData?.updated_at || null,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async updateProfile(accessToken: string, updateData: any): Promise<any> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(accessToken);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Update user profile in our users table
      const { data: userData, error: updateError } = await this.supabase
        .from('users')
        .update({
          first_name: updateData.firstName,
          last_name: updateData.lastName,
          username: updateData.username,
          date_of_birth: updateData.dateOfBirth,
          gender: updateData.gender,
          height: updateData.height,
          profile_image_url: updateData.profileImageUrl,
          updated_at: new Date(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw new BadRequestException('Failed to update profile');
      }

      return {
        id: user.id,
        email: user.email,
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        username: userData.username || '',
        dateOfBirth: userData.date_of_birth || null,
        gender: userData.gender || null,
        height: userData.height || null,
        profileImageUrl: userData.profile_image_url || null,
        createdAt: userData.created_at || user.created_at,
        updatedAt: userData.updated_at || null,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update profile');
    }
  }
}
