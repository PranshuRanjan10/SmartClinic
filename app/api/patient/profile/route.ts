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
        const patient = await patientRepo.findByUserId(userId);

        const response: ApiResponse = {
            success: true,
            data: patient,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: ApiResponse = {
            success: false,
            error: error.message || 'Failed to fetch patient profile',
        };
        return NextResponse.json(response, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' } as ApiResponse,
                { status: 401 }
            );
        }

        const body = await request.json();
        const patientRepo = new PatientRepository();

        // First find the existing patient to get their ID
        const patient = await patientRepo.findByUserId(userId);
        if (!patient) {
            return NextResponse.json(
                { success: false, error: 'Patient profile not found' } as ApiResponse,
                { status: 404 }
            );
        }

        // Only allow updating safe fields
        const updateData = {
            date_of_birth: body.date_of_birth,
            gender: body.gender,
            phone: body.phone,
            address: body.address,
            blood_group: body.blood_group,
        };

        // Remove undefined items
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));

        const updatedProfile = await patientRepo.updateProfile(patient.id, cleanData);

        const response: ApiResponse = {
            success: true,
            data: updatedProfile,
            message: 'Profile updated successfully'
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: ApiResponse = {
            success: false,
            error: error.message || 'Failed to update patient profile',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
