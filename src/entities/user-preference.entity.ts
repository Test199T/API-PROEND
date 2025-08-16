import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export enum Language {
  TH = 'th',
  EN = 'en',
}

export enum MeasurementUnit {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

export enum PrivacyLevel {
  MINIMAL = 'minimal',
  STANDARD = 'standard',
  DETAILED = 'detailed',
}

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @OneToOne(() => User, (user) => user.userPreference, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: Theme,
    default: Theme.LIGHT,
  })
  theme: Theme;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.TH,
  })
  language: Language;

  @Column({ type: 'varchar', length: 50, default: 'Asia/Bangkok' })
  timezone: string;

  @Column({
    type: 'enum',
    enum: MeasurementUnit,
    default: MeasurementUnit.METRIC,
  })
  measurement_unit: MeasurementUnit;

  @Column({ type: 'boolean', default: true })
  notification_email: boolean;

  @Column({ type: 'boolean', default: true })
  notification_push: boolean;

  @Column({ type: 'boolean', default: false })
  notification_sms: boolean;

  @Column({
    type: 'enum',
    enum: PrivacyLevel,
    default: PrivacyLevel.STANDARD,
  })
  privacy_level: PrivacyLevel;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Computed properties
  get theme_text(): string {
    const themeMap = {
      [Theme.LIGHT]: 'สว่าง',
      [Theme.DARK]: 'มืด',
      [Theme.AUTO]: 'อัตโนมัติ',
    };

    return themeMap[this.theme];
  }

  get language_text(): string {
    const languageMap = {
      [Language.TH]: 'ไทย',
      [Language.EN]: 'English',
    };

    return languageMap[this.language];
  }

  get measurement_unit_text(): string {
    const unitMap = {
      [MeasurementUnit.METRIC]: 'เมตริก',
      [MeasurementUnit.IMPERIAL]: 'อิมพีเรียล',
    };

    return unitMap[this.measurement_unit];
  }

  get privacy_level_text(): string {
    const privacyMap = {
      [PrivacyLevel.MINIMAL]: 'น้อยที่สุด',
      [PrivacyLevel.STANDARD]: 'มาตรฐาน',
      [PrivacyLevel.DETAILED]: 'ละเอียด',
    };

    return privacyMap[this.privacy_level];
  }

  get timezone_formatted(): string {
    const timezoneMap = {
      'Asia/Bangkok': 'กรุงเทพฯ (GMT+7)',
      'Asia/Singapore': 'สิงคโปร์ (GMT+8)',
      'Asia/Tokyo': 'โตเกียว (GMT+9)',
      'America/New_York': 'นิวยอร์ก (GMT-5)',
      'Europe/London': 'ลอนดอน (GMT+0)',
      UTC: 'UTC (GMT+0)',
    };

    return timezoneMap[this.timezone] || this.timezone;
  }

  get notification_count(): number {
    let count = 0;
    if (this.notification_email) count++;
    if (this.notification_push) count++;
    if (this.notification_sms) count++;
    return count;
  }

  get has_notifications_enabled(): boolean {
    return this.notification_count > 0;
  }

  get is_dark_mode(): boolean {
    if (this.theme === Theme.DARK) return true;
    if (this.theme === Theme.AUTO) {
      // ตรวจสอบเวลาปัจจุบัน
      const hour = new Date().getHours();
      return hour < 6 || hour >= 18; // มืด 18:00-06:00
    }
    return false;
  }

  get is_metric_system(): boolean {
    return this.measurement_unit === MeasurementUnit.METRIC;
  }

  get is_thai_language(): boolean {
    return this.language === Language.TH;
  }

  get is_high_privacy(): boolean {
    return this.privacy_level === PrivacyLevel.DETAILED;
  }

  get is_low_privacy(): boolean {
    return this.privacy_level === PrivacyLevel.MINIMAL;
  }

  // Methods
  toggleTheme(): void {
    if (this.theme === Theme.LIGHT) {
      this.theme = Theme.DARK;
    } else if (this.theme === Theme.DARK) {
      this.theme = Theme.AUTO;
    } else {
      this.theme = Theme.LIGHT;
    }
  }

  toggleLanguage(): void {
    this.language = this.language === Language.TH ? Language.EN : Language.TH;
  }

  toggleMeasurementUnit(): void {
    this.measurement_unit =
      this.measurement_unit === MeasurementUnit.METRIC
        ? MeasurementUnit.IMPERIAL
        : MeasurementUnit.METRIC;
  }

  toggleNotificationType(type: 'email' | 'push' | 'sms'): void {
    switch (type) {
      case 'email':
        this.notification_email = !this.notification_email;
        break;
      case 'push':
        this.notification_push = !this.notification_push;
        break;
      case 'sms':
        this.notification_sms = !this.notification_sms;
        break;
    }
  }

  setPrivacyLevel(level: PrivacyLevel): void {
    this.privacy_level = level;
  }

  setTimezone(timezone: string): void {
    this.timezone = timezone;
  }

  // Validation methods
  isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: Language.TH, name: 'ไทย' },
      { code: Language.EN, name: 'English' },
    ];
  }

  getSupportedThemes(): { code: string; name: string }[] {
    return [
      { code: Theme.LIGHT, name: 'สว่าง' },
      { code: Theme.DARK, name: 'มืด' },
      { code: Theme.AUTO, name: 'อัตโนมัติ' },
    ];
  }

  getSupportedMeasurementUnits(): { code: string; name: string }[] {
    return [
      { code: MeasurementUnit.METRIC, name: 'เมตริก (kg, cm)' },
      { code: MeasurementUnit.IMPERIAL, name: 'อิมพีเรียล (lb, in)' },
    ];
  }

  getSupportedPrivacyLevels(): {
    code: string;
    name: string;
    description: string;
  }[] {
    return [
      {
        code: PrivacyLevel.MINIMAL,
        name: 'น้อยที่สุด',
        description: 'เก็บข้อมูลน้อยที่สุดเท่าที่จำเป็น',
      },
      {
        code: PrivacyLevel.STANDARD,
        name: 'มาตรฐาน',
        description: 'เก็บข้อมูลตามมาตรฐานทั่วไป',
      },
      {
        code: PrivacyLevel.DETAILED,
        name: 'ละเอียด',
        description: 'เก็บข้อมูลอย่างละเอียดเพื่อการวิเคราะห์ที่ดีขึ้น',
      },
    ];
  }
}
