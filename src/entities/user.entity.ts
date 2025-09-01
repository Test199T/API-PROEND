import { HealthGoal } from './health-goal.entity';
import { FoodLog } from './food-log.entity';
import { ExerciseLog } from './exercise-log.entity';
import { SleepLog } from './sleep-log.entity';
import { WaterLog } from './water-log.entity';
import { HealthMetric } from './health-metric.entity';
import { ChatSession } from './chat-session.entity';
import { Notification } from './notification.entity';
import { AIInsight } from './ai-insight.entity';
import { UserPreference } from './user-preference.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTREMELY_ACTIVE = 'extremely_active',
}

export class User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;

  // ข้อมูลสุขภาพเพิ่มเติม (JSON fields)
  health_data?: {
    waist_circumference_cm?: number; // รอบเอว
    blood_pressure_systolic?: number; // ความดันโลหิตตัวบน
    blood_pressure_diastolic?: number; // ความดันโลหิตตัวล่าง
    blood_sugar_mg_dl?: number; // น้ำตาลในเลือด
  };

  // เป้าหมายสุขภาพ (JSON fields)
  health_goals?: {
    main_goal?: string; // เป้าหมายหลัก
    goal_duration?: string; // ระยะเวลาเป้าหมาย
    motivation?: string; // แรงจูงใจ
    target_weight_kg?: number; // เป้าหมายน้ำหนัก
    target_sleep_hours?: number; // เป้าหมายการนอน
    target_exercise_minutes_per_day?: number; // เป้าหมายออกกำลังกาย
  };

  // เป้าหมายโภชนาการ (JSON fields)
  nutrition_goals?: {
    target_calories_per_day?: number; // เป้าหมายแคลอรี่
    target_protein_grams_per_day?: number; // เป้าหมายโปรตีน
    target_carbs_grams_per_day?: number; // เป้าหมายคาร์โบไฮเดรต
    target_fat_grams_per_day?: number; // เป้าหมายไขมัน
    target_fiber_grams_per_day?: number; // เป้าหมายไฟเบอร์
    target_sodium_mg_per_day?: number; // เป้าหมายโซเดียม
    dietary_restrictions?: string[]; // ข้อจำกัดอาหาร
  };

  // พฤติกรรมประจำวัน (JSON fields)
  daily_behavior?: {
    exercise_frequency_per_week?: number; // ความถี่การออกกำลังกาย
    average_sleep_hours_per_day?: number; // ชั่วโมงการนอนต่อวัน
    meals_per_day?: number; // มื้ออาหารต่อวัน
    alcohol_consumption?: string; // การดื่มแอลกอฮอล์
    smoking_status?: string; // สถานะการสูบบุหรี่
    daily_water_goal_ml?: number; // เป้าหมายน้ำดื่มต่อวัน
  };

  // ประวัติสุขภาพ (JSON fields)
  medical_history?: {
    chronic_conditions?: string[]; // โรคประจำตัว
    surgery_history?: string[]; // ประวัติการผ่าตัด
    allergies?: string[]; // ประวัติการแพ้
    medications?: string[]; // ยาที่กำลังใช้
    family_medical_history?: string; // ประวัติครอบครัว
  };

  // Relations
  healthGoals: HealthGoal[];
  foodLogs: FoodLog[];
  exerciseLogs: ExerciseLog[];
  sleepLogs: SleepLog[];
  waterLogs: WaterLog[];
  healthMetrics: HealthMetric[];
  chatSessions: ChatSession[];
  notifications: Notification[];
  aiInsights: AIInsight[];
  userPreference: UserPreference;

  // Computed properties
  get age(): number | null {
    if (!this.date_of_birth) return null;
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  get bmi(): number | null {
    if (!this.height_cm || !this.weight_kg) return null;
    const heightInMeters = this.height_cm / 100;
    return Number(
      (this.weight_kg / (heightInMeters * heightInMeters)).toFixed(2),
    );
  }

  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  // เพิ่มคำนวณ BMI Status
  get bmiStatus(): string | null {
    const bmiValue = this.bmi;
    if (!bmiValue) return null;

    if (bmiValue < 18.5) return 'ต่ำกว่าเกณฑ์';
    if (bmiValue < 25) return 'ปกติ';
    if (bmiValue < 30) return 'เกินเกณฑ์';
    return 'อ้วน';
  }

  // คำนวณความดันโลหิตสถานะ
  get bloodPressureStatus(): string | null {
    if (
      !this.health_data?.blood_pressure_systolic ||
      !this.health_data?.blood_pressure_diastolic
    )
      return null;

    const systolic = this.health_data.blood_pressure_systolic;
    const diastolic = this.health_data.blood_pressure_diastolic;

    if (systolic < 120 && diastolic < 80) return 'ปกติ';
    if (systolic < 130 && diastolic < 80) return 'เฝ้าระวัง';
    if (systolic < 140 || diastolic < 90) return 'ความดันโลหิตสูงระดับ 1';
    return 'ความดันโลหิตสูงระดับ 2';
  }

  // คำนวณน้ำตาลในเลือดสถานะ
  get bloodSugarStatus(): string | null {
    if (!this.health_data?.blood_sugar_mg_dl) return null;

    const bloodSugar = this.health_data.blood_sugar_mg_dl;

    if (bloodSugar < 100) return 'ปกติ';
    if (bloodSugar < 126) return 'เบาหวานเริ่มต้น';
    return 'เบาหวาน';
  }
}
