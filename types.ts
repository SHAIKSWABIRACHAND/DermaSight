export type Role = 'patient' | 'doctor';
export type Theme = 'light' | 'dark' | 'system';

export interface User {
  name: string;
  email: string;
  role: Role;
  licenseNumber?: string; // For doctors
  dateOfBirth?: string; // For patients
}

export interface DiseasePrediction {
  disease: string;
  probability: string;
  severity: 'low' | 'moderate' | 'high';
  co_morbidity_flag: boolean;
  explanation: string;
}

export interface PatientDashboardData {
  name: string;
  disease_predictions: DiseasePrediction[];
  most_likely_disease: string;
  recommendation: 'consult specialist' | 'monitor at home' | 'self-care';
  doctor_message: string;
  image_quality_feedback: 'good' | 'poor lighting' | 'blurry' | 'needs retake';
}

export interface DoctorDashboardData {
  case_id: string;
  summary: string;
  risk_score: string;
  priority_flag: 'low' | 'medium' | 'high';
  patient_alert: string;
  clinical_notes: string;
  action_suggestion: 'review required' | 'auto-clear' | 'high risk - immediate consult' | 'review optional';
}

export interface DermaSightResponse {
  patient_dashboard: PatientDashboardData;
  doctor_dashboard: DoctorDashboardData;
  warning?: string;
  timestamp?: string;
  imagePreviewUrl?: string;
  userEmail?: string;
  isManuallyFlagged?: boolean;
}

export interface Message {
  sender: Role;
  text: string;
  timestamp: string;
}