import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { AIService } from './ai.service';

export interface ChatMessage {
  id: number;
  sessionId: number;
  userId: number;
  messageText: string;
  isUserMessage: boolean;
  timestamp: Date;
  messageType: string;
  aiResponseQuality?: number;
  userFeedback?: string;
}

export interface ChatSession {
  id: number;
  userId: number;
  sessionTitle: string;
  aiModel: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ChatResponse {
  message: string;
  suggestions: string[];
  healthInsights: string[];
  followUpQuestions: string[];
}

@Injectable()
export class ChatService {
  constructor(
    private supabaseService: SupabaseService,
    private aiService: AIService,
  ) {}

  // สร้างเซสชันแชทใหม่
  async createChatSession(
    userId: number,
    title?: string,
  ): Promise<ChatSession> {
    try {
      const sessionData = {
        user_id: userId,
        session_title:
          title || `Chat Session ${new Date().toLocaleString('th-TH')}`,
        ai_model: 'Claude Sonnet 4',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      const session = await this.supabaseService.createChatSession(sessionData);
      return session;
    } catch (error) {
      throw new Error(`Failed to create chat session: ${error.message}`);
    }
  }

  // ดึงเซสชันแชททั้งหมดของผู้ใช้
  async getChatSessions(userId: number): Promise<ChatSession[]> {
    try {
      const sessions =
        await this.supabaseService.getChatSessionsByUserId(userId);
      return sessions;
    } catch (error) {
      throw new Error(`Failed to get chat sessions: ${error.message}`);
    }
  }

  // ดึงข้อความในเซสชันแชท
  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    try {
      const messages =
        await this.supabaseService.getChatMessagesBySessionId(sessionId);
      return messages;
    } catch (error) {
      throw new Error(`Failed to get chat messages: ${error.message}`);
    }
  }

