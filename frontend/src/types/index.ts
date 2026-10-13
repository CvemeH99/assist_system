export interface Patient {
  id: number
  name: string
  age: number
  gender: string
  diabetes_type: string
  diagnosis_date: string | null
  height: number | null
  weight: number | null
  phone: string | null
  bmi?: number
  bmi_status?: string
  created_at: string
  updated_at?: string
}

export interface BloodSugar {
  id: number
  patient_id: number
  value: number
  measure_type: string
  measured_at: string
  note?: string | null
  status?: string
}

export interface BloodSugarStats {
  period_days?: number
  record_count?: number
  avg: number
  min: number
  max: number
  std: number
  count: number
  high_count: number
  low_count: number
  normal_count: number
  time_in_range: number
  trend?: string
  risk_level?: string
  error?: string
}

export interface DietRecord {
  id: number
  patient_id: number
  food_name: string
  calories: number | null
  carbs: number | null
  protein: number | null
  fat: number | null
  gi_value: number | null
  gi_level?: string
  portion: number | null
  meal_type: string | null
  eaten_at: string
}

export interface DailyNutritionRecord {
  name: string
  calories: number | null
  meal: string | null
}

export interface DailyNutrition {
  date: string
  meal_count: number
  total_calories: number
  total_protein: number
  total_fat: number
  total_carbs: number
  avg_gi: number
  calorie_status: string
  carb_status: string
  records: DailyNutritionRecord[]
}

export interface DietRecommendation {
  name?: string
  food_name?: string
  calories?: number
  carbs?: number
  protein?: number
  fat?: number
  gi?: number
  gi_value?: number
  meal?: string
  tip?: string
  [key: string]: unknown
}

export interface Medication {
  id: number
  patient_id: number
  drug_name: string
  drug_type: string | null
  dosage: string
  frequency: string | null
  timing: string | null
  start_date: string
  is_active: boolean
}

export interface Exercise {
  id: number
  patient_id: number
  exercise_type: string
  duration_min: number
  intensity: string
  calories_burned: number | null
  performed_at: string
  blood_sugar_before?: number | null
  blood_sugar_after?: number | null
  bs_change?: number
  note?: string | null
}

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface HealthReport {
  id: number
  patient: number
  report_type: string
  period_start: string
  period_end: string
  avg_blood_sugar: number | null
  blood_sugar_std?: number | null
  time_in_range: number | null
  summary: string
  recommendations: string | null
  risk_level: string | null
  generated_at: string
}
