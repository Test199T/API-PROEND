import { Injectable, Logger } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as os from 'os';

@Injectable()
export class FoodImageService {
  private readonly logger = new Logger(FoodImageService.name);

  constructor(private readonly openRouterService: OpenRouterService) {}

  /**
   * Downloads an image from a URL and saves it to a temporary file.
   * @param url The URL of the image to download.
   * @returns The local path of the downloaded file.
   */
  private async _downloadImage(url: string): Promise<string> {
    const tempDir = os.tmpdir();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const tempFilePath = path.join(tempDir, `food-image-${uniqueSuffix}.jpg`);

    const writer = fs.createWriteStream(tempFilePath);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(tempFilePath));
      writer.on('error', reject);
    });
  }

  /**
   * วิเคราะห์รูปอาหารจากไฟล์ภาพหรือ URL โดยใช้ AI จริง
   * @param imagePathOrUrl path ของไฟล์ภาพ หรือ URL ของรูปภาพ
   * @param originalName ชื่อไฟล์ต้นฉบับ
   */
  async analyzeFoodImage(
    imagePathOrUrl: string,
    originalName: string,
  ): Promise<any> {
    let localImagePath: string | null = null;
    let isDownloaded = false;

    try {
      // ตรวจสอบว่าเป็น URL หรือไม่
      if (imagePathOrUrl.startsWith('http')) {
        this.logger.log(`Downloading image from URL: ${imagePathOrUrl}`);
        localImagePath = await this._downloadImage(imagePathOrUrl);
        isDownloaded = true;
        this.logger.log(`Image downloaded to temporary path: ${localImagePath}`);
      } else {
        localImagePath = imagePathOrUrl;
      }

      // ตรวจสอบว่ามีไฟล์รูปภาพจริงหรือไม่
      if (!fs.existsSync(localImagePath)) {
        this.logger.error(`Image file not found: ${localImagePath}`);
        return this.getFallbackResponse(imagePathOrUrl, 'ไม่พบไฟล์รูปภาพ');
      }

      // ตรวจสอบขนาดไฟล์
      const stats = fs.statSync(localImagePath);
      if (stats.size > 5 * 1024 * 1024) { // 5MB
        this.logger.error(`Image file too large: ${stats.size} bytes`);
        return this.getFallbackResponse(imagePathOrUrl, 'ไฟล์รูปภาพมีขนาดใหญ่เกินไป');
      }

      // ตรวจสอบประเภทไฟล์
      const ext = path.extname(localImagePath).toLowerCase();
      const allowedExts = ['.png', '.jpg', '.jpeg', '.webp'];
      if (!allowedExts.includes(ext)) {
        this.logger.error(`Unsupported image format: ${ext}`);
        return this.getFallbackResponse(imagePathOrUrl, 'รูปแบบไฟล์ไม่รองรับ');
      }

      this.logger.log(`Analyzing food image: ${localImagePath} (${stats.size} bytes)`);

      // เรียกใช้ AI เพื่อวิเคราะห์รูปภาพจริง
      const result = await this.openRouterService.analyzeFoodImageWithAI(localImagePath);

      this.logger.log(`Food image analyzed: ${result.food_name} - ${result.nutrition.calories} kcal`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to analyze food image: ${error.message}`, error);

      // ตรวจสอบประเภทข้อผิดพลาดและให้ข้อความที่เหมาะสม
      if (error.message.includes('API key')) {
        return this.getFallbackResponse(imagePathOrUrl, 'ไม่มีสิทธิ์เข้าถึง AI service');
      } else if (error.message.includes('timeout')) {
        return this.getFallbackResponse(imagePathOrUrl, 'การเชื่อมต่อ AI service ใช้เวลานานเกินไป');
      } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        return this.getFallbackResponse(imagePathOrUrl, 'ไม่สามารถเชื่อมต่อกับ AI service ได้');
      } else {
        return this.getFallbackResponse(imagePathOrUrl, 'ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      // ลบไฟล์ชั่วคราวถ้ามีการดาวน์โหลดเกิดขึ้น
      if (isDownloaded && localImagePath && fs.existsSync(localImagePath)) {
        this.logger.log(`Deleting temporary image file: ${localImagePath}`);
        fs.unlinkSync(localImagePath);
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
