import { supabaseAdmin } from '@/backend/config/supabase';
import { Payment } from '@/backend/types/database.types';

export class PaymentRepository {
  async createPayment(data: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return payment;
  }

  async updatePaymentStatus(paymentId: string, status: string, stripePaymentId?: string): Promise<Payment> {
    const updateData: any = { payment_status: status };
    if (stripePaymentId) updateData.stripe_payment_id = stripePaymentId;

    const { data, error } = await supabaseAdmin
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findByPatientId(patientId: string): Promise<Payment[]> {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getTotalRevenue(): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('amount')
      .eq('payment_status', 'completed');

    if (error) throw new Error(error.message);
    return data.reduce((sum, payment) => sum + payment.amount, 0);
  }
}
