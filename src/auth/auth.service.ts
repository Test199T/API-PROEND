import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'your-secret-key';

    if (!supabaseUrl || !supabaseAnonKey) {
      this.logger.error(
        'SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables',
      );
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.logger.log('Supabase client initialized successfully');
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      this.logger.log(`Attempting to register user: ${registerDto.email}`);

      // First, create user in Supabase Auth
      const { data: authData, error: authError } =
        await this.supabase.auth.signUp({
          email: registerDto.email,
          password: registerDto.password,
        });

      if (authError) {
        this.logger.error(
          `Supabase auth error: ${authError.message}`,
          authError,
        );
        throw new BadRequestException(
          `Authentication error: ${authError.message}`,
        );
      }

      if (!authData.user) {
        this.logger.error('No user data returned from Supabase auth');
        throw new BadRequestException(
          'Registration failed - no user data received',
        );
      }

      this.logger.log(`User created in auth: ${authData.user.id}`);

      // Store password as plain text (for testing)
      // Then, create user record in our users table
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .insert({
          username: registerDto.email.split('@')[0], // Use email prefix as username
          email: registerDto.email,
          password_hash: registerDto.password, // Store plain text password for testing
          first_name: registerDto.firstName,
          last_name: registerDto.lastName,
          // date_of_birth: null, // Optional
          // gender: null, // Optional
          // height_cm: null, // Optional
          // weight_kg: null, // Optional
          // activity_level: null, // Optional
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (userError) {
        this.logger.error(`Database error: ${userError.message}`, userError);

        // If user creation fails, we should clean up the auth user
        try {
          await this.supabase.auth.admin.deleteUser(authData.user.id);
          this.logger.log(`Cleaned up auth user: ${authData.user.id}`);
        } catch (cleanupError) {
          this.logger.error(
            `Failed to cleanup auth user: ${cleanupError.message}`,
          );
        }

        throw new BadRequestException(
          `Failed to create user profile: ${userError.message}`,
        );
      }

      this.logger.log(`User profile created successfully: ${userData.id}`);

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
      this.logger.error(`Registration failed for ${registerDto.email}:`, error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle specific error types
      if (error.message?.includes('fetch failed')) {
        throw new BadRequestException(
          'Database connection failed. Please try again later.',
        );
      }

      if (error.message?.includes('network')) {
        throw new BadRequestException(
          'Network error. Please check your connection and try again.',
        );
      }

      throw new BadRequestException(`Registration failed: ${error.message}`);
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      this.logger.log(`Login attempt for: ${loginDto.email}`);
      
      // First, check if user exists in our database
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', loginDto.email)
        .single();

      if (userError || !userData) {
        this.logger.warn(`User not found: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!userData.is_active) {
        this.logger.warn(`Inactive user login attempt: ${loginDto.email}`);
        throw new UnauthorizedException('Account is deactivated');
      }

      // Verify password using plain text comparison (for testing)
      if (userData.password_hash !== loginDto.password) {
        this.logger.warn(`Invalid password for: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT tokens
      const payload = {
        sub: userData.id, // Use id (numeric primary key)
        email: userData.email,
        username: userData.username,
      };

      const accessToken = jwt.sign(payload, this.jwtSecret, {
        expiresIn: '24h',
      });
      const refreshToken = jwt.sign(payload, this.jwtSecret, {
        expiresIn: '7d',
      });

      this.logger.log(`Login successful for: ${loginDto.email}`);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: userData.id, // Use id (numeric primary key)
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
        },
      };
    } catch (error) {
      this.logger.error(`Login failed for ${loginDto.email}:`, error);
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
      // Verify JWT token using jwt library
      const payload = jwt.verify(accessToken, this.jwtSecret) as any;
      const userId = payload.sub;

      // Get user profile from our users table
      const { data: userData, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId) // Use id (numeric primary key)
        .single();

      if (error || !userData) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: userData.id, // Use id (numeric primary key)
        email: userData.email,
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        username: userData.username || '',
        dateOfBirth: userData.date_of_birth || null,
        gender: userData.gender || null,
        height: userData.height_cm || null, // Use height_cm
        profileImageUrl: userData.profile_image_url || null,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at || null,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async updateProfile(accessToken: string, updateData: any): Promise<any> {
    try {
      // Verify JWT token using jwt library
      const payload = jwt.verify(accessToken, this.jwtSecret) as any;
      const userId = payload.sub;

      // Update user profile in our users table
      const { data: userData, error: updateError } = await this.supabase
        .from('users')
        .update({
          first_name: updateData.firstName,
          last_name: updateData.lastName,
          username: updateData.username,
          date_of_birth: updateData.dateOfBirth,
          gender: updateData.gender,
          height_cm: updateData.height, // Use height_cm
          profile_image_url: updateData.profileImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId) // Use id (numeric primary key)
        .select()
        .single();

      if (updateError) {
        throw new BadRequestException('Failed to update profile');
      }

      return {
        id: userData.id, // Use id (numeric primary key)
        email: userData.email,
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        username: userData.username || '',
        dateOfBirth: userData.date_of_birth || null,
        gender: userData.gender || null,
        height: userData.height_cm || null, // Use height_cm
        profileImageUrl: userData.profile_image_url || null,
        createdAt: userData.created_at,
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
