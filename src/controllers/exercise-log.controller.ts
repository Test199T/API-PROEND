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
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ExerciseLogService } from '../services/exercise-log.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ResponseDto } from '../dto/common.dto';
import {
  CreateExerciseLogDto,
  UpdateExerciseLogDto,
  ExerciseLogResponseDto,
  ExerciseLogQueryDto,
} from '../dto/exercise-log.dto';

@Controller('exercise-log')
@UseGuards(AuthGuard)
export class ExerciseLogController {
  constructor(
    private readonly exerciseLogService: ExerciseLogService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createExerciseLog(
    @Body() createExerciseLogDto: CreateExerciseLogDto,
    @Request() req: any,
  ): Promise<ResponseDto<ExerciseLogResponseDto>> {
    try {
      const exerciseLog = await this.exerciseLogService.createExerciseLog(
        createExerciseLogDto,
        req.user.id,
      );

      return ResponseDto.success(
        exerciseLog,
        'สร้าง exercise log สำเร็จ',
      );
    } catch (error) {
      if (error.status === 400) {
        return ResponseDto.error(error.message);
      }
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get()
  async getExerciseLogs(
    @Query() query: ExerciseLogQueryDto,
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<ResponseDto<ExerciseLogResponseDto[]>> {
    try {
      const exerciseLogs = await this.exerciseLogService.getExerciseLogs(
        req.user.id,
        { ...query, page, limit },
      );

      return ResponseDto.success(
        exerciseLogs,
        'ดึงข้อมูล exercise logs สำเร็จ',
      );
    } catch (error) {
      if (error.status === 400) {
        return ResponseDto.error(error.message);
      }
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get('stats')
  async getExerciseLogStats(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<ResponseDto<any>> {
    try {
      const stats = await this.exerciseLogService.getExerciseLogStats(
        req.user.id,
        date,
      );

      return ResponseDto.success(
        stats,
        'ดึงสถิติ exercise log สำเร็จ',
      );
    } catch (error) {
      if (error.status === 400) {
        return ResponseDto.error(error.message);
      }
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get('trends')
  async getExerciseLogTrends(
    @Request() req: any,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ): Promise<ResponseDto<any>> {
    try {
      const trends = await this.exerciseLogService.getExerciseLogTrends(
        req.user.id,
        days,
      );

      return ResponseDto.success(
        trends,
        'ดึงแนวโน้ม exercise log สำเร็จ',
      );
    } catch (error) {
      if (error.status === 400) {
        return ResponseDto.error(error.message);
      }
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get('workout-analysis')
  async getWorkoutAnalysis(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<ResponseDto<any>> {
    try {
      // TODO: Implement AI workout analysis
      const analysis = {
        message: 'AI workout analysis feature coming soon',
        date: date || new Date().toISOString().split('T')[0],
      };

      return ResponseDto.success(
        analysis,
        'ดึงการวิเคราะห์ workout สำเร็จ',
      );
    } catch (error) {
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get('recommendations')
  async getExerciseRecommendations(
    @Request() req: any,
  ): Promise<ResponseDto<any>> {
    try {
      // TODO: Implement AI exercise recommendations
      const recommendations = {
        message: 'AI exercise recommendations feature coming soon',
        suggestions: [
          'ออกกำลังกายแบบ cardio 30 นาที',
          'ฝึกความแข็งแรง 20 นาที',
          'ยืดกล้ามเนื้อ 10 นาที',
        ],
      };

      return ResponseDto.success(
        recommendations,
        'ดึงคำแนะนำการออกกำลังกายสำเร็จ',
      );
    } catch (error) {
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get(':id')
  async getExerciseLog(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ResponseDto<ExerciseLogResponseDto>> {
    try {
      const exerciseLog = await this.exerciseLogService.getExerciseLog(id, req.user.id);

      return ResponseDto.success(
        exerciseLog,
        'ดึงข้อมูล exercise log สำเร็จ',
      );
    } catch (error) {
      if (error.status === 404) {
        return ResponseDto.error('ไม่พบข้อมูล exercise log');
      }
      if (error.status === 403) {
        return ResponseDto.error('ไม่มีสิทธิ์เข้าถึง');
      }
      if (error.status === 400) {
        return ResponseDto.error(error.message);
      }
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Put(':id')
  async updateExerciseLog(
    @Param('id') id: string,
    @Body() updateExerciseLogDto: UpdateExerciseLogDto,
    @Request() req: any,
  ): Promise<ResponseDto<ExerciseLogResponseDto>> {
    try {
      const exerciseLog = await this.exerciseLogService.updateExerciseLog(
        id,
        req.user.id,
        updateExerciseLogDto,
      );

      return ResponseDto.success(
        exerciseLog,
        'อัปเดต exercise log สำเร็จ',
      );
    } catch (error) {
      if (error.status === 404) {
        return ResponseDto.error('ไม่พบข้อมูล exercise log');
      }
      if (error.status === 403) {
        return ResponseDto.error('ไม่มีสิทธิ์เข้าถึง');
      }
      if (error.status === 400) {
        return ResponseDto.error(error.message);
      }
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExerciseLog(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ResponseDto<void>> {
    try {
      await this.exerciseLogService.deleteExerciseLog(id, req.user.id);

      return ResponseDto.success(
        undefined,
        'ลบ exercise log สำเร็จ',
      );
    } catch (error) {
      if (error.status === 404) {
        return ResponseDto.error('ไม่พบข้อมูล exercise log');
      }
      if (error.status === 403) {
        return ResponseDto.error('ไม่มีสิทธิ์เข้าถึง');
      }
      if (error.status === 400) {
        return ResponseDto.error(error.message);
      }
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get('types/:exerciseType')
  async getExerciseLogsByType(
    @Param('exerciseType') exerciseType: string,
    @Query() query: ExerciseLogQueryDto,
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<ResponseDto<ExerciseLogResponseDto[]>> {
    try {
      const exerciseLogs = await this.exerciseLogService.getExerciseLogsByType(
        req.user.id,
        exerciseType,
        { ...query, page, limit },
      );

      return ResponseDto.success(
        exerciseLogs,
        'ดึงข้อมูล exercise logs ตามประเภทสำเร็จ',
      );
    } catch (error) {
      if (error.status === 400) {
        return ResponseDto.error(error.message);
      }
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get('calories/summary')
  async getCaloriesBurnedSummary(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ResponseDto<any>> {
    try {
      const summary = await this.exerciseLogService.getCaloriesBurnedSummary(
        req.user.id,
        startDate,
        endDate,
      );

      return ResponseDto.success(
        summary,
        'ดึงสรุปแคลอรี่ที่เผาผลาญสำเร็จ',
      );
    } catch (error) {
      if (error.status === 400) {
        return ResponseDto.error(error.message);
      }
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }

  @Get('streak/current')
  async getCurrentExerciseStreak(
    @Request() req: any,
  ): Promise<ResponseDto<any>> {
    try {
      const streak = await this.exerciseLogService.getCurrentExerciseStreak(req.user.id);

      return ResponseDto.success(
        streak,
        'ดึงข้อมูล exercise streak ปัจจุบันสำเร็จ',
      );
    } catch (error) {
      if (error.status === 400) {
        return ResponseDto.error(error.message);
      }
      return ResponseDto.error('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
  }
}
