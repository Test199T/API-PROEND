import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
   * สร้างข้อความด้วย AI (สำหรับหัวข้อหรือข้อความสั้นๆ)
   */
  async generateText(
    prompt: string,
    temperature: number = 0.7,
    maxTokens: number = 100,
  ): Promise<string> {
    try {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content:
            'คุณเป็นผู้ช่วยที่เก่งในการสรุปและสร้างข้อความที่กระชับ ชัดเจน และสื่อความหมาย',
        },
        { role: 'user', content: prompt },
      ];

      return await this.chatCompletion(
        messages,
        undefined,
        temperature,
        maxTokens,
      );
    } catch (error) {
      this.logger.error('Failed to generate text', error);
      throw error;
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
