import { NextRequest, NextResponse } from 'next/server';
import { PharmacyService } from '@/backend/modules/pharmacy/services/pharmacy.service';
import { ApiResponse } from '@/backend/types/api.types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { medicines } = body;
        const userId = request.headers.get('x-user-id');

        if (!userId || userId === 'pharmacist') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized — valid pharmacist session required' } as ApiResponse,
                { status: 401 }
            );
        }

        if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
            throw new Error('Medicines array is required and cannot be empty');
        }

        const pharmacyService = new PharmacyService();
        const order = await pharmacyService.createWalkInOrder(medicines, userId);

        const response: ApiResponse = {
            success: true,
            data: order,
            message: 'Walk-in order created successfully',
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: ApiResponse = {
            success: false,
            error: error.message || 'Failed to create walk-in order',
        };
        return NextResponse.json(response, { status: 400 });
    }
}
