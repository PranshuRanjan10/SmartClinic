import { NextRequest, NextResponse } from 'next/server';
import { AppointmentService } from '@/backend/modules/appointments/services/appointment.service';
import { ApiResponse } from '@/backend/types/api.types';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' } as ApiResponse,
                { status: 401 }
            );
        }

        const body = await request.json();
        const { status } = body;

        if (!status) {
            throw new Error('Status is required');
        }

        const appointmentService = new AppointmentService();
        const appointment = await appointmentService.updateAppointmentStatus(params.id, status);

        const response: ApiResponse = {
            success: true,
            data: appointment,
            message: 'Appointment status updated',
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: ApiResponse = {
            success: false,
            error: error.message || 'Failed to update appointment',
        };
        return NextResponse.json(response, { status: 400 });
    }
}