  // ส่งข้อความไปยัง AI และรับการตอบกลับ
  async sendMessage(
    sessionId: number,
    userId: number,
    message: string,
  ): Promise<ChatResponse> {
    try {
      // บันทึกข้อความของผู้ใช้
      const userMessage = await this.supabaseService.createChatMessage({
        session_id: sessionId,
        user_id: userId,
        message_text: message,
        is_user_message: true,
        timestamp: new Date().toISOString(),
        message_type: 'text',
      });

      // สร้างการตอบกลับจาก AI
      const aiResponse = await this.generateAIResponse(
        userId,
        message,
        sessionId,
      );

      // บันทึกการตอบกลับของ AI
      const aiMessage = await this.supabaseService.createChatMessage({
        session_id: sessionId,
        user_id: userId,
        message_text: aiResponse.message,
        is_user_message: false,
        timestamp: new Date().toISOString(),
        message_type: 'text',
      });

      // อัพเดทเวลาของเซสชัน
      await this.supabaseService.updateChatSession(sessionId, {
        updated_at: new Date().toISOString(),
      });

      return aiResponse;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // สร้างการตอบกลับจาก AI
  private async generateAIResponse(
    userId: number,
    userMessage: string,
    sessionId: number,
  ): Promise<ChatResponse> {
    try {
      // ดึงข้อมูลสุขภาพของผู้ใช้สำหรับ context
      const healthContext = await this.getHealthContext(userId);

      // สร้าง prompt สำหรับ AI
      const prompt = this.buildAIPrompt(userMessage, healthContext);

      // ส่งไปยัง AI Model (ในที่นี้จะจำลองการตอบกลับ)
      const aiResponse = await this.simulateAIResponse(prompt, healthContext);

      return aiResponse;
    } catch (error) {
      // Fallback response ถ้า AI ไม่สามารถตอบได้
      return {
        message:
          'ขออภัย ฉันไม่สามารถประมวลผลคำถามของคุณได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
        suggestions: ['ลองถามใหม่', 'ตรวจสอบการเชื่อมต่อ', 'ติดต่อผู้ดูแลระบบ'],
        healthInsights: [],
        followUpQuestions: [],
      };
    }
  }

  // ดึงข้อมูลสุขภาพสำหรับ context
  private async getHealthContext(userId: number): Promise<any> {
    try {
      const [userData, healthGoals, recentFoodLogs, recentExerciseLogs] =
        await Promise.all([
          this.supabaseService.getUserById(userId),
          this.supabaseService.getHealthGoalsByUserId(userId),
          this.supabaseService.getFoodLogsByUserId(userId),
          this.supabaseService.getExerciseLogsByUserId(userId),
        ]);

      return {
        user: userData,
        goals: healthGoals,
        recentFoods: recentFoodLogs.slice(0, 5),
        recentExercises: recentExerciseLogs.slice(0, 5),
      };
    } catch (error) {
      return {};
    }
  }

  // สร้าง prompt สำหรับ AI
  private buildAIPrompt(userMessage: string, healthContext: any): string {
    const user = healthContext.user;
    const goals = healthContext.goals;

    const prompt = `คุณเป็น AI ผู้ช่วยด้านสุขภาพที่ชื่อ VITA WISE AI

ข้อมูลผู้ใช้:
- ชื่อ: ${user?.first_name || 'ไม่ระบุ'} ${user?.last_name || ''}
- อายุ: ${user?.age || 'ไม่ระบุ'}
- เพศ: ${user?.gender || 'ไม่ระบุ'}
- น้ำหนัก: ${user?.weight_kg || 'ไม่ระบุ'} kg
- ส่วนสูง: ${user?.height_cm || 'ไม่ระบุ'} cm
- BMI: ${user?.bmi || 'ไม่ระบุ'}
- ระดับกิจกรรม: ${user?.activity_level || 'ไม่ระบุ'}

เป้าหมายสุขภาพ: ${goals?.map((g) => g.title).join(', ') || 'ไม่มีเป้าหมาย'}

คำถามของผู้ใช้: ${userMessage}

กรุณาตอบคำถามด้วยข้อมูลที่ถูกต้องและเป็นประโยชน์ เน้นการให้คำแนะนำที่ปฏิบัติได้จริง และให้กำลังใจผู้ใช้ในการดูแลสุขภาพ`;

    return prompt;
  }

  // จำลองการตอบกลับของ AI (ในอนาคตจะเชื่อมต่อกับ AI Model จริง)
  private async simulateAIResponse(
    prompt: string,
    healthContext: any,
  ): Promise<ChatResponse> {
    // วิเคราะห์คำถามของผู้ใช้
    const userMessage = prompt.split('คำถามของผู้ใช้: ')[1] || '';
    const lowerMessage = userMessage.toLowerCase();

    let response: ChatResponse;

    if (
      lowerMessage.includes('น้ำหนัก') ||
      lowerMessage.includes('ลดน้ำหนัก') ||
      lowerMessage.includes('เพิ่มน้ำหนัก')
    ) {
      response = this.generateWeightResponse(healthContext);
    } else if (
      lowerMessage.includes('ออกกำลังกาย') ||
      lowerMessage.includes('exercise')
    ) {
      response = this.generateExerciseResponse(healthContext);
    } else if (
      lowerMessage.includes('อาหาร') ||
      lowerMessage.includes('โภชนาการ') ||
      lowerMessage.includes('nutrition')
    ) {
      response = this.generateNutritionResponse(healthContext);
    } else if (lowerMessage.includes('นอน') || lowerMessage.includes('sleep')) {
      response = this.generateSleepResponse(healthContext);
    } else if (
      lowerMessage.includes('เป้าหมาย') ||
      lowerMessage.includes('goal')
    ) {
      response = this.generateGoalResponse(healthContext);
    } else {
      response = this.generateGeneralHealthResponse(healthContext);
    }

    return response;
  }

  // สร้างการตอบกลับเกี่ยวกับน้ำหนัก
  private generateWeightResponse(healthContext: any): ChatResponse {
    const user = healthContext.user;
    const bmi = user?.bmi;

    let message = '';
    let suggestions: string[] = [];
    let healthInsights: string[] = [];
    let followUpQuestions: string[] = [];

    if (bmi) {
      if (bmi < 18.5) {
        message = `BMI ของคุณคือ ${bmi} ซึ่งอยู่ในเกณฑ์น้ำหนักต่ำกว่าเกณฑ์ ควรเพิ่มน้ำหนักอย่างเหมาะสมเพื่อสุขภาพที่ดี`;
        suggestions = [
          'รับประทานอาหารที่มีแคลอรี่สูง เช่น ถั่ว อะโวคาโด',
          'เพิ่มโปรตีนในมื้ออาหาร',
          'ออกกำลังกายเพื่อเพิ่มมวลกล้ามเนื้อ',
        ];
        healthInsights = [
          'น้ำหนักต่ำอาจส่งผลต่อระบบภูมิคุ้มกัน',
          'ควรปรึกษาแพทย์เพื่อหาสาเหตุ',
        ];
      } else if (bmi < 25) {
        message = `BMI ของคุณคือ ${bmi} ซึ่งอยู่ในเกณฑ์ปกติ ยอดเยี่ยม! ควรรักษาระดับนี้ไว้`;
        suggestions = [
          'รักษานิสัยการรับประทานอาหารที่ดี',
          'ออกกำลังกายสม่ำเสมอ',
          'ตรวจสอบน้ำหนักเป็นประจำ',
        ];
        healthInsights = ['น้ำหนักปกติช่วยลดความเสี่ยงโรคเรื้อรัง'];
      } else if (bmi < 30) {
        message = `BMI ของคุณคือ ${bmi} ซึ่งอยู่ในเกณฑ์น้ำหนักเกิน ควรลดน้ำหนักเพื่อสุขภาพที่ดีขึ้น`;
        suggestions = [
          'ลดการรับประทานอาหารที่มีแคลอรี่สูง',
          'เพิ่มการออกกำลังกายแบบคาร์ดิโอ',
          'ปรึกษาโภชนากรเพื่อวางแผนอาหาร',
        ];
        healthInsights = [
          'น้ำหนักเกินเพิ่มความเสี่ยงโรคหัวใจ',
          'การลดน้ำหนัก 5-10% ช่วยสุขภาพได้มาก',
        ];
      } else {
        message = `BMI ของคุณคือ ${bmi} ซึ่งอยู่ในเกณฑ์อ้วน ควรลดน้ำหนักอย่างเร่งด่วนเพื่อสุขภาพ`;
        suggestions = [
          'ปรึกษาแพทย์เพื่อวางแผนลดน้ำหนัก',
          'เริ่มออกกำลังกายเบาๆ เช่น เดินเร็ว',
          'ปรับเปลี่ยนพฤติกรรมการรับประทานอาหาร',
        ];
        healthInsights = [
          'โรคอ้วนเพิ่มความเสี่ยงโรคหลายชนิด',
          'ควรลดน้ำหนักภายใต้การดูแลแพทย์',
        ];
      }
    } else {
      message =
        'ฉันไม่สามารถประเมินน้ำหนักของคุณได้ กรุณาบันทึกข้อมูลน้ำหนักและส่วนสูงในโปรไฟล์';
      suggestions = ['อัพเดทข้อมูลส่วนตัว', 'บันทึกน้ำหนักและส่วนสูง'];
    }

    followUpQuestions = [
      'คุณต้องการคำแนะนำเพิ่มเติมเกี่ยวกับการลด/เพิ่มน้ำหนักหรือไม่?',
      'คุณมีเป้าหมายน้ำหนักที่ต้องการหรือไม่?',
      'คุณต้องการแผนการออกกำลังกายที่เหมาะสมหรือไม่?',
    ];

    return { message, suggestions, healthInsights, followUpQuestions };
  }

  // สร้างการตอบกลับเกี่ยวกับการออกกำลังกาย
  private generateExerciseResponse(healthContext: any): ChatResponse {
    const user = healthContext.user;
    const activityLevel = user?.activity_level;

    let message = '';
    let suggestions: string[] = [];
    let healthInsights: string[] = [];
    let followUpQuestions: string[] = [];

    if (activityLevel === 'sedentary') {
      message =
        'คุณอยู่ในระดับกิจกรรมต่ำ ควรเริ่มออกกำลังกายเพื่อสุขภาพที่ดีขึ้น';
      suggestions = [
        'เริ่มด้วยการเดินเร็ว 10-15 นาทีต่อวัน',
        'ใช้บันไดแทนลิฟต์',
        'ยืดกล้ามเนื้อเบาๆ ในตอนเช้า',
      ];
    } else if (activityLevel === 'lightly_active') {
      message = 'คุณออกกำลังกายเบาๆ ดีแล้ว! ลองเพิ่มความเข้มข้นขึ้นอีกนิด';
      suggestions = [
        'เพิ่มการเดินเร็วเป็น 30 นาทีต่อวัน',
        'ลองออกกำลังกายแบบ bodyweight exercises',
        'ว่ายน้ำหรือปั่นจักรยาน',
      ];
    } else if (activityLevel === 'moderately_active') {
      message = 'คุณออกกำลังกายปานกลาง ยอดเยี่ยม! ควรรักษาระดับนี้ไว้';
      suggestions = [
        'เพิ่มความหลากหลายของการออกกำลังกาย',
        'ลองออกกำลังกายแบบ HIIT',
        'ตั้งเป้าหมายการออกกำลังกายใหม่',
      ];
    } else {
      message = 'คุณออกกำลังกายมาก ดีมาก! ระวังอย่าหักโหมเกินไป';
      suggestions = [
        'ให้ร่างกายได้พักผ่อนเพียงพอ',
        'ปรับความเข้มข้นให้เหมาะสม',
        'ฟังเสียงร่างกาย',
      ];
    }

    healthInsights = [
      'การออกกำลังกายช่วยลดความเสี่ยงโรคหัวใจ',
      'ออกกำลังกาย 150 นาทีต่อสัปดาห์ช่วยสุขภาพได้มาก',
      'การออกกำลังกายช่วยลดความเครียดและปรับปรุงการนอน',
    ];

    followUpQuestions = [
      'คุณชอบการออกกำลังกายแบบไหน?',
      'คุณมีเวลาออกกำลังกายกี่วันต่อสัปดาห์?',
      'คุณต้องการแผนการออกกำลังกายที่เฉพาะเจาะจงหรือไม่?',
    ];

    return { message, suggestions, healthInsights, followUpQuestions };
  }

  // สร้างการตอบกลับเกี่ยวกับโภชนาการ
  private generateNutritionResponse(healthContext: any): ChatResponse {
    const message = 'โภชนาการที่ดีเป็นพื้นฐานของสุขภาพที่แข็งแรง';
    const suggestions = [
      'รับประทานผักผลไม้ให้ได้ 5 ส่วนต่อวัน',
      'เลือกโปรตีนจากแหล่งที่ดี เช่น ปลา ไก่ ถั่ว',
      'ลดการรับประทานอาหารแปรรูป',
      'ดื่มน้ำให้เพียงพอ 8-10 แก้วต่อวัน',
    ];
    const healthInsights = [
      'อาหารที่มีไฟเบอร์ช่วยระบบย่อยอาหาร',
      'โปรตีนช่วยสร้างและซ่อมแซมกล้ามเนื้อ',
      'วิตามินและแร่ธาตุช่วยระบบภูมิคุ้มกัน',
    ];
    const followUpQuestions = [
      'คุณมีอาหารที่ชอบหรือไม่ชอบเป็นพิเศษหรือไม่?',
      'คุณต้องการคำแนะนำเกี่ยวกับการวางแผนมื้ออาหารหรือไม่?',
      'คุณมีข้อจำกัดด้านอาหารหรือไม่?',
    ];

    return { message, suggestions, healthInsights, followUpQuestions };
  }

  // สร้างการตอบกลับเกี่ยวกับการนอน
  private generateSleepResponse(healthContext: any): ChatResponse {
    const message = 'การนอนที่ดีเป็นสิ่งสำคัญสำหรับสุขภาพและการฟื้นฟูร่างกาย';
    const suggestions = [
      'นอนให้ได้ 7-9 ชั่วโมงต่อคืน',
      'สร้างกิจวัตรก่อนนอนที่ผ่อนคลาย',
      'หลีกเลี่ยงการใช้อุปกรณ์อิเล็กทรอนิกส์ก่อนนอน',
      'สร้างสภาพแวดล้อมการนอนที่เหมาะสม',
    ];
    const healthInsights = [
      'การนอนไม่เพียงพอส่งผลต่อการทำงานของสมอง',
      'การนอนช่วยระบบภูมิคุ้มกันทำงานได้ดี',
      'การนอนช่วยควบคุมน้ำหนักและความอยากอาหาร',
    ];
    const followUpQuestions = [
      'คุณนอนได้กี่ชั่วโมงต่อคืนโดยเฉลี่ย?',
      'คุณมีปัญหาการนอนหรือไม่?',
      'คุณต้องการคำแนะนำเกี่ยวกับการปรับปรุงคุณภาพการนอนหรือไม่?',
    ];

    return { message, suggestions, healthInsights, followUpQuestions };
  }

  // สร้างการตอบกลับเกี่ยวกับเป้าหมาย
  private generateGoalResponse(healthContext: any): ChatResponse {
    const goals = healthContext.goals;

    if (goals && goals.length > 0) {
      const message = `คุณมีเป้าหมายสุขภาพ ${goals.length} ข้อ ดีมาก! การตั้งเป้าหมายช่วยให้เรามีทิศทางที่ชัดเจน`;
      const suggestions = [
        'ติดตามความคืบหน้าของเป้าหมายเป็นประจำ',
        'เฉลิมฉลองความสำเร็จเล็กๆ น้อยๆ',
        'ปรับเป้าหมายให้เหมาะสมหากจำเป็น',
      ];
      const healthInsights = [
        'การตั้งเป้าหมายที่ชัดเจนช่วยเพิ่มโอกาสสำเร็จ',
        'การติดตามความคืบหน้าช่วยสร้างแรงจูงใจ',
      ];
      const followUpQuestions = [
        'เป้าหมายไหนที่คุณต้องการความช่วยเหลือเป็นพิเศษ?',
        'คุณต้องการคำแนะนำเกี่ยวกับการบรรลุเป้าหมายหรือไม่?',
      ];

      return { message, suggestions, healthInsights, followUpQuestions };
    } else {
      const message =
        'คุณยังไม่มีเป้าหมายสุขภาพ ลองตั้งเป้าหมายเล็กๆ เริ่มต้นดูสิ!';
      const suggestions = [
        'ตั้งเป้าหมายที่วัดได้ เช่น ลดน้ำหนัก 5 กิโลกรัม',
        'ตั้งเป้าหมายที่ทำได้จริง',
        'กำหนดเวลาที่ชัดเจน',
      ];
      const healthInsights = [
        'การตั้งเป้าหมายช่วยสร้างแรงจูงใจ',
        'เป้าหมายที่ดีควรเป็น SMART (Specific, Measurable, Achievable, Relevant, Time-bound)',
      ];
      const followUpQuestions = [
        'คุณต้องการความช่วยเหลือในการตั้งเป้าหมายหรือไม่?',
        'คุณมีเป้าหมายสุขภาพที่อยากทำเป็นพิเศษหรือไม่?',
      ];

      return { message, suggestions, healthInsights, followUpQuestions };
    }
  }

  // สร้างการตอบกลับทั่วไปเกี่ยวกับสุขภาพ
  private generateGeneralHealthResponse(healthContext: any): ChatResponse {
    const message = 'สุขภาพที่ดีเริ่มต้นจากการดูแลตัวเองในชีวิตประจำวัน';
    const suggestions = [
      'รับประทานอาหารที่มีประโยชน์',
      'ออกกำลังกายสม่ำเสมอ',
      'นอนหลับให้เพียงพอ',
      'จัดการความเครียด',
      'ตรวจสุขภาพเป็นประจำ',
    ];
    const healthInsights = [
      'การดูแลสุขภาพเป็นเรื่องของความต่อเนื่อง',
      'การเปลี่ยนแปลงเล็กๆ น้อยๆ ส่งผลต่อสุขภาพในระยะยาว',
      'สุขภาพที่ดีช่วยให้คุณมีคุณภาพชีวิตที่ดีขึ้น',
    ];
    const followUpQuestions = [
      'คุณต้องการคำแนะนำเฉพาะด้านไหนเป็นพิเศษ?',
      'คุณมีคำถามเกี่ยวกับสุขภาพอื่นๆ หรือไม่?',
      'คุณต้องการแผนการดูแลสุขภาพที่เฉพาะเจาะจงหรือไม่?',
    ];

    return { message, suggestions, healthInsights, followUpQuestions };
  }

  // ให้คะแนนการตอบกลับของ AI
  async rateAIResponse(
    messageId: number,
    rating: number,
    feedback?: string,
  ): Promise<void> {
    try {
      await this.supabaseService.updateChatMessage(messageId, {
        ai_response_quality: rating,
        user_feedback: feedback || 'none',
      });
    } catch (error) {
      throw new Error(`Failed to rate AI response: ${error.message}`);
    }
  }

  // ปิดเซสชันแชท
  async closeChatSession(sessionId: number): Promise<void> {
    try {
      await this.supabaseService.updateChatSession(sessionId, {
        is_active: false,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      throw new Error(`Failed to close chat session: ${error.message}`);
    }
  }
}
