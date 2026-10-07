import { stripe } from '@/backend/config/stripe';
import { PaymentRepository } from '../repository/payment.repository';
import { CreatePaymentRequest } from '@/backend/types/api.types';
import { Payment } from '@/backend/types/database.types';

export class PaymentService {
  private paymentRepository: PaymentRepository;

  constructor() {
    this.paymentRepository = new PaymentRepository();
  }

  async createPayment(patientId: string, data: CreatePaymentRequest): Promise<Payment> {
    const payment = await this.paymentRepository.createPayment({
      patient_id: patientId,
      order_id: data.order_id,
      appointment_id: data.appointment_id,
      amount: data.amount,
      payment_method: data.payment_method,
      payment_status: data.payment_method === 'counter' ? 'completed' : 'pending',
    });

    return payment;
  }

  async createStripePaymentIntent(amount: number, paymentId: string) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { payment_id: paymentId },
    });

    return paymentIntent;
  }

  async confirmPayment(paymentId: string, stripePaymentId: string): Promise<Payment> {
    return this.paymentRepository.updatePaymentStatus(paymentId, 'completed', stripePaymentId);
  }

  async getPatientPayments(patientId: string): Promise<Payment[]> {
    return this.paymentRepository.findByPatientId(patientId);
  }

  async getTotalRevenue(): Promise<number> {
    return this.paymentRepository.getTotalRevenue();
  }
}
