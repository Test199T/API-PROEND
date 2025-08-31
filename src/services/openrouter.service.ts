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
    this.baseUrl = this.configService.get<string>('OPENROUTER_BASE_URL') || 'https://openrouter.ai/api/v1';
    this.defaultModel = this.configService.get<string>('OPENROUTER_MODEL') || 'gpt-4o-mini';

    if (!this.apiKey) {
      this.logger.warn('OpenRouter API key not found. AI features will be limited.');
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
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
      }
    );
  }

  /**
   * ส่งข้อความไปยัง OpenRouter API
   */
  async chatCompletion(
    messages: OpenRouterMessage[],
    model?: string,
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<string> {
    if (!this.apiKey) {
      throw new HttpException(
        'OpenRouter API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE
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

      this.logger.debug(`Sending request to OpenRouter: ${JSON.stringify(request)}`);

      const response = await this.axiosInstance.post<OpenRouterResponse>('/chat/completions', request);
      
      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new HttpException(
          'No content received from OpenRouter API',
          HttpStatus.BAD_GATEWAY
        );
      }

      this.logger.debug(`OpenRouter response received. Tokens used: ${response.data.usage.total_tokens}`);
      
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
            HttpStatus.REQUEST_TIMEOUT
          );
        }
        
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as any;
          
          switch (status) {
            case 400:
              throw new HttpException(
                `OpenRouter API bad request: ${data?.error?.message || 'Invalid request'}`,
                HttpStatus.BAD_REQUEST
              );
            case 401:
              throw new HttpException(
                'OpenRouter API unauthorized - check API key',
                HttpStatus.UNAUTHORIZED
              );
            case 403:
              throw new HttpException(
                'OpenRouter API forbidden - check API permissions',
                HttpStatus.FORBIDDEN
              );
            case 429:
              throw new HttpException(
                'OpenRouter API rate limit exceeded',
                HttpStatus.TOO_MANY_REQUESTS
              );
            case 500:
              throw new HttpException(
                'OpenRouter API internal server error',
                HttpStatus.BAD_GATEWAY
              );
            default:
              throw new HttpException(
                `OpenRouter API error: ${data?.error?.message || error.message}`,
                HttpStatus.BAD_GATEWAY
              );
          }
        }
        
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          throw new HttpException(
            'OpenRouter API service unavailable',
            HttpStatus.SERVICE_UNAVAILABLE
          );
        }
      }
      
      throw new HttpException(
        `OpenRouter API error: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  /**
   * สร้างข้อความด้วย AI (สำหรับหัวข้อหรือข้อความสั้นๆ)
   */
  async generateText(prompt: string, temperature: number = 0.7, maxTokens: number = 100): Promise<string> {
    try {
      const messages: OpenRouterMessage[] = [
        { role: 'system', content: 'คุณเป็นผู้ช่วยที่เก่งในการสรุปและสร้างข้อความที่กระชับ ชัดเจน และสื่อความหมาย' },
        { role: 'user', content: prompt }
      ];

      return await this.chatCompletion(messages, undefined, temperature, maxTokens);
    } catch (error) {
      this.logger.error('Failed to generate text', error);
      throw error;
    }
  }

  /**
   * สร้าง system prompt สำหรับ health analysis
   */
  createHealthAnalysisPrompt(userData: any, analysisType: string): OpenRouterMessage[] {
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
      { role: 'user', content: `กรุณาวิเคราะห์ข้อมูลสุขภาพของฉันและให้คำแนะนำสำหรับ ${analysisType}` }
    ];
  }

  /**
   * สร้าง system prompt สำหรับ chat conversation
   */
  createChatPrompt(userData: any, userMessage: string, chatHistory: any[]): OpenRouterMessage[] {
    const systemPrompt = `คุณเป็นผู้ช่วยสุขภาพส่วนตัวที่ชื่อ "VITA WISE AI" 

ข้อมูลผู้ใช้:
- ชื่อ: ${userData.first_name} ${userData.last_name}
- อายุ: ${userData.age || 'ไม่ระบุ'} ปี
- เพศ: ${userData.gender || 'ไม่ระบุ'}
- ส่วนสูง: ${userData.height_cm || 'ไม่ระบุ'} ซม.
- น้ำหนัก: ${userData.weight_kg || 'ไม่ระบุ'} กก.
- ระดับกิจกรรม: ${userData.activity_level || 'ไม่ระบุ'}

คุณควร:
1. ตอบคำถามเกี่ยวกับสุขภาพอย่างเป็นมิตรและเป็นประโยชน์
2. ให้คำแนะนำที่ปลอดภัยและเหมาะสม
3. ใช้ภาษาไทยที่สุภาพและเข้าใจง่าย
4. หากไม่แน่ใจ ให้แนะนำให้ปรึกษาแพทย์
5. ไม่ให้คำแนะนำทางการแพทย์ที่เฉพาะเจาะจงเกินไป

ประวัติการแชทล่าสุด: ${chatHistory.slice(-3).map(msg => `${msg.is_user_message ? 'ผู้ใช้' : 'AI'}: ${msg.message_text}`).join('\n')}`;

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];
  }

  /**
   * วิเคราะห์ข้อมูลสุขภาพด้วย AI
   */
  async analyzeHealthData(userData: any, healthData: any, analysisType: string): Promise<string> {
    const messages = this.createHealthAnalysisPrompt(userData, analysisType);
    
    // เพิ่มข้อมูลสุขภาพลงใน user message
    messages[1].content += `\n\nข้อมูลสุขภาพปัจจุบัน:\n${JSON.stringify(healthData, null, 2)}`;
    
    return await this.chatCompletion(messages, undefined, 0.7, 1500);
  }

  /**
   * ตอบกลับข้อความแชท
   */
  async respondToChat(userData: any, userMessage: string, chatHistory: any[]): Promise<string> {
    const messages = this.createChatPrompt(userData, userMessage, chatHistory);
    return await this.chatCompletion(messages, undefined, 0.8, 800);
  }

  /**
   * สร้างคำแนะนำด้านสุขภาพ
   */
  async generateHealthRecommendations(userData: any, healthMetrics: any): Promise<string> {
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
      { role: 'user', content: `กรุณาให้คำแนะนำด้านสุขภาพที่เหมาะสมกับฉัน โดยพิจารณาจากข้อมูลสุขภาพปัจจุบัน:\n${JSON.stringify(healthMetrics, null, 2)}` }
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
