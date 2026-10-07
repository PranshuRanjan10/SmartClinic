import { NextRequest, NextResponse } from 'next/server';
import { MedicineRepository } from '@/backend/modules/pharmacy/repository/medicine.repository';
import { ApiResponse } from '@/backend/types/api.types';

export async function GET(request: NextRequest) {
    try {
        const medicineRepo = new MedicineRepository();
        const medicines = await medicineRepo.findAll();

        const response: ApiResponse = {
            success: true,
            data: medicines,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: ApiResponse = {
            success: false,
            error: error.message || 'Failed to fetch medicines',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
