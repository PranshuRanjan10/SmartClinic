import { supabaseAdmin } from '@/backend/config/supabase';
import { Appointment } from '@/backend/types/database.types';

export class AppointmentRepository {
  async createAppointment(data: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> {
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return appointment;
  }

  async isSlotAvailable(doctorId: string, date: string, timeSlot: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .eq('time_slot', timeSlot)
      .neq('status', 'cancelled');

    if (error) throw new Error(error.message);
    return data.length === 0;
  }

  async getNextQueueNumber(doctorId: string, date: string): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('queue_number')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .order('queue_number', { ascending: false })
      .limit(1);

    if (error) throw new Error(error.message);
    return data.length > 0 ? data[0].queue_number + 1 : 1;
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findByDoctorId(doctorId: string, date?: string): Promise<Appointment[]> {
    let query = supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId);

    if (date) {
      query = query.eq('appointment_date', date);
    }

    const { data, error } = await query.order('time_slot', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async updateStatus(appointmentId: string, status: string): Promise<Appointment> {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
