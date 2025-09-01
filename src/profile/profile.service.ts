import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../services/supabase.service';
import { ProfileUpdateDto } from './profile.types';

@Injectable()
export class ProfileService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // ✅ ใช้ email หา user แทน userId
  async getUserProfileByEmail(email: string): Promise<any> {
    try {
      console.log('🔍 Finding user by email:', email);
      
      // หา user จาก email ใน database โดยใช้ SupabaseService ที่มีอยู่แล้ว
      const profile = await this.supabaseService.getUserByEmail(email);

      if (!profile) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      console.log('✅ Found user:', { id: profile.id, email: profile.email });
      return profile;
    } catch (error: any) {
      console.error('Database error:', error);
      throw new NotFoundException(`User with email ${email} not found`);
    }
  }

  async createUserProfileByEmail(
    email: string,
    profileData: ProfileUpdateDto,
  ): Promise<any> {
    try {
      console.log('🆕 Creating/updating user profile by email:', email);
      
      // อัพเดท profile ของ user โดยใช้ email แทน id
      const { data: updatedUser, error } = await this.supabaseService
        .getClient()
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('email', email)
        .eq('is_active', true)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw new NotFoundException('Failed to create/update user profile');
      }

      console.log('✅ Profile created/updated successfully:', {
        id: updatedUser.id,
        email: updatedUser.email,
      });
      return updatedUser;
    } catch (error: any) {
      console.error('Database create error:', error);
      throw new NotFoundException('Failed to create user profile');
    }
  }

  async updateUserProfileByEmail(
    email: string,
    updateData: ProfileUpdateDto,
  ): Promise<any> {
    try {
      console.log('🔄 Updating user profile by email:', { email, updateData });

      // อัพเดท profile
      const { data: updatedUser, error } = await this.supabaseService
        .getClient()
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('email', email)
        .eq('is_active', true)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw new NotFoundException('Failed to update user profile');
      }

      console.log('✅ Profile updated successfully:', {
        id: updatedUser.id,
        email: updatedUser.email,
      });
      return updatedUser;
    } catch (error: any) {
      console.error('Database update error:', error);
      throw new NotFoundException('Failed to update user profile');
    }
  }

  // เก็บ original methods ไว้เผื่อมีส่วนอื่นใช้
  async getUserProfile(userId: string): Promise<any> {
    try {
      // ใช้ getUserById จาก SupabaseService ที่มีอยู่แล้ว
      const profile: any = await this.supabaseService.getUserById(
        parseInt(userId, 10),
      );

      if (!profile) {
        throw new NotFoundException('User profile not found');
      }

      return profile;
    } catch (error: any) {
      console.error('Database error:', error);
      throw new NotFoundException('User profile not found');
    }
  }

  async updateUserProfile(
    userId: string,
    updateData: ProfileUpdateDto,
  ): Promise<any> {
    try {
      console.log('Updating user profile in database:', {
        userId,
        updateData,
      } as any);

      // ใช้ updateUser จาก SupabaseService ที่มีอยู่แล้ว
      const updatedProfile: any = await this.supabaseService.updateUser(
        parseInt(userId, 10),
        {
          ...updateData,
          updated_at: new Date().toISOString(),
        },
      );

      if (!updatedProfile) {
        throw new NotFoundException('Failed to update user profile');
      }

      console.log('Profile updated successfully:', updatedProfile);
      return updatedProfile;
    } catch (error: any) {
      console.error('Database update error:', error);
      throw new NotFoundException('Failed to update user profile');
    }
  }

  async createUserProfile(
    userId: string,
    profileData: ProfileUpdateDto,
  ): Promise<any> {
    try {
      console.log('Creating user profile in database:', {
        userId,
        profileData,
      } as any);

      // First, check if profile already exists
      try {
        const existingProfile = await this.getUserProfile(userId);
        if (existingProfile) {
          console.log('Profile already exists, updating instead...');
          return this.updateUserProfile(userId, profileData);
        }
      } catch (error) {
        // Profile doesn't exist, create new one
        console.log('Profile not found, creating new one...');
      }

      // Create new profile by updating user data (upsert)
      const newProfile = await this.supabaseService.updateUser(
        parseInt(userId, 10),
        {
          ...profileData,
          updated_at: new Date().toISOString(),
        },
      );

      if (!newProfile) {
        throw new NotFoundException('Failed to create user profile');
      }

      console.log('Profile created successfully:', newProfile);
      return newProfile;
    } catch (error: any) {
      console.error('Database create error:', error);
      throw new NotFoundException('Failed to create user profile');
    }
  }
}
