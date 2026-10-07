import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/modules/auth/services/auth.service';
import { PatientRepository } from '@/backend/modules/patient/repository/patient.repository';
import { RegisterRequest, ApiResponse } from '@/backend/types/api.types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const authService = new AuthService();
    const result = await authService.register(body);

    // Auto-create patient profile for patient role
    if (body.role === 'patient') {
      const patientRepo = new PatientRepository();
      const existing = await patientRepo.findByUserId(result.user.id);
      if (!existing) {
        await patientRepo.createPatient({
          user_id: result.user.id,
          date_of_birth: '2000-01-01',
          gender: 'other',
          phone: '',
          address: '',
          blood_group: '',
        });
      }
    }

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Registration successful',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Registration failed',
    };
    return NextResponse.json(response, { status: 400 });
  }
}
