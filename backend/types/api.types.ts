// API request/response types
import { UserRole, AppointmentStatus, OrderStatus, PaymentMethod } from './database.types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  token?: string;
}

export interface CreateAppointmentRequest {
  doctor_id: string;
  appointment_date: string;
  time_slot: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  status?: AppointmentStatus;
  notes?: string;
}

export interface CreatePrescriptionRequest {
  appointment_id: string;
  patient_id: string;
  diagnosis: string;
  medicines: {
    medicine_id: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }[];
  notes?: string;
}

export interface CreatePharmacyOrderRequest {
  prescription_id: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface CreatePaymentRequest {
  order_id?: string;
  appointment_id?: string;
  amount: number;
  payment_method: PaymentMethod;
}
