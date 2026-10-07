import { supabaseAdmin } from '@/backend/config/supabase';
import { Prescription, PrescriptionMedicine } from '@/backend/types/database.types';

export class PrescriptionRepository {
  async createPrescription(data: Omit<Prescription, 'id' | 'created_at'>): Promise<Prescription> {
    const { data: prescription, error } = await supabaseAdmin
      .from('prescriptions')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return prescription;
  }

  async addMedicines(medicines: Omit<PrescriptionMedicine, 'id'>[]): Promise<void> {
    const { error } = await supabaseAdmin
      .from('prescription_medicines')
      .insert(medicines);

    if (error) throw new Error(error.message);
  }

  async findByPatientId(patientId: string): Promise<Prescription[]> {
    const { data, error } = await supabaseAdmin
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findById(id: string): Promise<Prescription | null> {
    const { data, error } = await supabaseAdmin
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }
}
