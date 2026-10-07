import { supabaseAdmin } from '@/backend/config/supabase';
import { Doctor } from '@/backend/types/database.types';

export class DoctorRepository {
  async findById(id: string): Promise<Doctor | null> {
    const { data, error } = await supabaseAdmin
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async findByUserId(userId: string): Promise<Doctor | null> {
    const { data, error } = await supabaseAdmin
      .from('doctors')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async findAll(): Promise<Doctor[]> {
    const { data, error } = await supabaseAdmin
      .from('doctors')
      .select('*');

    if (error) throw new Error(error.message);
    return data;
  }

  async generateTimeSlots(doctorId: string): Promise<string[]> {
    const doctor = await this.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const slots: string[] = [];
    const start = this.parseTime(doctor.working_hours_start);
    const end = this.parseTime(doctor.working_hours_end);
    const duration = doctor.slot_duration;

    let current = start;
    while (current < end) {
      slots.push(this.formatTime(current));
      current += duration;
    }

    return slots;
  }

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
