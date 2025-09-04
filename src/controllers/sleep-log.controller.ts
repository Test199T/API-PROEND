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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SleepLogService } from '../services/sleep-log.service';
import {
  CreateSleepLogDto,
  UpdateSleepLogDto,
  SleepLogResponseDto,
  SleepLogListDto,
  SleepLogSearchDto,
  SleepLogStatsDto,
  SleepLogTrendsDto,
  SleepLogAnalysisDto,
  SleepLogRecommendationDto,
} from '../dto/sleep-log.dto';
import { ResponseDto } from '../dto/common.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Sleep Log - จัดการข้อมูลการนอน')
@Controller('sleep-log')
@UseInterceptors(ClassSerializerInterceptor)
export class SleepLogController {
  constructor(private readonly sleepLogService: SleepLogService) {}

  // =====================================================
  // PUBLIC ENDPOINTS FOR TESTING
  // =====================================================

  @Get('test/public')
  @ApiOperation({
    summary: 'ทดสอบ API (ไม่ต้องการ authentication)',
    description: 'Endpoint สำหรับทดสอบว่า API ทำงานได้หรือไม่',
  })
  @ApiResponse({
    status: 200,
    description: 'API ทำงานได้ปกติ',
  })
  async testPublicEndpoint(): Promise<ResponseDto<{ message: string; timestamp: string; status: string }>> {
    return ResponseDto.success({
      message: 'Sleep Log API ทำงานได้ปกติ!',
      timestamp: new Date().toISOString(),
      status: 'active'
    }, 'ทดสอบสำเร็จ');
  }

