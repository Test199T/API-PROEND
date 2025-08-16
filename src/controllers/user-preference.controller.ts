import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { SupabaseService } from '../services/supabase.service';
import {
  CreateUserPreferenceDto,
  UpdateUserPreferenceDto,
  UserPreferenceResponseDto,
  NotificationPreferenceDto,
  PrivacyPreferenceDto,
} from '../dto/user-preference.dto';
import { ResponseDto } from '../dto/common.dto';

@Controller('user-preferences')
@UseGuards(AuthGuard)
export class UserPreferenceController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUserPreference(
    @Body() createUserPreferenceDto: CreateUserPreferenceDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<UserPreferenceResponseDto>> {
    try {
      const userPreference = await this.supabaseService.createUserPreference({
        ...createUserPreferenceDto,
        user_id: userId,
      });

      return ResponseDto.success(
        userPreference,
        'User preference created successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to create user preference',
        error.message,
      );
    }
  }

  @Get()
  async getUserPreference(
    @User('id') userId: number,
  ): Promise<ResponseDto<UserPreferenceResponseDto>> {
    try {
      const userPreference =
        await this.supabaseService.getUserPreference(userId);

      if (!userPreference) {
        return ResponseDto.error('User preference not found');
      }

      return ResponseDto.success(
        userPreference,
        'User preference retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve user preference',
        error.message,
      );
    }
  }

  @Put()
  async updateUserPreference(
    @Body() updateUserPreferenceDto: UpdateUserPreferenceDto,
    @User('id') userId: number,
  ): Promise<ResponseDto<UserPreferenceResponseDto>> {
    try {
      const userPreference = await this.supabaseService.updateUserPreference(
        userId,
        updateUserPreferenceDto,
      );

      if (!userPreference) {
        return ResponseDto.error('User preference not found');
      }

      return ResponseDto.success(
        userPreference,
        'User preference updated successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to update user preference',
        error.message,
      );
    }
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserPreference(
    @User('id') userId: number,
  ): Promise<ResponseDto<null>> {
    try {
      const deleted = await this.supabaseService.deleteUserPreference(userId);

      if (!deleted) {
        return ResponseDto.error('User preference not found');
      }

      return ResponseDto.success(null, 'User preference deleted successfully');
    } catch (error) {
      return ResponseDto.error(
        'Failed to delete user preference',
        error.message,
      );
    }
  }

  @Get('theme')
  async getUserTheme(@User('id') userId: number): Promise<ResponseDto<any>> {
    try {
      const theme = await this.supabaseService.getUserTheme(userId);
      return ResponseDto.success(theme, 'User theme retrieved successfully');
    } catch (error) {
      return ResponseDto.error('Failed to retrieve user theme', error.message);
    }
  }

  @Put('theme')
  async updateUserTheme(
    @Body() themeData: { theme: string },
    @User('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      const theme = await this.supabaseService.updateUserTheme(
        userId,
        themeData.theme,
      );
      return ResponseDto.success(theme, 'User theme updated successfully');
    } catch (error) {
      return ResponseDto.error('Failed to update user theme', error.message);
    }
  }

  @Get('language')
  async getUserLanguage(@User('id') userId: string): Promise<ResponseDto<any>> {
    try {
      const language = await this.supabaseService.getUserLanguage(userId);
      return ResponseDto.success(
        language,
        'User language retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve user language',
        error.message,
      );
    }
  }

  @Put('language')
  async updateUserLanguage(
    @Body() languageData: { language: string },
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const language = await this.supabaseService.updateUserLanguage(
        userId,
        languageData.language,
      );
      return ResponseDto.success(
        language,
        'User language updated successfully',
      );
    } catch (error) {
      return ResponseDto.error('Failed to update user language', error.message);
    }
  }

  @Get('measurement-unit')
  async getUserMeasurementUnit(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const unit = await this.supabaseService.getUserMeasurementUnit(userId);
      return ResponseDto.success(
        unit,
        'User measurement unit retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve user measurement unit',
        error.message,
      );
    }
  }

  @Put('measurement-unit')
  async updateUserMeasurementUnit(
    @Body() unitData: { measurement_unit: string },
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const unit = await this.supabaseService.updateUserMeasurementUnit(
        userId,
        unitData.measurement_unit,
      );
      return ResponseDto.success(
        unit,
        'User measurement unit updated successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to update user measurement unit',
        error.message,
      );
    }
  }

  @Get('privacy')
  async getUserPrivacySettings(
    @User('id') userId: string,
  ): Promise<ResponseDto<PrivacyPreferenceDto>> {
    try {
      const privacy = await this.supabaseService.getUserPrivacySettings(userId);
      return ResponseDto.success(
        privacy,
        'User privacy settings retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve user privacy settings',
        error.message,
      );
    }
  }

  @Put('privacy')
  async updateUserPrivacySettings(
    @Body() privacyDto: PrivacyPreferenceDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<PrivacyPreferenceDto>> {
    try {
      const privacy = await this.supabaseService.updateUserPrivacySettings(
        userId,
        privacyDto,
      );
      return ResponseDto.success(
        privacy,
        'User privacy settings updated successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to update user privacy settings',
        error.message,
      );
    }
  }

  @Get('notifications')
  async getUserNotificationPreferences(
    @User('id') userId: string,
  ): Promise<ResponseDto<NotificationPreferenceDto>> {
    try {
      const notifications =
        await this.supabaseService.getUserNotificationPreferences(userId);
      return ResponseDto.success(
        notifications,
        'User notification preferences retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve user notification preferences',
        error.message,
      );
    }
  }

  @Put('notifications')
  async updateUserNotificationPreferences(
    @Body() notificationDto: NotificationPreferenceDto,
    @User('id') userId: string,
  ): Promise<ResponseDto<NotificationPreferenceDto>> {
    try {
      const notifications =
        await this.supabaseService.updateUserNotificationPreferences(
          userId,
          notificationDto,
        );
      return ResponseDto.success(
        notifications,
        'User notification preferences updated successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to update user notification preferences',
        error.message,
      );
    }
  }

  @Get('health-focus-areas')
  async getUserHealthFocusAreas(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const areas = await this.supabaseService.getUserHealthFocusAreas(userId);
      return ResponseDto.success(
        areas,
        'User health focus areas retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve user health focus areas',
        error.message,
      );
    }
  }

  @Put('health-focus-areas')
  async updateUserHealthFocusAreas(
    @Body() areasData: { health_focus_areas: string[] },
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const areas = await this.supabaseService.updateUserHealthFocusAreas(
        userId,
        areasData.health_focus_areas,
      );
      return ResponseDto.success(
        areas,
        'User health focus areas updated successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to update user health focus areas',
        error.message,
      );
    }
  }

  @Get('custom-goals')
  async getUserCustomGoals(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const goals = await this.supabaseService.getUserCustomGoals(userId);
      return ResponseDto.success(
        goals,
        'User custom goals retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve user custom goals',
        error.message,
      );
    }
  }

  @Put('custom-goals')
  async updateUserCustomGoals(
    @Body() goalsData: { custom_goals: string },
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const goals = await this.supabaseService.updateUserCustomGoals(
        userId,
        goalsData.custom_goals,
      );
      return ResponseDto.success(
        goals,
        'User custom goals updated successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to update user custom goals',
        error.message,
      );
    }
  }

  @Get('timezone')
  async getUserTimezone(@User('id') userId: string): Promise<ResponseDto<any>> {
    try {
      const timezone = await this.supabaseService.getUserTimezone(userId);
      return ResponseDto.success(
        timezone,
        'User timezone retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve user timezone',
        error.message,
      );
    }
  }

  @Put('timezone')
  async updateUserTimezone(
    @Body() timezoneData: { timezone: string },
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const timezone = await this.supabaseService.updateUserTimezone(
        userId,
        timezoneData.timezone,
      );
      return ResponseDto.success(
        timezone,
        'User timezone updated successfully',
      );
    } catch (error) {
      return ResponseDto.error('Failed to update user timezone', error.message);
    }
  }

  @Get('quiet-hours')
  async getUserQuietHours(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const quietHours = await this.supabaseService.getUserQuietHours(userId);
      return ResponseDto.success(
        quietHours,
        'User quiet hours retrieved successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to retrieve user quiet hours',
        error.message,
      );
    }
  }

  @Put('quiet-hours')
  async updateUserQuietHours(
    @Body()
    quietHoursData: { quiet_hours_start: string; quiet_hours_end: string },
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const quietHours = await this.supabaseService.updateUserQuietHours(
        userId,
        quietHoursData.quiet_hours_start,
        quietHoursData.quiet_hours_end,
      );
      return ResponseDto.success(
        quietHours,
        'User quiet hours updated successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to update user quiet hours',
        error.message,
      );
    }
  }

  @Post('reset-to-defaults')
  async resetUserPreferencesToDefaults(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const preferences =
        await this.supabaseService.resetUserPreferencesToDefaults(userId);
      return ResponseDto.success(
        preferences,
        'User preferences reset to defaults successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to reset user preferences to defaults',
        error.message,
      );
    }
  }

  @Get('export')
  async exportUserPreferences(
    @User('id') userId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const preferences =
        await this.supabaseService.exportUserPreferences(userId);
      return ResponseDto.success(
        preferences,
        'User preferences exported successfully',
      );
    } catch (error) {
      return ResponseDto.error(
        'Failed to export user preferences',
        error.message,
      );
    }
  }
}
