import { NextRequest, NextResponse } from 'next/server';
import { PharmacyService } from '@/backend/modules/pharmacy/services/pharmacy.service';
import { PatientRepository } from '@/backend/modules/patient/repository/patient.repository';
import { CreatePharmacyOrderRequest, ApiResponse } from '@/backend/types/api.types';
import { PharmacyOrder } from '@/backend/types/database.types';

export async function POST(request: NextRequest) {
  try {
    const body: CreatePharmacyOrderRequest = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    const patientRepo = new PatientRepository();
    const patient = await patientRepo.findByUserId(userId);
    if (!patient) throw new Error('Patient profile not found');

    const pharmacyService = new PharmacyService();
    const order = await pharmacyService.createOrder(body.prescription_id, patient.id);

    const response: ApiResponse = {
      success: true,
      data: order,
      message: 'Order created successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to create order',
    };
    return NextResponse.json(response, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const userId = request.headers.get('x-user-id');

    const pharmacyService = new PharmacyService();
    let orders: PharmacyOrder[] = [];

    if (userId) {
      // Patient fetching their own orders
      const patientRepo = new PatientRepository();
      const patient = await patientRepo.findByUserId(userId);
      if (patient) {
        const allOrders = await pharmacyService.getOrdersByPatient(patient.id);
        orders = status ? allOrders.filter((o) => o.status === status) : allOrders;
      }
    } else if (status) {
      // Pharmacist fetching all orders by status (no auth header)
      orders = await pharmacyService.getOrdersByStatus(status);
    }

    const response: ApiResponse = {
      success: true,
      data: orders,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch orders',
    };
    return NextResponse.json(response, { status: 400 });
  }
}
