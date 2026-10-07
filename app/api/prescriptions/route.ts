import { NextRequest, NextResponse } from 'next/server';
import { PrescriptionService } from '@/backend/modules/prescription/services/prescription.service';
import { DoctorRepository } from '@/backend/modules/doctor/repository/doctor.repository';
import { CreatePrescriptionRequest, ApiResponse } from '@/backend/types/api.types';

export async function POST(request: NextRequest) {
  try {
    const body: CreatePrescriptionRequest = await request.json();
    const userId = request.headers.get('x-user-id');
    const patientId = body.patient_id; // Read patient_id from the JSON payload now

    if (!userId || !patientId) {
      throw new Error('Unauthorized or Missing Patient ID');
    }

    // Securely look up the authentic doctor ID for this session
    const doctorRepo = new DoctorRepository();
    const doctor = await doctorRepo.findByUserId(userId);

    if (!doctor) {
      throw new Error('Doctor profile not found for this user');
    }

    const prescriptionService = new PrescriptionService();
    // Use the secure doctor.id, not a header
    const prescription = await prescriptionService.createPrescription(
      doctor.id,
      patientId,
      body
    );

    const response: ApiResponse = {
      success: true,
      data: prescription,
      message: 'Prescription created successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to create prescription',
    };
    return NextResponse.json(response, { status: 400 });
  }
}
