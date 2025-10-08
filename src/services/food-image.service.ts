import { Injectable, Logger } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FoodImageService {
  private readonly logger = new Logger(FoodImageService.name);

  constructor(private readonly openRouterService: OpenRouterService) {}

  /**
   * วิเคราะห์รูปอาหารจากไฟล์ภาพโดยใช้ AI จริง
   * @param imagePath path ของไฟล์ภาพ
   * @param originalName ชื่อไฟล์ต้นฉบับ
   */
  async analyzeFoodImage(
    imagePath: string,
    originalName: string,
  ): Promise<any> {
    try {
      // ตรวจสอบว่ามีไฟล์รูปภาพจริงหรือไม่
      if (!fs.existsSync(imagePath)) {
        this.logger.error(`Image file not found: ${imagePath}`);
        return this.getFallbackResponse(imagePath, 'ไม่พบไฟล์รูปภาพ');
      }

      // ตรวจสอบขนาดไฟล์
      const stats = fs.statSync(imagePath);
      if (stats.size > 5 * 1024 * 1024) { // 5MB
        this.logger.error(`Image file too large: ${stats.size} bytes`);
        return this.getFallbackResponse(imagePath, 'ไฟล์รูปภาพมีขนาดใหญ่เกินไป');
      }

      // ตรวจสอบประเภทไฟล์
      const ext = path.extname(imagePath).toLowerCase();
      const allowedExts = ['.png', '.jpg', '.jpeg', '.webp'];
      if (!allowedExts.includes(ext)) {
        this.logger.error(`Unsupported image format: ${ext}`);
        return this.getFallbackResponse(imagePath, 'รูปแบบไฟล์ไม่รองรับ');
      }

      this.logger.log(`Analyzing food image: ${imagePath} (${stats.size} bytes)`);

      // เรียกใช้ AI เพื่อวิเคราะห์รูปภาพจริง
      const result = await this.openRouterService.analyzeFoodImageWithAI(imagePath);

      this.logger.log(`Food image analyzed: ${result.food_name} - ${result.nutrition.calories} kcal`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to analyze food image: ${error.message}`, error);

      // ตรวจสอบประเภทข้อผิดพลาดและให้ข้อความที่เหมาะสม
      if (error.message.includes('API key')) {
        return this.getFallbackResponse(imagePath, 'ไม่มีสิทธิ์เข้าถึง AI service');
      } else if (error.message.includes('timeout')) {
        return this.getFallbackResponse(imagePath, 'การเชื่อมต่อ AI service ใช้เวลานานเกินไป');
      } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        return this.getFallbackResponse(imagePath, 'ไม่สามารถเชื่อมต่อกับ AI service ได้');
      } else {
        return this.getFallbackResponse(imagePath, 'ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
      }
    }
  }

  /**
   * สร้าง fallback response เมื่อไม่สามารถวิเคราะห์รูปภาพได้
   */
  private getFallbackResponse(imagePath: string, reason: string): any {
    return {
      food_name: 'อาหารที่วิเคราะห์ไม่ได้',
      nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
      recommendations: `${reason} กรุณาลองอัปโหลดรูปภาพที่ชัดเจนขึ้นหรือลองใหม่อีกครั้ง`,
      image_url: imagePath,
      analyzed_at: new Date().toISOString(),
      note: 'ไม่สามารถวิเคราะห์ได้',
    };
  }
}
