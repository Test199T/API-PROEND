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
  Request,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { UserService } from '../services/user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  UserResponseDto,
  UserProfileDto,
  UserSearchDto,
  UserStatsDto,
  UserDashboardDto,
} from '../dto/user.dto';
import { ResponseDto } from '../dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // =====================================================
  // PUBLIC ENDPOINTS (ไม่ต้อง login)
  // =====================================================

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<ResponseDto<UserResponseDto>> {
    try {
      const user = await this.userService.createUser(createUserDto);
      return ResponseDto.success(user, 'สมัครสมาชิกสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  // =====================================================
  // PROTECTED ENDPOINTS (ต้อง login)
  // =====================================================

  @Get('profile')
  @UseGuards(AuthGuard)
  async getMyProfile(
    @User('id') userId: number,
  ): Promise<ResponseDto<UserProfileDto>> {
    try {
      const profile = await this.userService.getUserProfile(userId);
      return ResponseDto.success(profile, 'ดึงโปรไฟล์สำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get('dashboard')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ดูแดชบอร์ด',
    description: 'ดึงข้อมูลแดชบอร์ดของผู้ใช้',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงแดชบอร์ดสำเร็จ',
    type: UserDashboardDto,
  })
  async getMyDashboard(
    @User('id') userId: number,
  ): Promise<ResponseDto<UserDashboardDto>> {
    try {
      const dashboard = await this.userService.getUserDashboard(userId);
      return ResponseDto.success(dashboard, 'ดึงแดชบอร์ดสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'อัพเดทโปรไฟล์',
    description: 'อัพเดทข้อมูลโปรไฟล์ของผู้ใช้',
  })
  @ApiResponse({
    status: 200,
    description: 'อัพเดทโปรไฟล์สำเร็จ',
    type: UserResponseDto,
  })
  async updateMyProfile(
    @User('id') userId: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<UserResponseDto>> {
    try {
      const updatedUser = await this.userService.updateUser(
        userId,
        updateUserDto,
      );
      return ResponseDto.success(updatedUser, 'อัพเดทโปรไฟล์สำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Put('password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'เปลี่ยนรหัสผ่าน',
    description: 'เปลี่ยนรหัสผ่านของผู้ใช้',
  })
  @ApiResponse({
    status: 200,
    description: 'เปลี่ยนรหัสผ่านสำเร็จ',
  })
  @ApiResponse({
    status: 400,
    description: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
  })
  async updateMyPassword(
    @User('id') userId: number,
    @Body(ValidationPipe) updatePasswordDto: UpdatePasswordDto,
  ): Promise<ResponseDto<{ message: string }>> {
    try {
      const result = await this.userService.updatePassword(
        userId,
        updatePasswordDto,
      );
      return ResponseDto.success(result, 'เปลี่ยนรหัสผ่านสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  // =====================================================
  // ADMIN ENDPOINTS (สำหรับ admin เท่านั้น)
  // =====================================================

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ดูรายการผู้ใช้ทั้งหมด',
    description: 'ดึงรายการผู้ใช้ทั้งหมดพร้อมการค้นหาและแบ่งหน้า',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'ค้นหาตามชื่อ, นามสกุล, username, หรือ email',
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    enum: ['male', 'female', 'other'],
    description: 'กรองตามเพศ',
  })
  @ApiQuery({
    name: 'activity_level',
    required: false,
    enum: [
      'sedentary',
      'lightly_active',
      'moderately_active',
      'very_active',
      'extremely_active',
    ],
    description: 'กรองตามระดับกิจกรรม',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    type: Boolean,
    description: 'กรองตามสถานะการใช้งาน',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'หน้าปัจจุบัน (เริ่มต้นที่ 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'จำนวนรายการต่อหน้า (เริ่มต้นที่ 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงรายการผู้ใช้สำเร็จ',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: { $ref: '#/components/schemas/UserResponseDto' },
            },
            total: { type: 'number' },
          },
        },
      },
    },
  })
  async getAllUsers(
    @Query() searchDto: UserSearchDto,
  ): Promise<ResponseDto<{ users: UserResponseDto[]; total: number }>> {
    try {
      const result = await this.userService.findAllUsers(searchDto);
      return ResponseDto.success(result, 'ดึงรายการผู้ใช้สำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ดูสถิติผู้ใช้',
    description: 'ดึงสถิติรวมของผู้ใช้ทั้งหมดในระบบ',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงสถิติสำเร็จ',
    type: UserStatsDto,
  })
  async getUserStats(): Promise<ResponseDto<UserStatsDto>> {
    try {
      const stats = await this.userService.getUserStats();
      return ResponseDto.success(stats, 'ดึงสถิติสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ดูข้อมูลผู้ใช้',
    description: 'ดึงข้อมูลผู้ใช้ตาม ID',
  })
  @ApiParam({ name: 'id', description: 'ID ของผู้ใช้', type: Number })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลผู้ใช้สำเร็จ',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'ไม่พบผู้ใช้นี้',
  })
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<UserResponseDto>> {
    try {
      const user = await this.userService.findUserById(id);
      return ResponseDto.success(user, 'ดึงข้อมูลผู้ใช้สำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'อัพเดทข้อมูลผู้ใช้',
    description: 'อัพเดทข้อมูลผู้ใช้ตาม ID',
  })
  @ApiParam({ name: 'id', description: 'ID ของผู้ใช้', type: Number })
  @ApiResponse({
    status: 200,
    description: 'อัพเดทข้อมูลสำเร็จ',
    type: UserResponseDto,
  })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<UserResponseDto>> {
    try {
      const updatedUser = await this.userService.updateUser(id, updateUserDto);
      return ResponseDto.success(updatedUser, 'อัพเดทข้อมูลสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ลบผู้ใช้', description: 'ลบผู้ใช้ออกจากระบบ' })
  @ApiParam({ name: 'id', description: 'ID ของผู้ใช้', type: Number })
  @ApiResponse({
    status: 200,
    description: 'ลบผู้ใช้สำเร็จ',
  })
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<{ message: string }>> {
    try {
      const result = await this.userService.deleteUser(id);
      return ResponseDto.success(result, 'ลบผู้ใช้สำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Put(':id/deactivate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ปิดการใช้งานผู้ใช้',
    description: 'ปิดการใช้งานผู้ใช้ชั่วคราว',
  })
  @ApiParam({ name: 'id', description: 'ID ของผู้ใช้', type: Number })
  @ApiResponse({
    status: 200,
    description: 'ปิดการใช้งานสำเร็จ',
  })
  async deactivateUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<{ message: string }>> {
    try {
      const result = await this.userService.deactivateUser(id);
      return ResponseDto.success(result, 'ปิดการใช้งานสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Put(':id/activate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'เปิดการใช้งานผู้ใช้',
    description: 'เปิดการใช้งานผู้ใช้ที่ถูกปิดไว้',
  })
  @ApiParam({ name: 'id', description: 'ID ของผู้ใช้', type: Number })
  @ApiResponse({
    status: 200,
    description: 'เปิดการใช้งานสำเร็จ',
  })
  async activateUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<{ message: string }>> {
    try {
      const result = await this.userService.activateUser(id);
      return ResponseDto.success(result, 'เปิดการใช้งานสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  // =====================================================
  // UTILITY ENDPOINTS
  // =====================================================

  @Get('check-username/:username')
  @ApiOperation({
    summary: 'ตรวจสอบชื่อผู้ใช้',
    description: 'ตรวจสอบว่าชื่อผู้ใช้นี้มีอยู่ในระบบหรือไม่',
  })
  @ApiParam({
    name: 'username',
    description: 'ชื่อผู้ใช้ที่ต้องการตรวจสอบ',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'ตรวจสอบสำเร็จ',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            available: { type: 'boolean' },
            username: { type: 'string' },
          },
        },
      },
    },
  })
  async checkUsername(
    @Param('username') username: string,
  ): Promise<ResponseDto<{ available: boolean; username: string }>> {
    try {
      // ตรวจสอบว่าชื่อผู้ใช้มีอยู่หรือไม่
      const exists = await this.userService
        .findUserByUsername(username)
        .catch(() => null);
      const available = !exists;

      return ResponseDto.success(
        { available, username },
        available
          ? 'ชื่อผู้ใช้นี้สามารถใช้ได้'
          : 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว',
      );
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get('check-email/:email')
  @ApiOperation({
    summary: 'ตรวจสอบอีเมล',
    description: 'ตรวจสอบว่าอีเมลนี้มีอยู่ในระบบหรือไม่',
  })
  @ApiParam({
    name: 'email',
    description: 'อีเมลที่ต้องการตรวจสอบ',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'ตรวจสอบสำเร็จ',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            available: { type: 'boolean' },
            email: { type: 'string' },
          },
        },
      },
    },
  })
  async checkEmail(
    @Param('email') email: string,
  ): Promise<ResponseDto<{ available: boolean; email: string }>> {
    try {
      // ตรวจสอบว่าอีเมลมีอยู่หรือไม่
      const exists = await this.userService
        .findUserByEmail(email)
        .catch(() => null);
      const available = !exists;

      return ResponseDto.success(
        { available, email },
        available ? 'อีเมลนี้สามารถใช้ได้' : 'อีเมลนี้มีอยู่ในระบบแล้ว',
      );
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }
}
