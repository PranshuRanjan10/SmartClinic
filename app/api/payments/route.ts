import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/backend/modules/payments/services/payment.service';
import { PatientRepository } from '@/backend/modules/patient/repository/patient.repository';
import { CreatePaymentRequest, ApiResponse } from '@/backend/types/api.types';

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentRequest = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — please log in' } as ApiResponse,
        { status: 401 }
      );
    }

    // Look up patient profile from user ID
    const patientRepo = new PatientRepository();
    const patient = await patientRepo.findByUserId(userId);
    if (!patient) {
      throw new Error('Patient profile not found');
    }

    const paymentService = new PaymentService();
    const payment = await paymentService.createPayment(patient.id, body);

    let clientSecret: string | null = null;
    if (body.payment_method === 'online') {
      const paymentIntent = await paymentService.createStripePaymentIntent(
        body.amount,
        payment.id
      );
      clientSecret = paymentIntent.client_secret;
    }

    const response: ApiResponse = {
      success: true,
      data: { payment, clientSecret },
      message: 'Payment initiated',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Payment failed',
    };
    return NextResponse.json(response, { status: 400 });
  }
}
