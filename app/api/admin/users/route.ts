import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/backend/modules/admin/services/admin.service';
import { ApiResponse } from '@/backend/types/api.types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.email || !body.password || !body.role) {
            return NextResponse.json(
                { success: false, error: 'Missing required user fields' } as ApiResponse,
                { status: 400 }
            );
        }

        if (body.role === 'doctor') {
            if (!body.specialization || !body.license_number || !body.consultation_fee || !body.working_hours_start || !body.working_hours_end || !body.slot_duration) {
                return NextResponse.json(
                    { success: false, error: 'Missing required doctor profile fields' } as ApiResponse,
                    { status: 400 }
                );
            }
        }

        const adminService = new AdminService();
        const newUser = await adminService.provisionStaff(body);

        const response: ApiResponse = {
            success: true,
            data: newUser,
            message: `${body.role.charAt(0).toUpperCase() + body.role.slice(1)} provisioned successfully.`
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
        const response: ApiResponse = {
            success: false,
            error: error.message || 'Failed to provision staff',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
