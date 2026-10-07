import { supabaseAdmin } from '@/backend/config/supabase';
import { Patient } from '@/backend/types/database.types';

export class PatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const { data, error } = await supabaseAdmin
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    const { data, error } = await supabaseAdmin
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async createPatient(data: Omit<Patient, 'id' | 'created_at'>): Promise<Patient> {
    const sanitized = {
      ...data,
      blood_group: data.blood_group || null,
      phone: data.phone || '',
      address: data.address || '',
    };

    const { data: patient, error } = await supabaseAdmin
      .from('patients')
      .insert(sanitized)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return patient;
  }

  async updateProfile(patientId: string, data: Partial<Patient>): Promise<Patient> {
    const { data: patient, error } = await supabaseAdmin
      .from('patients')
      .update(data)
      .eq('id', patientId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return patient;
  }

  async getPrescriptionsByUserId(userId: string): Promise<any[]> {
    const patient = await this.findByUserId(userId);
    if (!patient) return [];

    const { data, error } = await supabaseAdmin
      .from('prescriptions')
      .select(`
        id, diagnosis, notes, created_at,
        doctors:doctor_id (
          users:user_id ( name )
        ),
        prescription_medicines (
          dosage, frequency, duration, quantity,
          medicines:medicine_id ( name )
        )
      `)
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }
}
