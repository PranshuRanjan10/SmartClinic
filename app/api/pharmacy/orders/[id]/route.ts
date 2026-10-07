import { NextRequest, NextResponse } from 'next/server';
import { PharmacyService } from '@/backend/modules/pharmacy/services/pharmacy.service';
import { ApiResponse } from '@/backend/types/api.types';
import { OrderStatus } from '@/backend/types/database.types';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { status, pharmacistId } = body;

        if (!status) {
            throw new Error('Status is required');
        }

        const pharmacyService = new PharmacyService();
        const order = await pharmacyService.updateOrderStatus(
            params.id,
            status as OrderStatus,
            pharmacistId
        );

        const response: ApiResponse = {
            success: true,
            data: order,
            message: 'Order status updated',
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: ApiResponse = {
            success: false,
            error: error.message || 'Failed to update order',
        };
        return NextResponse.json(response, { status: 400 });
    }
}
