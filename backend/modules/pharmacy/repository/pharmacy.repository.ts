import { supabaseAdmin } from '@/backend/config/supabase';
import { PharmacyOrder, PrescriptionMedicine, OrderStatus } from '@/backend/types/database.types';

export class PharmacyRepository {
  async createOrder(data: Partial<PharmacyOrder>): Promise<PharmacyOrder> {
    const { data: order, error } = await supabaseAdmin
      .from('pharmacy_orders')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, pharmacistId?: string): Promise<PharmacyOrder> {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (pharmacistId) updateData.pharmacist_id = pharmacistId;

    const { data, error } = await supabaseAdmin
      .from('pharmacy_orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findByStatus(status: OrderStatus): Promise<PharmacyOrder[]> {
    const { data, error } = await supabaseAdmin
      .from('pharmacy_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findByPatientId(patientId: string): Promise<PharmacyOrder[]> {
    const { data, error } = await supabaseAdmin
      .from('pharmacy_orders')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getPrescriptionMedicines(prescriptionId: string): Promise<PrescriptionMedicine[]> {
    const { data, error } = await supabaseAdmin
      .from('prescription_medicines')
      .select('*')
      .eq('prescription_id', prescriptionId);

    if (error) throw new Error(error.message);
    return data;
  }

  async createWalkInPrescription(): Promise<{ id: string }> {
    const { data, error } = await supabaseAdmin
      .from('prescriptions')
      .insert({ diagnosis: 'Walk-in OTC Sales' })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async addMedicinesToPrescription(
    prescriptionId: string,
    medicines: { medicine_id: string, quantity: number }[]
  ): Promise<void> {
    const items = medicines.map(m => ({
      prescription_id: prescriptionId,
      medicine_id: m.medicine_id,
      quantity: m.quantity,
      dosage: 'N/A',
      frequency: 'N/A',
      duration: 'N/A'
    }));

    const { error } = await supabaseAdmin
      .from('prescription_medicines')
      .insert(items);

    if (error) throw new Error(error.message);
  }
}
