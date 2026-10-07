import { supabaseAdmin } from '@/backend/config/supabase';
import { PaymentRepository } from '../../payments/repository/payment.repository';

export class AdminService {
  private paymentRepository: PaymentRepository;

  constructor() {
    this.paymentRepository = new PaymentRepository();
  }

  async getDashboardStats() {
    const [appointmentsCount, doctorsCount, totalRevenue] = await Promise.all([
      this.getTotalAppointments(),
      this.getTotalDoctors(),
      this.paymentRepository.getTotalRevenue(),
    ]);

    return {
      totalAppointments: appointmentsCount,
      totalDoctors: doctorsCount,
      totalRevenue,
    };
  }

  private async getTotalAppointments(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    if (error) throw new Error(error.message);
    return count || 0;
  }

  private async getTotalDoctors(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('doctors')
      .select('*', { count: 'exact', head: true });

    if (error) throw new Error(error.message);
    return count || 0;
  }

  async provisionStaff(payload: any) {
    // 1. Create User
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        name: payload.name,
        email: payload.email,
        password: payload.password, // Ideally hashed, but maintaining mock behavior for demo
        role: payload.role,
      })
      .select()
      .single();

    if (userError) throw new Error(`User Creation Failed: ${userError.message}`);

    // 2. If doctor, create Doctor profile
    if (payload.role === 'doctor') {
      const { error: doctorError } = await supabaseAdmin
        .from('doctors')
        .insert({
          user_id: user.id,
          specialization: payload.specialization,
          license_number: payload.license_number,
          consultation_fee: payload.consultation_fee,
          working_hours_start: payload.working_hours_start,
          working_hours_end: payload.working_hours_end,
          slot_duration: payload.slot_duration,
        });

      if (doctorError) {
        // Rollback user if doctor creation fails
        await supabaseAdmin.from('users').delete().eq('id', user.id);
        throw new Error(`Doctor Profile Creation Failed: ${doctorError.message}`);
      }
    }

    return user;
  }

  async getAllUsersDirectory() {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, 
        name, 
        email, 
        role, 
        created_at,
        doctors (
          specialization,
          license_number
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Transform data to flatten the doctor info
    return users.map(user => {
      const mappedUser: any = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      };
      if (user.role === 'doctor' && user.doctors && user.doctors.length > 0) {
        mappedUser.specialization = user.doctors[0].specialization;
        mappedUser.license_number = user.doctors[0].license_number;
      }
      return mappedUser;
    });
  }
}
