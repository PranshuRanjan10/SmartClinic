import { NextRequest, NextResponse } from 'next/server';
import { AppointmentService } from '@/backend/modules/appointments/services/appointment.service';
import { DoctorRepository } from '@/backend/modules/doctor/repository/doctor.repository';
import { ApiResponse } from '@/backend/types/api.types';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) throw new Error('Unauthorized — please log in');

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;

    // Look up doctor profile from user ID
    const doctorRepo = new DoctorRepository();
    const doctor = await doctorRepo.findByUserId(userId);
    if (!doctor) throw new Error('Doctor profile not found');

    const appointmentService = new AppointmentService();
    const appointments = await appointmentService.getDoctorAppointments(doctor.id, date);

    const response: ApiResponse = {
      success: true,
      data: appointments,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch appointments',
    };
    return NextResponse.json(response, { status: 400 });
  }
}
