export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ProfileUpdateDto {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  activity_level?: string;
  health_data?: any;
  health_goals?: any;
  nutrition_goals?: any;
  daily_behavior?: any;
  medical_history?: any;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  activity_level?: string;
  health_data?: any;
  health_goals?: any;
  nutrition_goals?: any;
  daily_behavior?: any;
  medical_history?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}
