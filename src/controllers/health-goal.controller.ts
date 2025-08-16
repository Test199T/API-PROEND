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
  ParseIntPipe,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HealthGoalService } from '../services/health-goal.service';
import {
  CreateHealthGoalDto,
  UpdateHealthGoalDto,
  HealthGoalResponseDto,
  HealthGoalListDto,
  HealthGoalSearchDto,
  HealthGoalProgressDto,
  HealthGoalStatsDto,
  HealthGoalBulkUpdateDto,
  HealthGoalTemplateDto,
  HealthGoalRecommendationDto,
} from '../dto/health-goal.dto';
import { ResponseDto } from '../dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Health Goals - จัดการเป้าหมายสุขภาพ')
@Controller('health-goals')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class HealthGoalController {
  constructor(private readonly healthGoalService: HealthGoalService) {}

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'สร้างเป้าหมายใหม่',
    description: 'สร้างเป้าหมายสุขภาพใหม่สำหรับผู้ใช้',
  })
  @ApiResponse({
    status: 201,
    description: 'สร้างเป้าหมายสำเร็จ',
    type: HealthGoalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'ข้อมูลไม่ถูกต้อง',
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่ได้รับอนุญาต',
  })
  async createHealthGoal(
    @User('id') userId: number,
    @Body(ValidationPipe) createHealthGoalDto: CreateHealthGoalDto,
  ): Promise<ResponseDto<HealthGoalResponseDto>> {
    try {
      const goal = await this.healthGoalService.createHealthGoal(
        userId,
        createHealthGoalDto,
      );
      return ResponseDto.success(goal, 'สร้างเป้าหมายสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'ดูรายการเป้าหมาย',
    description: 'ดึงรายการเป้าหมายสุขภาพของผู้ใช้พร้อมการค้นหาและแบ่งหน้า',
  })
  @ApiQuery({
    name: 'goal_type',
    required: false,
    enum: [
      'weight_loss',
      'weight_gain',
      'muscle_gain',
      'endurance',
      'flexibility',
      'stress_reduction',
      'sleep_improvement',
      'nutrition',
      'other',
    ],
    description: 'กรองตามประเภทเป้าหมาย',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    description: 'กรองตามสถานะ',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['low', 'medium', 'high', 'urgent'],
    description: 'กรองตามความสำคัญ',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'ค้นหาตามชื่อหรือคำอธิบาย',
  })
  @ApiQuery({
    name: 'start_date_from',
    required: false,
    description: 'วันที่เริ่มต้นจาก (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'start_date_to',
    required: false,
    description: 'วันที่เริ่มต้นถึง (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'target_date_from',
    required: false,
    description: 'วันที่เป้าหมายจาก (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'target_date_to',
    required: false,
    description: 'วันที่เป้าหมายถึง (YYYY-MM-DD)',
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
    description: 'ดึงรายการเป้าหมายสำเร็จ',
    type: HealthGoalListDto,
  })
  async getAllHealthGoals(
    @User('id') userId: number,
    @Query() searchDto: HealthGoalSearchDto,
  ): Promise<ResponseDto<HealthGoalListDto>> {
    try {
      const result = await this.healthGoalService.findAllHealthGoals(
        userId,
        searchDto,
      );
      return ResponseDto.success(result, 'ดึงรายการเป้าหมายสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ดูข้อมูลเป้าหมาย',
    description: 'ดึงข้อมูลเป้าหมายสุขภาพตาม ID',
  })
  @ApiParam({ name: 'id', description: 'ID ของเป้าหมาย', type: Number })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลเป้าหมายสำเร็จ',
    type: HealthGoalResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'ไม่พบเป้าหมายนี้',
  })
  async getHealthGoalById(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalResponseDto>> {
    try {
      const goal = await this.healthGoalService.findHealthGoalById(id, userId);
      return ResponseDto.success(goal, 'ดึงข้อมูลเป้าหมายสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'อัพเดทเป้าหมาย',
    description: 'อัพเดทข้อมูลเป้าหมายสุขภาพ',
  })
  @ApiParam({ name: 'id', description: 'ID ของเป้าหมาย', type: Number })
  @ApiResponse({
    status: 200,
    description: 'อัพเดทเป้าหมายสำเร็จ',
    type: HealthGoalResponseDto,
  })
  async updateHealthGoal(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
    @Body(ValidationPipe) updateHealthGoalDto: UpdateHealthGoalDto,
  ): Promise<ResponseDto<HealthGoalResponseDto>> {
    try {
      const updatedGoal = await this.healthGoalService.updateHealthGoal(
        id,
        userId,
        updateHealthGoalDto,
      );
      return ResponseDto.success(updatedGoal, 'อัพเดทเป้าหมายสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'ลบเป้าหมาย',
    description: 'ลบเป้าหมายสุขภาพออกจากระบบ',
  })
  @ApiParam({ name: 'id', description: 'ID ของเป้าหมาย', type: Number })
  @ApiResponse({
    status: 200,
    description: 'ลบเป้าหมายสำเร็จ',
  })
  async deleteHealthGoal(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ): Promise<ResponseDto<{ message: string }>> {
    try {
      const result = await this.healthGoalService.deleteHealthGoal(id, userId);
      return ResponseDto.success(result, 'ลบเป้าหมายสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  // =====================================================
  // GOAL PROGRESS & UPDATES
  // =====================================================

  @Put(':id/progress')
  @ApiOperation({
    summary: 'อัพเดทความคืบหน้า',
    description: 'อัพเดทความคืบหน้าของเป้าหมาย',
  })
  @ApiParam({ name: 'id', description: 'ID ของเป้าหมาย', type: Number })
  @ApiResponse({
    status: 200,
    description: 'อัพเดทความคืบหน้าสำเร็จ',
    type: HealthGoalResponseDto,
  })
  async updateGoalProgress(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
    @Body('current_value', ParseIntPipe) currentValue: number,
  ): Promise<ResponseDto<HealthGoalResponseDto>> {
    try {
      const updatedGoal = await this.healthGoalService.updateGoalProgress(
        id,
        userId,
        currentValue,
      );
      return ResponseDto.success(updatedGoal, 'อัพเดทความคืบหน้าสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get(':id/progress')
  @ApiOperation({
    summary: 'ดูความคืบหน้า',
    description: 'ดึงข้อมูลความคืบหน้าของเป้าหมาย',
  })
  @ApiParam({ name: 'id', description: 'ID ของเป้าหมาย', type: Number })
  @ApiResponse({
    status: 200,
    description: 'ดึงความคืบหน้าสำเร็จ',
    type: HealthGoalProgressDto,
  })
  async getGoalProgress(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalProgressDto>> {
    try {
      const progress = await this.healthGoalService.getGoalProgress(id, userId);
      return ResponseDto.success(progress, 'ดึงความคืบหน้าสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  // =====================================================
  // BULK OPERATIONS
  // =====================================================

  @Put('bulk-update')
  @ApiOperation({
    summary: 'อัพเดทเป้าหมายหลายรายการ',
    description: 'อัพเดทเป้าหมายหลายรายการพร้อมกัน',
  })
  @ApiResponse({
    status: 200,
    description: 'อัพเดทเป้าหมายสำเร็จ',
  })
  async bulkUpdateGoals(
    @User('id') userId: number,
    @Body(ValidationPipe) bulkUpdateDto: HealthGoalBulkUpdateDto,
  ): Promise<ResponseDto<{ message: string; updated_count: number }>> {
    try {
      const result = await this.healthGoalService.bulkUpdateGoals(
        userId,
        bulkUpdateDto,
      );
      return ResponseDto.success(result, 'อัพเดทเป้าหมายสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  // =====================================================
  // TEMPLATES & RECOMMENDATIONS
  // =====================================================

  @Get('templates')
  @ApiOperation({
    summary: 'ดูเทมเพลตเป้าหมาย',
    description: 'ดึงเทมเพลตเป้าหมายสุขภาพที่แนะนำ',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงเทมเพลตสำเร็จ',
    type: [HealthGoalTemplateDto],
  })
  async getGoalTemplates(): Promise<ResponseDto<HealthGoalTemplateDto[]>> {
    try {
      const templates = await this.healthGoalService.getGoalTemplates();
      return ResponseDto.success(templates, 'ดึงเทมเพลตสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get('recommendations')
  @ApiOperation({
    summary: 'ดูคำแนะนำเป้าหมาย',
    description: 'ดึงคำแนะนำเป้าหมายสุขภาพที่เหมาะสมกับผู้ใช้',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงคำแนะนำสำเร็จ',
    type: [HealthGoalRecommendationDto],
  })
  async getGoalRecommendations(
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalRecommendationDto[]>> {
    try {
      const recommendations =
        await this.healthGoalService.getGoalRecommendations(userId);
      return ResponseDto.success(recommendations, 'ดึงคำแนะนำสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  // =====================================================
  // STATISTICS & ANALYTICS
  // =====================================================

  @Get('stats/overview')
  @ApiOperation({
    summary: 'ดูสถิติภาพรวม',
    description: 'ดึงสถิติภาพรวมของเป้าหมายสุขภาพของผู้ใช้',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงสถิติสำเร็จ',
    type: HealthGoalStatsDto,
  })
  async getGoalStats(
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalStatsDto>> {
    try {
      const stats = await this.healthGoalService.getGoalStats(userId);
      return ResponseDto.success(stats, 'ดึงสถิติสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  // =====================================================
  // QUICK ACTIONS
  // =====================================================

  @Put(':id/complete')
  @ApiOperation({
    summary: 'ทำเป้าหมายให้เสร็จ',
    description: 'ทำเป้าหมายให้เสร็จสิ้น',
  })
  @ApiParam({ name: 'id', description: 'ID ของเป้าหมาย', type: Number })
  @ApiResponse({
    status: 200,
    description: 'ทำเป้าหมายให้เสร็จสำเร็จ',
    type: HealthGoalResponseDto,
  })
  async completeGoal(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalResponseDto>> {
    try {
      const updatedGoal = await this.healthGoalService.updateHealthGoal(
        id,
        userId,
        { status: 'completed' },
      );
      return ResponseDto.success(updatedGoal, 'ทำเป้าหมายให้เสร็จสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Put(':id/pause')
  @ApiOperation({
    summary: 'หยุดเป้าหมายชั่วคราว',
    description: 'หยุดเป้าหมายชั่วคราว',
  })
  @ApiParam({ name: 'id', description: 'ID ของเป้าหมาย', type: Number })
  @ApiResponse({
    status: 200,
    description: 'หยุดเป้าหมายสำเร็จ',
    type: HealthGoalResponseDto,
  })
  async pauseGoal(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalResponseDto>> {
    try {
      const updatedGoal = await this.healthGoalService.updateHealthGoal(
        id,
        userId,
        { status: 'paused' },
      );
      return ResponseDto.success(updatedGoal, 'หยุดเป้าหมายสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Put(':id/resume')
  @ApiOperation({
    summary: 'กลับมาเริ่มเป้าหมาย',
    description: 'กลับมาเริ่มเป้าหมายที่หยุดไว้',
  })
  @ApiParam({ name: 'id', description: 'ID ของเป้าหมาย', type: Number })
  @ApiResponse({
    status: 200,
    description: 'กลับมาเริ่มเป้าหมายสำเร็จ',
    type: HealthGoalResponseDto,
  })
  async resumeGoal(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalResponseDto>> {
    try {
      const updatedGoal = await this.healthGoalService.updateHealthGoal(
        id,
        userId,
        { status: 'active' },
      );
      return ResponseDto.success(updatedGoal, 'กลับมาเริ่มเป้าหมายสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Put(':id/cancel')
  @ApiOperation({
    summary: 'ยกเลิกเป้าหมาย',
    description: 'ยกเลิกเป้าหมายที่ไม่ได้ทำต่อ',
  })
  @ApiParam({ name: 'id', description: 'ID ของเป้าหมาย', type: Number })
  @ApiResponse({
    status: 200,
    description: 'ยกเลิกเป้าหมายสำเร็จ',
    type: HealthGoalResponseDto,
  })
  async cancelGoal(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalResponseDto>> {
    try {
      const updatedGoal = await this.healthGoalService.updateHealthGoal(
        id,
        userId,
        { status: 'cancelled' },
      );
      return ResponseDto.success(updatedGoal, 'ยกเลิกเป้าหมายสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  // =====================================================
  // SEARCH & FILTERS
  // =====================================================

  @Get('search/active')
  @ApiOperation({
    summary: 'ค้นหาเป้าหมายที่กำลังดำเนินการ',
    description: 'ดึงเป้าหมายที่กำลังดำเนินการอยู่',
  })
  @ApiResponse({
    status: 200,
    description: 'ค้นหาสำเร็จ',
    type: [HealthGoalResponseDto],
  })
  async getActiveGoals(
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalResponseDto[]>> {
    try {
      const result = await this.healthGoalService.findAllHealthGoals(userId, {
        status: 'active',
      });
      return ResponseDto.success(result.goals, 'ค้นหาสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get('search/completed')
  @ApiOperation({
    summary: 'ค้นหาเป้าหมายที่เสร็จสิ้น',
    description: 'ดึงเป้าหมายที่เสร็จสิ้นแล้ว',
  })
  @ApiResponse({
    status: 200,
    description: 'ค้นหาสำเร็จ',
    type: [HealthGoalResponseDto],
  })
  async getCompletedGoals(
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalResponseDto[]>> {
    try {
      const result = await this.healthGoalService.findAllHealthGoals(userId, {
        status: 'completed',
      });
      return ResponseDto.success(result.goals, 'ค้นหาสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get('search/overdue')
  @ApiOperation({
    summary: 'ค้นหาเป้าหมายที่เกินกำหนด',
    description: 'ดึงเป้าหมายที่เกินกำหนดแล้ว',
  })
  @ApiResponse({
    status: 200,
    description: 'ค้นหาสำเร็จ',
    type: [HealthGoalResponseDto],
  })
  async getOverdueGoals(
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalResponseDto[]>> {
    try {
      const result = await this.healthGoalService.findAllHealthGoals(
        userId,
        {},
      );
      const overdueGoals = result.goals.filter((goal) => goal.is_overdue);
      return ResponseDto.success(overdueGoals, 'ค้นหาสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get('search/priority/:priority')
  @ApiOperation({
    summary: 'ค้นหาตามความสำคัญ',
    description: 'ดึงเป้าหมายตามระดับความสำคัญ',
  })
  @ApiParam({
    name: 'priority',
    enum: ['low', 'medium', 'high', 'urgent'],
    description: 'ระดับความสำคัญ',
  })
  @ApiResponse({
    status: 200,
    description: 'ค้นหาสำเร็จ',
    type: [HealthGoalResponseDto],
  })
  async getGoalsByPriority(
    @Param('priority') priority: string,
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalResponseDto[]>> {
    try {
      const result = await this.healthGoalService.findAllHealthGoals(userId, {
        priority: priority as any,
      });
      return ResponseDto.success(result.goals, 'ค้นหาสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get('search/type/:type')
  @ApiOperation({
    summary: 'ค้นหาตามประเภท',
    description: 'ดึงเป้าหมายตามประเภท',
  })
  @ApiParam({
    name: 'type',
    enum: [
      'weight_loss',
      'weight_gain',
      'muscle_gain',
      'endurance',
      'flexibility',
      'stress_reduction',
      'sleep_improvement',
      'nutrition',
      'other',
    ],
    description: 'ประเภทเป้าหมาย',
  })
  @ApiResponse({
    status: 200,
    description: 'ค้นหาสำเร็จ',
    type: [HealthGoalResponseDto],
  })
  async getGoalsByType(
    @Param('type') type: string,
    @User('id') userId: number,
  ): Promise<ResponseDto<HealthGoalResponseDto[]>> {
    try {
      const result = await this.healthGoalService.findAllHealthGoals(userId, {
        goal_type: type as any,
      });
      return ResponseDto.success(result.goals, 'ค้นหาสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }
}
