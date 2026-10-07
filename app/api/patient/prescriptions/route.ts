import { NextRequest, NextResponse } from 'next/server';
import { PatientRepository } from '@/backend/modules/patient/repository/patient.repository';
import { ApiResponse } from '@/backend/types/api.types';

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' } as ApiResponse,
                { status: 401 }
            );
        }

        const patientRepo = new PatientRepository();
        const prescriptions = await patientRepo.getPrescriptionsByUserId(userId);

        const response: ApiResponse = {
            success: true,
            data: prescriptions,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: ApiResponse = {
            success: false,
            error: error.message || 'Failed to fetch prescriptions',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
