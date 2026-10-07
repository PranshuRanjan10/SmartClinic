import { supabaseAdmin } from '@/backend/config/supabase';
import { Medicine } from '@/backend/types/database.types';

export class MedicineRepository {
  async findById(id: string): Promise<Medicine | null> {
    const { data, error } = await supabaseAdmin
      .from('medicines')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async findAll(): Promise<Medicine[]> {
    const { data, error } = await supabaseAdmin
      .from('medicines')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async updateStock(medicineId: string, quantity: number): Promise<Medicine> {
    const { data, error } = await supabaseAdmin
      .from('medicines')
      .update({ stock_quantity: quantity })
      .eq('id', medicineId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
