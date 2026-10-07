import { NextRequest, NextResponse } from 'next/server';
import { AppointmentService } from '@/backend/modules/appointments/services/appointment.service';
import { PatientRepository } from '@/backend/modules/patient/repository/patient.repository';
import { CreateAppointmentRequest, ApiResponse } from '@/backend/types/api.types';

async function getPatientId(request: NextRequest): Promise<string> {
  const userId = request.headers.get('x-user-id');
  if (!userId) throw new Error('Unauthorized — please log in');

  const patientRepo = new PatientRepository();
  const patient = await patientRepo.findByUserId(userId);
  if (!patient) throw new Error('Patient profile not found. Please complete your profile setup.');

  return patient.id;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAppointmentRequest = await request.json();
    const patientId = await getPatientId(request);

    const appointmentService = new AppointmentService();
    const appointment = await appointmentService.createAppointment(patientId, body);

    const response: ApiResponse = {
      success: true,
      data: appointment,
      message: 'Appointment booked successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to create appointment',
    };
    return NextResponse.json(response, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const patientId = await getPatientId(request);

    const appointmentService = new AppointmentService();
    const appointments = await appointmentService.getPatientAppointments(patientId);

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
