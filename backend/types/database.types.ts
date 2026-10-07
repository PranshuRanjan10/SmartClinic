// Database entity types
export type UserRole = 'patient' | 'doctor' | 'pharmacist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  license_number: string;
  consultation_fee: number;
  working_hours_start: string;
  working_hours_end: string;
  slot_duration: number;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  address: string;
  blood_group?: string;
  created_at: string;
}

export type AppointmentStatus = 'upcoming' | 'live' | 'done' | 'cancelled';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  time_slot: string;
  queue_number: number;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  diagnosis: string;
  notes?: string;
  created_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  description?: string;
  manufacturer: string;
  unit_price: number;
  stock_quantity: number;
  reorder_level: number;
  created_at: string;
}

export interface PrescriptionMedicine {
  id: string;
  prescription_id: string;
  medicine_id: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

export type OrderStatus = 'pending' | 'ready' | 'collected' | 'unavailable';

export interface PharmacyOrder {
  id: string;
  prescription_id: string;
  patient_id: string;
  pharmacist_id?: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'online' | 'counter';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  order_id?: string;
  appointment_id?: string;
  patient_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  stripe_payment_id?: string;
  created_at: string;
}
