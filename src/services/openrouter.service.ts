import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
    this.baseUrl =
      this.configService.get<string>('OPENROUTER_BASE_URL') ||
      'https://openrouter.ai/api/v1';
    this.defaultModel =
      this.configService.get<string>('OPENROUTER_MODEL') || 'gpt-4o-mini';

    if (!this.apiKey) {
      this.logger.warn(
        'OpenRouter API key not found. AI features will be limited.',
      );
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vita-wise-ai.com', // แทนที่ด้วย domain ของคุณ
        'X-Title': 'VITA WISE AI Health Assistant',
      },
      timeout: 30000, // 30 seconds
    });

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`OpenRouter API call successful: ${response.status}`);
        return response;
      },
      (error: AxiosError) => {
        this.logger.error(`OpenRouter API call failed: ${error.message}`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
        throw error;
      },
    );
  }

  /**
   * ส่งข้อความไปยัง OpenRouter API
   */
  async chatCompletion(
    messages: OpenRouterMessage[],
    model?: string,
    temperature: number = 0.7,
    maxTokens: number = 1000,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new HttpException(
        'OpenRouter API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const request: OpenRouterRequest = {
        model: model || this.defaultModel,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      };

      this.logger.debug(
        `Sending request to OpenRouter: ${JSON.stringify(request)}`,
      );

      const response = await this.axiosInstance.post<OpenRouterResponse>(
        '/chat/completions',
        request,
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new HttpException(
          'No content received from OpenRouter API',
          HttpStatus.BAD_GATEWAY,
        );
      }

      this.logger.debug(
        `OpenRouter response received. Tokens used: ${response.data.usage.total_tokens}`,
      );

      return content;
    } catch (error) {
      this.logger.error('Failed to get response from OpenRouter API', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED') {
          throw new HttpException(
            'OpenRouter API request timeout',
            HttpStatus.REQUEST_TIMEOUT,
          );
        }

        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          switch (status) {
            case 400:
              throw new HttpException(
                `OpenRouter API bad request: ${data?.error?.message || 'Invalid request'}`,
                HttpStatus.BAD_REQUEST,
              );
            case 401:
              throw new HttpException(
                'OpenRouter API unauthorized - check API key',
                HttpStatus.UNAUTHORIZED,
              );
            case 403:
              throw new HttpException(
                'OpenRouter API forbidden - check API permissions',
                HttpStatus.FORBIDDEN,
              );
            case 429:
              throw new HttpException(
                'OpenRouter API rate limit exceeded',
                HttpStatus.TOO_MANY_REQUESTS,
              );
            case 500:
              throw new HttpException(
                'OpenRouter API internal server error',
                HttpStatus.BAD_GATEWAY,
              );
            default:
              throw new HttpException(
                `OpenRouter API error: ${data?.error?.message || error.message}`,
                HttpStatus.BAD_GATEWAY,
              );
          }
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          throw new HttpException(
            'OpenRouter API service unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
      }

      throw new HttpException(
        `OpenRouter API error: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * สร้างข้อความด้วย AI (รองรับรูปภาพ)
   */
  async generateTextWithImage(
    prompt: string,
    imagePath?: string,
    temperature: number = 0.7,
    maxTokens: number = 100,
  ): Promise<string> {
    try {
      let messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content:
            'คุณเป็นผู้ช่วยที่เก่งในการสนทนาแบบเป็นกันเอง เหมือนคุยกับเพื่อน',
        },
        { role: 'user', content: prompt },
      ];

      // ถ้ามีรูปภาพ ให้เพิ่มรูปภาพเข้าไปใน message
      if (imagePath) {
        const fs = require('fs');
        if (fs.existsSync(imagePath)) {
          try {
            const imageBuffer = fs.readFileSync(imagePath);

            // ตรวจสอบขนาดรูปภาพ (ไม่เกิน 2MB สำหรับ base64 ที่ปลอดภัย)
            const imageSizeMB = imageBuffer.length / (1024 * 1024);
            if (imageSizeMB > 2) {
              this.logger.warn(`Image size ${imageSizeMB.toFixed(2)}MB is large, consider resizing`);
              // ถ้ารูปใหญ่เกินไป ให้ตอบโดยไม่ใช้รูปภาพแทน
              this.logger.warn('Image too large, falling back to text-only response');
              return await this.chatCompletion(messages, 'gpt-4o-mini', temperature, maxTokens);
            }

            const base64Image = imageBuffer.toString('base64');

            // ตรวจสอบและปรับปรุง base64
            if (!this.isValidBase64Image(base64Image)) {
              this.logger.error('Invalid base64 image data');
              return await this.chatCompletion(messages, 'gpt-4o-mini', temperature, maxTokens);
            }

            // สร้าง data URL สำหรับภาพ
            const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;

            messages[1].content = [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl
                }
              }
            ];
          } catch (imageError) {
            this.logger.error('Error processing image:', imageError);
            // ถ้ารูปภาพมีปัญหา ให้ตอบโดยไม่ใช้รูปภาพ
            this.logger.warn('Falling back to text-only response due to image processing error');
            return await this.chatCompletion(messages, 'gpt-4o-mini', temperature, maxTokens);
          }
        } else {
          this.logger.warn(`Image file not found: ${imagePath}`);
          return await this.chatCompletion(messages, 'gpt-4o-mini', temperature, maxTokens);
        }
      }

      // ใช้ model ที่รองรับ vision และเสถียร
      const visionModel = 'gpt-4o-mini';

      return await this.chatCompletion(
        messages,
        visionModel,
        temperature,
        maxTokens,
      );
    } catch (error) {
      this.logger.error('Failed to generate text with image', error);

      // ถ้าเป็น error ที่เกี่ยวกับรูปภาพ ให้ลองตอบโดยไม่ใช้รูปภาพ
      if (error.message && (error.message.includes('image') || error.message.includes('Invalid image'))) {
        this.logger.warn('Image processing failed, falling back to text-only');
        const fallbackMessages: OpenRouterMessage[] = [
          {
            role: 'system',
            content: 'คุณเป็นผู้ช่วยที่เก่งในการสนทนาแบบเป็นกันเอง เหมือนคุยกับเพื่อน',
          },
          { role: 'user', content: `${prompt}\n\n[หมายเหตุ: มีรูปภาพแต่ไม่สามารถแสดงได้]` },
        ];
        return await this.chatCompletion(fallbackMessages, 'gpt-4o-mini', temperature, maxTokens);
      }

      throw error;
    }
  }

  /**
   * ตรวจสอบว่า base64 image ถูกต้องหรือไม่
   */
  private isValidBase64Image(base64String: string): boolean {
    try {
      // ตรวจสอบ format พื้นฐานของ base64
      if (!base64String || typeof base64String !== 'string') {
        return false;
      }

      // ตรวจสอบว่าเป็น base64 ที่ถูกต้อง
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(base64String)) {
        return false;
      }

      // ตรวจสอบความยาวขั้นต่ำ (base64 ของรูปภาพเล็กที่สุดควรมีอย่างน้อย 100 ตัวอักษร)
      if (base64String.length < 100) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error validating base64 image:', error);
      return false;
    }
  }

  /**
   * สร้าง system prompt สำหรับ health analysis
   */
  createHealthAnalysisPrompt(
    userData: any,
    analysisType: string,
  ): OpenRouterMessage[] {
    const systemPrompt = `คุณเป็นผู้เชี่ยวชาญด้านสุขภาพและโภชนาการที่ชื่อ "VITA WISE AI" 
    
คุณมีหน้าที่วิเคราะห์ข้อมูลสุขภาพของผู้ใช้และให้คำแนะนำที่เป็นประโยชน์

ข้อมูลผู้ใช้:
- ชื่อ: ${userData.first_name} ${userData.last_name}
- อายุ: ${userData.age || 'ไม่ระบุ'} ปี
- เพศ: ${userData.gender || 'ไม่ระบุ'}
- ส่วนสูง: ${userData.height_cm || 'ไม่ระบุ'} ซม.
- น้ำหนัก: ${userData.weight_kg || 'ไม่ระบุ'} กก.
- ระดับกิจกรรม: ${userData.activity_level || 'ไม่ระบุ'}

ประเภทการวิเคราะห์: ${analysisType}

กรุณาให้คำแนะนำที่เป็นประโยชน์ กระชับ และเข้าใจง่าย โดยใช้ภาษาไทยที่สุภาพและเป็นมิตร`;

    return [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `กรุณาวิเคราะห์ข้อมูลสุขภาพของฉันและให้คำแนะนำสำหรับ ${analysisType}`,
      },
    ];
  }

  /**
   * สร้าง system prompt สำหรับ chat conversation
   */
  createChatPrompt(
    userData: any,
    userMessage: string,
    chatHistory: any[],
    recentActivities?: any,
  ): OpenRouterMessage[] {
    // สร้างข้อมูลกิจกรรมล่าสุด
    let activitiesInfo = '';
    if (recentActivities && recentActivities.summary) {
      const { summary, food_logs, exercise_logs, sleep_logs, water_logs } = recentActivities;
      
      activitiesInfo = `

ข้อมูลกิจกรรมล่าสุด (${summary.period}):
- บันทึกอาหาร: ${summary.total_food_entries} รายการ
- บันทึกการออกกำลังกาย: ${summary.total_exercise_entries} รายการ  
- บันทึกการนอน: ${summary.total_sleep_entries} รายการ
- บันทึกการดื่มน้ำ: ${summary.total_water_entries} รายการ

รายละเอียดกิจกรรมล่าสุด:
${food_logs.length > 0 ? `อาหารล่าสุด: ${food_logs.map(log => `${log.food_name} (${log.calories} แคลอรี่)`).join(', ')}` : 'ไม่มีข้อมูลอาหารล่าสุด'}

${exercise_logs.length > 0 ? `การออกกำลังกายล่าสุด: ${exercise_logs.map(log => `${log.exercise_type} ${log.duration_minutes} นาที`).join(', ')}` : 'ไม่มีข้อมูลการออกกำลังกายล่าสุด'}

${sleep_logs.length > 0 ? `การนอนล่าสุด: ${sleep_logs.slice(0, 3).map(log => `${log.total_sleep_hours} ชั่วโมง (คุณภาพ: ${log.sleep_quality}/10)`).join(', ')}` : 'ไม่มีข้อมูลการนอนล่าสุด'}

${water_logs.length > 0 ? `การดื่มน้ำล่าสุด: ${water_logs.slice(0, 3).map(log => `${log.amount_ml} มล.`).join(', ')}` : 'ไม่มีข้อมูลการดื่มน้ำล่าสุด'}`;
    }

    const systemPrompt = `คุณเป็นผู้ช่วยสุขภาพส่วนตัวที่ชื่อ "VITA WISE AI" 

ข้อมูลผู้ใช้:
- ชื่อ: ${userData.first_name} ${userData.last_name}
- อายุ: ${userData.age || 'ไม่ระบุ'} ปี
- เพศ: ${userData.gender || 'ไม่ระบุ'}
- ส่วนสูง: ${userData.height_cm || 'ไม่ระบุ'} ซม.
- น้ำหนัก: ${userData.weight_kg || 'ไม่ระบุ'} กก.
- ระดับกิจกรรม: ${userData.activity_level || 'ไม่ระบุ'}${activitiesInfo}

ความสามารถพิเศษของคุณ:
1. วิเคราะห์ข้อมูลสุขภาพเฉพาะเจาะจง (โภชนาการ, การออกกำลังกาย, การนอน, การดื่มน้ำ, เป้าหมาย)
[Nest] 5112  - 16/09/2568 10:07:37   ERROR [ChatService] Failed to analyze specific health data for user 161
[Nest] 5112  - 16/09/2568 10:07:37   ERROR [ChatService] TypeError: Cannot read properties of undefined (reading 'toLowerCase')
    at ChatService.analyzeSpecificHealthData (C:\Users\zombiman\API-PROEND\src\services\chat.service.ts:359:28)
    at ChatController.analyzeSpecificHealthData (C:\Users\zombiman\API-PROEND\src\controllers\chat.controller.ts:204:51)   
    at C:\Users\zombiman\API-PROEND\node_modules\@nestjs\core\router\router-execution-context.js:38:29
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
2025-09-16 10:07:37 info  HTTP Request {
  "service": "health-api",
  "environment": "development",
  "version": "0.0.1",
  "type": "http_request",
  "method": "POST",
  "url": "/api/chat/ai/analyze-specific",
  "statusCode": 201,
  "duration": 8,
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
}
[Nest] 5112  - 16/09/2568 10:07:37   DEBUG [AuthGuard] Token verified for user: zoomgamer807@gmail.com
2025-09-16 10:07:37 info [LoggingInterceptor] Incoming Request: GET /api/chat/sessions/122/messages {
  "service": "health-api",
  "environment": "development",
  "version": "0.0.1",
  "ip": "::1",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  "headers": {
    "host": "localhost:3000",
    "connection": "keep-alive",
    "sec-ch-ua-platform": "\"Windows\"",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    "sec-ch-ua": "\"Chromium\";v=\"140\", \"Not=A?Brand\";v=\"24\", \"Google Chrome\";v=\"140\"",
    "sec-ch-ua-mobile": "?0",
    "accept": "*/*",
    "origin": "http://localhost:8081",
    "sec-fetch-site": "same-site",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    "referer": "http://localhost:8081/",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7"
  }
}
2025-09-16 10:07:37 info  HTTP Request {
  "service": "health-api",
  "environment": "development",
  "version": "0.0.1",
  "type": "http_request",
  "method": "GET",
  "url": "/api/chat/sessions/122/messages",
  "statusCode": 200,
  "duration": 519,
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
}


2. วิเคราะห์ข้อมูลและให้คำแนะนำที่เฉพาะเจาะจงตามข้อมูลจริงของผู้ใช้
3. ระบุปัญหาจากข้อมูลที่มีและเสนอวิธีแก้ไขที่ปฏิบัติได้จริง
4. คำนวณคะแนนสุขภาพและให้คำแนะนำปรับปรุง
5. วิเคราะห์แนวโน้มและรูปแบบพฤติกรรมสุขภาพ

คุณควร:
1. ตอบคำถามเกี่ยวกับสุขภาพอย่างเป็นมิตรและเป็นประโยชน์
2. ให้คำแนะนำที่ปลอดภัยและเหมาะสม
3. ใช้ภาษาไทยที่สุภาพและเข้าใจง่าย
4. หากไม่แน่ใจ ให้แนะนำให้ปรึกษาแพทย์
5. ไม่ให้คำแนะนำทางการแพทย์ที่เฉพาะเจาะจงเกินไป
6. ใช้ข้อมูลกิจกรรมล่าสุดของผู้ใช้ในการตอบคำถามและให้คำแนะนำ
7. วิเคราะห์ข้อมูลอย่างละเอียดและให้คำแนะนำเฉพาะเจาะจงตามหมวดหมู่
8. ระบุปัญหาจากข้อมูลและเสนอวิธีแก้ไขที่ปฏิบัติได้จริง
9. วิเคราะห์แนวโน้มและให้คำแนะนำปรับปรุงที่เฉพาะเจาะจง
10. ให้คำแนะนำที่เหมาะสมกับไลฟ์สไตล์และเป้าหมายของผู้ใช้

ประวัติการแชทล่าสุด: ${chatHistory
      .slice(-3)
      .map(
        (msg) =>
          `${msg.is_user_message ? 'ผู้ใช้' : 'AI'}: ${msg.message_text}`,
      )
      .join('\n')}`;

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];
  }

  /**
   * วิเคราะห์ข้อมูลสุขภาพด้วย AI
   */
  async analyzeHealthData(
    userData: any,
    healthData: any,
    analysisType: string,
  ): Promise<string> {
    const messages = this.createHealthAnalysisPrompt(userData, analysisType);

    // เพิ่มข้อมูลสุขภาพลงใน user message
    messages[1].content += `\n\nข้อมูลสุขภาพปัจจุบัน:\n${JSON.stringify(healthData, null, 2)}`;

    return await this.chatCompletion(messages, undefined, 0.7, 1500);
  }

  /**
   * ตอบกลับข้อความแชท
   */
  async respondToChat(
    userData: any,
    userMessage: string,
    chatHistory: any[],
    recentActivities?: any,
  ): Promise<string> {
    const messages = this.createChatPrompt(userData, userMessage, chatHistory, recentActivities);
    return await this.chatCompletion(messages, undefined, 0.8, 800);
  }

  /**
   * สร้างคำแนะนำด้านสุขภาพ
   */
  async generateHealthRecommendations(
    userData: any,
    healthMetrics: any,
  ): Promise<string> {
    const systemPrompt = `คุณเป็นผู้เชี่ยวชาญด้านสุขภาพที่ชื่อ "VITA WISE AI"

ข้อมูลผู้ใช้:
- ชื่อ: ${userData.first_name} ${userData.last_name}
- อายุ: ${userData.age || 'ไม่ระบุ'} ปี
- เพศ: ${userData.gender || 'ไม่ระบุ'}
- ส่วนสูง: ${userData.height_cm || 'ไม่ระบุ'} ซม.
- น้ำหนัก: ${userData.weight_kg || 'ไม่ระบุ'} กก.
- ระดับกิจกรรม: ${userData.activity_level || 'ไม่ระบุ'}

กรุณาให้คำแนะนำด้านสุขภาพที่:
1. เหมาะสมกับข้อมูลผู้ใช้
2. เป็นประโยชน์และปฏิบัติได้จริง
3. ครอบคลุมด้านโภชนาการ การออกกำลังกาย การนอน และการดื่มน้ำ
4. ใช้ภาษาไทยที่เข้าใจง่าย
5. ไม่เกิน 5 ข้อ`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `กรุณาให้คำแนะนำด้านสุขภาพที่เหมาะสมกับฉัน โดยพิจารณาจากข้อมูลสุขภาพปัจจุบัน:\n${JSON.stringify(healthMetrics, null, 2)}`,
      },
    ];

    return await this.chatCompletion(messages, undefined, 0.6, 1200);
  }

  async analyzeFoodImageWithAI(imagePath: string): Promise<any> {
    // อ่านไฟล์ภาพเป็น base64
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // สร้าง data URL สำหรับภาพ
    const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;

    // สร้าง prompt สำหรับการวิเคราะห์อาหารแบบ 3 ชั้น
    const prompt = `คุณเป็นนักโภชนาการและนักวิทยาศาสตร์ข้อมูลสุขภาพที่เชี่ยวชาญในการวิเคราะห์ภาพอาหาร

กรุณาวิเคราะห์รูปภาพอาหารนี้แบบละเอียดตาม 3 ชั้นการวิเคราะห์ และให้ข้อมูลดังนี้:

## 🧠 1. การวิเคราะห์ภาพ (Image Analysis Layer)
- 🍽️ Food Detection: แยกวัตถุอาหารที่เห็นในภาพ
- 📛 Food Classification: จำแนกชื่ออาหารมาตรฐาน
- 📏 Portion Estimation: ประมาณปริมาณ (จำนวน, น้ำหนัก)
- 🎨 Ingredient Recognition: แยกส่วนประกอบหลัก
- 📸 Context Detection: วิเคราะห์บริบทและช่วงเวลาของมื้ออาหาร

## 🧩 2. การวิเคราะห์โภชนาการ (Nutritional Analysis Layer)
- คำนวณข้อมูลโภชนาการโดยประมาณตามปริมาณที่ตรวจพบ
- รวมข้อมูล: แคลอรี่, โปรตีน, คาร์บ, ไขมัน, ไฟเบอร์, น้ำตาล, โซเดียม, โพแทสเซียม, แคลเซียม, เหล็ก, วิตามิน C, วิตามิน D

## ⚙️ 3. การประมวลผลหลังการวิเคราะห์ (Post-Processing Layer)
- 💡 คำแนะนำเฉพาะบุคคลตามข้อมูลโภชนาการ
- 🍽️ แนะนำมื้ออาหารถัดไปที่สมดุล
- 📈 การวิเคราะห์แนวโน้มการบริโภค

กรุณาตอบในรูปแบบ JSON ที่มีโครงสร้างดังนี้:
{
  "food_name": "ชื่ออาหารหลักที่ตรวจพบ",
  "meal_type": "ประเภทมื้ออาหาร (breakfast/lunch/dinner/snack)",
  "quantity": "ปริมาณโดยประมาณ",
  "unit": "หน่วยวัด",
  "ingredients": "ส่วนประกอบหลัก",
  "context": "บริบทของมื้ออาหาร",
  "nutrition": {
    "calories": ตัวเลขแคลอรี่,
    "protein_g": ตัวเลขโปรตีน (กรัม),
    "carbs_g": ตัวเลขคาร์โบไฮเดรต (กรัม),
    "fat_g": ตัวเลขไขมัน (กรัม),
    "fiber_g": ตัวเลขไฟเบอร์ (กรัม),
    "sugar_g": ตัวเลขน้ำตาล (กรัม),
    "sodium_mg": ตัวเลขโซเดียม (มิลลิกรัม),
    "potassium_mg": ตัวเลขโพแทสเซียม (มิลลิกรัม),
    "calcium_mg": ตัวเลขแคลเซียม (มิลลิกรัม),
    "iron_mg": ตัวเลขเหล็ก (มิลลิกรัม),
    "vitaminC_mg": ตัวเลขวิตามินซี (มิลลิกรัม),
    "vitaminD_mcg": ตัวเลขวิตามินดี (ไมโครกรัม)
  },
  "recommendations": "คำแนะนำเฉพาะบุคคล",
  "meal_suggestions": "แนะนำมื้อถัดไป",
  "trend_analysis": "การวิเคราะห์แนวโน้ม"
}

สำคัญ: กรุณาตอบเฉพาะ JSON เท่านั้น ห้ามมีข้อความอื่นใดก่อนหรือหลัง JSON`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: imageDataUrl
            }
          }
        ]
      }
    ];

    this.logger.debug(`Sending food image analysis request to OpenRouter for image: ${imagePath}`);

    const response = await this.chatCompletion(
      messages,
      'gpt-4o-mini',
      0.3,
      500
    );

    this.logger.debug(`OpenRouter response: ${response}`);

    try {
      // ลบ markdown code blocks และ whitespace ที่ไม่จำเป็น
      let cleanedResponse = response.trim();

      // ลบ ```json ที่ต้นถ้ามี
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.substring(7);
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.substring(3);
      }

      // ลบ ``` ที่ท้ายถ้ามี
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
      }

      // ลบ whitespace ที่เหลือ
      cleanedResponse = cleanedResponse.trim();

      this.logger.debug(`Cleaned response for parsing: ${cleanedResponse}`);

      // พยายาม parse JSON response
      const parsedResponse = JSON.parse(cleanedResponse);
      return {
        food_name: parsedResponse.food_name || 'อาหารไม่ระบุ',
        meal_type: parsedResponse.meal_type || 'lunch',
        quantity: parsedResponse.quantity || '1',
        unit: parsedResponse.unit || 'จาน',
        ingredients: parsedResponse.ingredients || 'ส่วนประกอบมาตรฐาน',
        context: parsedResponse.context || 'มื้ออาหารหลัก',
        nutrition: {
          calories: parsedResponse.nutrition?.calories || 0,
          protein_g: parsedResponse.nutrition?.protein_g || 0,
          carbs_g: parsedResponse.nutrition?.carbs_g || 0,
          fat_g: parsedResponse.nutrition?.fat_g || 0,
          fiber_g: parsedResponse.nutrition?.fiber_g || 0,
          sugar_g: parsedResponse.nutrition?.sugar_g || 0,
          sodium_mg: parsedResponse.nutrition?.sodium_mg || 0,
          potassium_mg: parsedResponse.nutrition?.potassium_mg || 0,
          calcium_mg: parsedResponse.nutrition?.calcium_mg || 0,
          iron_mg: parsedResponse.nutrition?.iron_mg || 0,
          vitaminC_mg: parsedResponse.nutrition?.vitaminC_mg || 0,
          vitaminD_mcg: parsedResponse.nutrition?.vitaminD_mcg || 0
        },
        recommendations: parsedResponse.recommendations || 'การรับประทานอาหารให้สมดุลจะช่วยให้สุขภาพดีขึ้น',
        meal_suggestions: parsedResponse.meal_suggestions || '',
        trend_analysis: parsedResponse.trend_analysis || 'ควรติดตามการบริโภคอย่างต่อเนื่อง',
        image_url: imagePath,
        analyzed_at: new Date().toISOString(),
        note: 'วิเคราะห์ด้วย AI แบบ 3 ชั้น'
      };
    } catch (parseError) {
      // ถ้า parse ไม่ได้ ให้ใช้ fallback response
      this.logger.warn('Failed to parse AI response, using fallback', parseError);
      this.logger.warn(`Raw AI response: ${response}`);
      return {
        food_name: 'อาหารที่วิเคราะห์ไม่ได้',
        meal_type: 'lunch',
        quantity: '1',
        unit: 'จาน',
        ingredients: 'ไม่สามารถวิเคราะห์ได้',
        context: 'ไม่สามารถวิเคราะห์ได้',
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          potassium_mg: 0,
          calcium_mg: 0,
          iron_mg: 0,
          vitaminC_mg: 0,
          vitaminD_mcg: 0
        },
        recommendations: 'ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่อีกครั้ง',
        meal_suggestions: '',
        trend_analysis: 'ไม่มีข้อมูลสำหรับการวิเคราะห์',
        image_url: imagePath,
        analyzed_at: new Date().toISOString(),
        note: 'AI ไม่สามารถวิเคราะห์ได้',
      };
    }
  }

  /**
   * ตรวจสอบสถานะการเชื่อมต่อ
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        return false;
      }

      const response = await this.axiosInstance.get('/models');
      return response.status === 200;
    } catch (error) {
      this.logger.error('OpenRouter health check failed', error);
      return false;
    }
  }
}