  @Get('test/health-check')
  @ApiOperation({
    summary: 'ตรวจสอบสถานะ API (ไม่ต้องการ authentication)',
    description: 'ตรวจสอบสถานะและข้อมูลพื้นฐานของ API',
  })
  @ApiResponse({
    status: 200,
    description: 'ตรวจสอบสถานะสำเร็จ',
  })
  async healthCheck(): Promise<ResponseDto<any>> {
    return ResponseDto.success({
      service: 'Sleep Log API',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        public: [
          'GET /sleep-log/test/public',
          'GET /sleep-log/test/health-check',
          'GET /sleep-log/test/sample-data',
          'POST /sleep-log/test/create-sample'
        ],
        protected: [
          'GET /sleep-log',
          'POST /sleep-log',
          'GET /sleep-log/:id',
          'PUT /sleep-log/:id',
          'DELETE /sleep-log/:id'
        ]
      },
      note: 'Protected endpoints ต้องการ JWT token ใน Authorization header'
    }, 'ตรวจสอบสถานะสำเร็จ');
  }

  @Get('test/sample-data')
  @ApiOperation({
    summary: 'ข้อมูลตัวอย่าง (ไม่ต้องการ authentication)',
    description: 'ดึงข้อมูลตัวอย่างการนอนสำหรับการทดสอบ',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลตัวอย่างสำเร็จ',
  })
  async getSampleData(): Promise<ResponseDto<any>> {
    const sampleData = {
      sleep_logs: [
        {
          id: 1,
          sleep_date: '2024-01-15',
          bedtime: '22:30',
          wake_time: '06:30',
          sleep_duration_hours: 8,
          sleep_quality: 'good',
          sleep_efficiency_percentage: 85,
          time_to_fall_asleep_minutes: 15,
          awakenings_count: 1,
          deep_sleep_minutes: 120,
          light_sleep_minutes: 300,
          rem_sleep_minutes: 90,
          awake_minutes: 30,
          sleep_score: 78,
          notes: 'นอนหลับได้ดี ตื่นขึ้นมาสดชื่น'
        },
        {
          id: 2,
          sleep_date: '2024-01-14',
          bedtime: '23:00',
          wake_time: '07:00',
          sleep_duration_hours: 8,
          sleep_quality: 'excellent',
          sleep_efficiency_percentage: 90,
          time_to_fall_asleep_minutes: 10,
          awakenings_count: 0,
          deep_sleep_minutes: 140,
          light_sleep_minutes: 280,
          rem_sleep_minutes: 100,
          awake_minutes: 20,
          sleep_score: 92,
          notes: 'นอนหลับลึกมาก รู้สึกสดชื่นมาก'
        },
        {
          id: 3,
          sleep_date: '2024-01-13',
          bedtime: '01:00',
          wake_time: '08:00',
          sleep_duration_hours: 7,
          sleep_quality: 'fair',
          sleep_efficiency_percentage: 75,
          time_to_fall_asleep_minutes: 30,
          awakenings_count: 3,
          deep_sleep_minutes: 90,
          light_sleep_minutes: 320,
          rem_sleep_minutes: 70,
          awake_minutes: 60,
          sleep_score: 65,
          notes: 'เข้านอนดึก ตื่นกลางคืนหลายครั้ง'
        }
      ],
      stats: {
        total_sleep_logs: 3,
        average_sleep_duration: 7.7,
        average_sleep_score: 78,
        average_sleep_quality: 'good'
      }
    };

    return ResponseDto.success(sampleData, 'ดึงข้อมูลตัวอย่างสำเร็จ');
  }

  @Post('test/create-sample')
  @ApiOperation({
    summary: 'สร้างข้อมูลตัวอย่าง (ไม่ต้องการ authentication)',
    description: 'สร้างข้อมูลตัวอย่างการนอนสำหรับการทดสอบ',
  })
  @ApiResponse({
    status: 201,
    description: 'สร้างข้อมูลตัวอย่างสำเร็จ',
  })
  async createSampleData(): Promise<ResponseDto<any>> {
    try {
      const sampleSleepLogs = [
        {
          id: 1,
          sleep_date: '2024-01-15',
          bedtime: '22:30',
          wake_time: '06:30',
          sleep_duration_hours: 8,
          sleep_quality: 'good',
          sleep_efficiency_percentage: 85,
          time_to_fall_asleep_minutes: 15,
          awakenings_count: 1,
          deep_sleep_minutes: 120,
          light_sleep_minutes: 300,
          rem_sleep_minutes: 90,
          awake_minutes: 30,
          sleep_score: 78,
          notes: 'นอนหลับได้ดี ตื่นขึ้นมาสดชื่น',
          user_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          sleep_date: '2024-01-14',
          bedtime: '23:00',
          wake_time: '07:00',
          sleep_duration_hours: 8,
          sleep_quality: 'excellent',
          sleep_efficiency_percentage: 90,
          time_to_fall_asleep_minutes: 10,
          awakenings_count: 0,
          deep_sleep_minutes: 140,
          light_sleep_minutes: 280,
          rem_sleep_minutes: 100,
          awake_minutes: 20,
          sleep_score: 92,
          notes: 'นอนหลับลึกมาก รู้สึกสดชื่นมาก',
          user_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return ResponseDto.success({
        message: 'สร้างข้อมูลตัวอย่างสำเร็จ',
        sleep_logs: sampleSleepLogs,
        note: 'ข้อมูลนี้เป็นข้อมูลตัวอย่างใน memory ไม่ได้บันทึกลงฐานข้อมูลจริง'
      }, 'สร้างข้อมูลตัวอย่างสำเร็จ');
    } catch (error) {
      return ResponseDto.error('เกิดข้อผิดพลาดในการสร้างข้อมูลตัวอย่าง');
    }
  }

  // =====================================================
  // PROTECTED ENDPOINTS (REQUIRE AUTHENTICATION)
  // =====================================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'สร้างบันทึกการนอนใหม่',
    description: 'สร้างบันทึกการนอนใหม่สำหรับผู้ใช้',
  })
  @ApiResponse({
    status: 201,
    description: 'สร้างบันทึกการนอนสำเร็จ',
    type: SleepLogResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'ข้อมูลไม่ถูกต้อง',
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่ได้รับอนุญาต',
  })
  async createSleepLog(
    @User('id') userId: number,
    @Body(ValidationPipe) createSleepLogDto: CreateSleepLogDto,
  ): Promise<ResponseDto<SleepLogResponseDto>> {
    try {
      const sleepLog = await this.sleepLogService.createSleepLog(
        createSleepLogDto,
        userId,
      );
      return ResponseDto.success(sleepLog, 'สร้างบันทึกการนอนสำเร็จ');
    } catch (error) {
      console.error('Create Sleep Log Error:', error);
      throw new BadRequestException(error.message || 'ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ดูรายการบันทึกการนอน',
    description: 'ดึงรายการบันทึกการนอนของผู้ใช้พร้อมการค้นหาและแบ่งหน้า',
  })
  @ApiQuery({
    name: 'sleep_quality',
    required: false,
    enum: ['excellent', 'good', 'fair', 'poor', 'very_poor'],
    description: 'กรองตามคุณภาพการนอน',
  })
  @ApiQuery({
    name: 'min_sleep_duration',
    required: false,
    type: Number,
    description: 'ระยะเวลาการนอนขั้นต่ำ (ชั่วโมง)',
  })
  @ApiQuery({
    name: 'max_sleep_duration',
    required: false,
    type: Number,
    description: 'ระยะเวลาการนอนสูงสุด (ชั่วโมง)',
  })
  @ApiQuery({
    name: 'sleep_date_from',
    required: false,
    description: 'วันที่เริ่มต้นจาก (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'sleep_date_to',
    required: false,
    description: 'วันที่สิ้นสุดถึง (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'ค้นหาในบันทึก',
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
    description: 'ดึงรายการบันทึกการนอนสำเร็จ',
    type: SleepLogListDto,
  })
  async getAllSleepLogs(
    @User('id') userId: number,
    @Query() searchDto: SleepLogSearchDto,
  ): Promise<ResponseDto<SleepLogListDto>> {
    try {
      const result = await this.sleepLogService.getSleepLogs(
        userId,
        searchDto,
      );
      return ResponseDto.success(result, 'ดึงรายการบันทึกการนอนสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ดูข้อมูลบันทึกการนอน',
    description: 'ดึงข้อมูลบันทึกการนอนตาม ID',
  })
  @ApiParam({ name: 'id', description: 'ID ของบันทึกการนอน', type: String })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลบันทึกการนอนสำเร็จ',
    type: SleepLogResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'ไม่พบบันทึกการนอนนี้',
  })
  async getSleepLogById(
    @Param('id') id: string,
    @User('id') userId: number,
  ): Promise<ResponseDto<SleepLogResponseDto>> {
    try {
      const sleepLog = await this.sleepLogService.getSleepLog(id, userId);
      return ResponseDto.success(sleepLog, 'ดึงข้อมูลบันทึกการนอนสำเร็จ');
    } catch (error) {
      if (error.message && error.message.includes('ไม่พบ')) {
        return ResponseDto.error(`ไม่พบบันทึกการนอนที่มี ID: ${id}`);
      }
      return ResponseDto.error(error.message);
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'อัพเดทบันทึกการนอน',
    description: 'อัพเดทข้อมูลบันทึกการนอน',
  })
  @ApiParam({ name: 'id', description: 'ID ของบันทึกการนอน', type: String })
  @ApiResponse({
    status: 200,
    description: 'อัพเดทบันทึกการนอนสำเร็จ',
    type: SleepLogResponseDto,
  })
  async updateSleepLog(
    @Param('id') id: string,
    @User('id') userId: number,
    @Body(ValidationPipe) updateSleepLogDto: UpdateSleepLogDto,
  ): Promise<ResponseDto<SleepLogResponseDto>> {
    try {
      const updatedSleepLog = await this.sleepLogService.updateSleepLog(
        id,
        userId,
        updateSleepLogDto,
      );
      return ResponseDto.success(updatedSleepLog, 'อัพเดทบันทึกการนอนสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ลบบันทึกการนอน',
    description: 'ลบบันทึกการนอนออกจากระบบ',
  })
  @ApiParam({ name: 'id', description: 'ID ของบันทึกการนอน', type: String })
  @ApiResponse({
    status: 200,
    description: 'ลบบันทึกการนอนสำเร็จ',
  })
  async deleteSleepLog(
    @Param('id') id: string,
    @User('id') userId: number,
  ): Promise<ResponseDto<{ message: string }>> {
    try {
      const result = await this.sleepLogService.deleteSleepLog(id, userId);
      return ResponseDto.success(result, 'ลบบันทึกการนอนสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  // =====================================================
  // STATISTICS & ANALYTICS
  // =====================================================

  @Get('stats/overview')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ดูสถิติภาพรวม',
    description: 'ดึงสถิติภาพรวมของการนอนของผู้ใช้',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'วันที่เฉพาะ (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงสถิติสำเร็จ',
    type: SleepLogStatsDto,
  })
  async getSleepStats(
    @User('id') userId: number,
    @Query('date') date?: string,
  ): Promise<ResponseDto<SleepLogStatsDto>> {
    try {
      const stats = await this.sleepLogService.getSleepLogStats(userId, date);
      return ResponseDto.success(stats, 'ดึงสถิติสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get('trends')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ดูแนวโน้มการนอน',
    description: 'ดึงแนวโน้มการนอนในช่วงเวลาที่กำหนด',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'จำนวนวันย้อนหลัง (เริ่มต้นที่ 7)',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงแนวโน้มสำเร็จ',
    type: SleepLogTrendsDto,
  })
  async getSleepTrends(
    @User('id') userId: number,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 7,
  ): Promise<ResponseDto<SleepLogTrendsDto>> {
    try {
      console.log(`Get Sleep Trends Controller: userId=${userId}, days=${days}`);
      const trends = await this.sleepLogService.getSleepLogTrends(userId, days);
      console.log('Trends result:', trends);
      
      // Ensure we return the correct format
      return ResponseDto.success(trends, 'ดึงแนวโน้มสำเร็จ');
    } catch (error) {
      console.error('Get Sleep Trends Controller Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return ResponseDto.error(error.message || 'ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get('trends/fixed')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getSleepTrendsFixed(
    @User('id') userId: number,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 7,
  ): Promise<ResponseDto<any>> {
    try {
      console.log(`FIXED TRENDS: userId=${userId}, days=${days}`);
      
      // Test direct supabase call
      const trends = await this.sleepLogService.getSleepLogTrends(userId, days);
      
      return ResponseDto.success(trends, 'ดึงแนวโน้มสำเร็จ');
    } catch (error) {
      console.error('FIXED TRENDS Error:', error);
      return ResponseDto.error(`Fixed trends error: ${error.message || 'Unknown error'}`);
    }
  }

  @Get('trends/simple')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getSleepTrendsSimple(
    @User('id') userId: number,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 7,
  ): Promise<ResponseDto<any>> {
    try {
      console.log(`SIMPLE TRENDS: userId=${userId}, days=${days}`);
      
      // Test direct supabase call
      const trends = await this.sleepLogService.getSleepLogTrends(userId, days);
      
      return ResponseDto.success({
        userId,
        days,
        trends,
        message: 'Simple trends successful'
      }, 'Simple trends successful');
    } catch (error) {
      console.error('SIMPLE TRENDS Error:', error);
      return ResponseDto.error(`Simple trends error: ${error.message || 'Unknown error'}`);
    }
  }

  @Get('trends/debug')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getSleepTrendsDebug(
    @User('id') userId: number,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 7,
  ): Promise<ResponseDto<any>> {
    try {
      console.log(`DEBUG: Get Sleep Trends - userId=${userId}, days=${days}`);
      
      // Test direct supabase call
      const trends = await this.sleepLogService.getSleepLogTrends(userId, days);
      
      return ResponseDto.success({
        userId,
        days,
        trends,
        message: 'Debug successful'
      }, 'Debug trends successful');
    } catch (error) {
      console.error('DEBUG: Get Sleep Trends Error:', error);
      return ResponseDto.error(`Debug error: ${error.message || 'Unknown error'}`);
    }
  }

  @Get('test/simple')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getSimpleTest(
    @User('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      console.log(`SIMPLE TEST: userId=${userId}`);
      
      return ResponseDto.success({
        userId,
        message: 'Simple test successful',
        timestamp: new Date().toISOString()
      }, 'Simple test successful');
    } catch (error) {
      console.error('SIMPLE TEST Error:', error);
      return ResponseDto.error(`Simple test error: ${error.message || 'Unknown error'}`);
    }
  }

  @Get('analysis')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'วิเคราะห์การนอน',
    description: 'วิเคราะห์การนอนและให้คำแนะนำ',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'จำนวนวันสำหรับการวิเคราะห์ (เริ่มต้นที่ 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'วิเคราะห์สำเร็จ',
    type: SleepLogAnalysisDto,
  })
  async getSleepAnalysis(
    @User('id') userId: number,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 30,
  ): Promise<ResponseDto<SleepLogAnalysisDto>> {
    try {
      console.log(`Get Sleep Analysis Controller: userId=${userId}, days=${days}`);
      const analysis = await this.sleepLogService.getSleepLogAnalysis(userId, days);
      console.log('Analysis result:', analysis);
      return ResponseDto.success(analysis, 'วิเคราะห์สำเร็จ');
    } catch (error) {
      console.error('Get Sleep Analysis Controller Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return ResponseDto.error(error.message || 'ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get('analysis/simple')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getSleepAnalysisSimple(
    @User('id') userId: number,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 30,
  ): Promise<ResponseDto<any>> {
    try {
      console.log(`SIMPLE ANALYSIS: userId=${userId}, days=${days}`);
      
      const analysis = await this.sleepLogService.getSleepLogAnalysis(userId, days);
      
      return ResponseDto.success(analysis, 'วิเคราะห์สำเร็จ');
    } catch (error) {
      console.error('SIMPLE ANALYSIS Error:', error);
      return ResponseDto.error(`Simple analysis error: ${error.message || 'Unknown error'}`);
    }
  }

  @Get('recommendations')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ดูคำแนะนำการนอน',
    description: 'ดึงคำแนะนำการนอนที่เหมาะสมกับผู้ใช้',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงคำแนะนำสำเร็จ',
    type: [SleepLogRecommendationDto],
  })
  async getSleepRecommendations(
    @User('id') userId: number,
  ): Promise<ResponseDto<SleepLogRecommendationDto[]>> {
    try {
      console.log(`Get Sleep Recommendations Controller: userId=${userId}`);
      const recommendations = await this.sleepLogService.getSleepRecommendations(userId);
      console.log('Recommendations result:', recommendations);
      return ResponseDto.success(recommendations, 'ดึงคำแนะนำสำเร็จ');
    } catch (error) {
      console.error('Get Sleep Recommendations Controller Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return ResponseDto.error(error.message || 'ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get('recommendations/simple')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getSleepRecommendationsSimple(
    @User('id') userId: number,
  ): Promise<ResponseDto<any>> {
    try {
      console.log(`SIMPLE RECOMMENDATIONS: userId=${userId}`);
      
      const recommendations = await this.sleepLogService.getSleepRecommendations(userId);
      
      return ResponseDto.success(recommendations, 'ดึงคำแนะนำสำเร็จ');
    } catch (error) {
      console.error('SIMPLE RECOMMENDATIONS Error:', error);
      return ResponseDto.error(`Simple recommendations error: ${error.message || 'Unknown error'}`);
    }
  }

  // =====================================================
  // SEARCH & FILTERS
  // =====================================================

  @Get('search/quality/:quality')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ค้นหาตามคุณภาพการนอน',
    description: 'ดึงบันทึกการนอนตามคุณภาพ',
  })
  @ApiParam({
    name: 'quality',
    enum: ['excellent', 'good', 'fair', 'poor', 'very_poor'],
    description: 'คุณภาพการนอน',
  })
  @ApiResponse({
    status: 200,
    description: 'ค้นหาสำเร็จ',
    type: [SleepLogResponseDto],
  })
  async getSleepLogsByQuality(
    @Param('quality') quality: string,
    @User('id') userId: number,
  ): Promise<ResponseDto<SleepLogResponseDto[]>> {
    try {
      const result = await this.sleepLogService.getSleepLogs(userId, {
        sleep_quality: quality as any,
      });
      return ResponseDto.success(result.sleep_logs, 'ค้นหาสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get('search/duration/:min/:max')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ค้นหาตามระยะเวลาการนอน',
    description: 'ดึงบันทึกการนอนตามระยะเวลา',
  })
  @ApiParam({
    name: 'min',
    type: Number,
    description: 'ระยะเวลาขั้นต่ำ (ชั่วโมง)',
  })
  @ApiParam({
    name: 'max',
    type: Number,
    description: 'ระยะเวลาสูงสุด (ชั่วโมง)',
  })
  @ApiResponse({
    status: 200,
    description: 'ค้นหาสำเร็จ',
    type: [SleepLogResponseDto],
  })
  async getSleepLogsByDuration(
    @Param('min', ParseIntPipe) min: number,
    @Param('max', ParseIntPipe) max: number,
    @User('id') userId: number,
  ): Promise<ResponseDto<SleepLogResponseDto[]>> {
    try {
      const result = await this.sleepLogService.getSleepLogs(userId, {
        min_sleep_duration: min,
        max_sleep_duration: max,
      });
      return ResponseDto.success(result.sleep_logs, 'ค้นหาสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }

  @Get('search/date-range')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ค้นหาตามช่วงวันที่',
    description: 'ดึงบันทึกการนอนตามช่วงวันที่',
  })
  @ApiQuery({
    name: 'from',
    required: true,
    description: 'วันที่เริ่มต้น (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'to',
    required: true,
    description: 'วันที่สิ้นสุด (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'ค้นหาสำเร็จ',
    type: [SleepLogResponseDto],
  })
  async getSleepLogsByDateRange(
    @Query('from') from: string,
    @Query('to') to: string,
    @User('id') userId: number,
  ): Promise<ResponseDto<SleepLogResponseDto[]>> {
    try {
      const result = await this.sleepLogService.getSleepLogs(userId, {
        sleep_date_from: from,
        sleep_date_to: to,
      });
      return ResponseDto.success(result.sleep_logs, 'ค้นหาสำเร็จ');
    } catch (error) {
      return ResponseDto.error(error.message);
    }
  }
}