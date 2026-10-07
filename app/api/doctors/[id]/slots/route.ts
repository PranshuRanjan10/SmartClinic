import { NextRequest, NextResponse } from 'next/server';
import { DoctorRepository } from '@/backend/modules/doctor/repository/doctor.repository';
import { AppointmentRepository } from '@/backend/modules/appointments/repository/appointment.repository';
import { ApiResponse } from '@/backend/types/api.types';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) {
            throw new Error('date query parameter is required (YYYY-MM-DD)');
        }

        const doctorRepo = new DoctorRepository();
        const appointmentRepo = new AppointmentRepository();

        // Generate all possible slots from doctor's working hours
        const allSlots = await doctorRepo.generateTimeSlots(params.id);

        // Find already-booked slots on that date
        const bookedAppointments = await appointmentRepo.findByDoctorId(params.id, date);
        const bookedSlots = new Set(bookedAppointments.map((a) => a.time_slot));

        // Filter out booked slots
        const availableSlots = allSlots.filter((slot) => !bookedSlots.has(slot));

        const response: ApiResponse = {
            success: true,
            data: availableSlots,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: ApiResponse = {
            success: false,
            error: error.message || 'Failed to fetch time slots',
        };
        return NextResponse.json(response, { status: 400 });
    }
}
