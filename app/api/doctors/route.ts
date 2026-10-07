import { NextRequest, NextResponse } from 'next/server';
import { DoctorRepository } from '@/backend/modules/doctor/repository/doctor.repository';
import { supabaseAdmin } from '@/backend/config/supabase';
import { ApiResponse } from '@/backend/types/api.types';

export async function GET(request: NextRequest) {
    try {
        // Fetch all doctors joined with their user info (name, email)
        const { data, error } = await supabaseAdmin
            .from('doctors')
            .select(`
        id,
        specialization,
        consultation_fee,
        working_hours_start,
        working_hours_end,
        slot_duration,
        users!doctors_user_id_fkey (
          id,
          name,
          email
        )
      `);

        if (error) throw new Error(error.message);

        const response: ApiResponse = {
            success: true,
            data: data ?? [],
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: ApiResponse = {
            success: false,
            error: error.message || 'Failed to fetch doctors',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
