import { PharmacyRepository } from '../repository/pharmacy.repository';
import { MedicineRepository } from '../repository/medicine.repository';
import { PharmacyOrder, OrderStatus } from '@/backend/types/database.types';

export class PharmacyService {
  private pharmacyRepository: PharmacyRepository;
  private medicineRepository: MedicineRepository;

  constructor() {
    this.pharmacyRepository = new PharmacyRepository();
    this.medicineRepository = new MedicineRepository();
  }

  async createOrder(prescriptionId: string, patientId: string): Promise<PharmacyOrder> {
    // Check medicine availability
    const medicines = await this.pharmacyRepository.getPrescriptionMedicines(prescriptionId);

    let totalAmount = 0;
    let allAvailable = true;

    for (const med of medicines) {
      const medicine = await this.medicineRepository.findById(med.medicine_id);
      if (!medicine || medicine.stock_quantity < med.quantity) {
        allAvailable = false;
        break;
      }
      totalAmount += medicine.unit_price * med.quantity;
    }

    const order = await this.pharmacyRepository.createOrder({
      prescription_id: prescriptionId,
      patient_id: patientId,
      total_amount: totalAmount,
      status: allAvailable ? 'pending' : 'unavailable',
    });

    return order;
  }

  async createWalkInOrder(medicines: { medicine_id: string, quantity: number }[], pharmacistId: string): Promise<PharmacyOrder> {
    let totalAmount = 0;

    // Check stock and calculate total amount
    for (const med of medicines) {
      const medicine = await this.medicineRepository.findById(med.medicine_id);
      if (!medicine) {
        throw new Error(`Medicine with ID ${med.medicine_id} not found`);
      }
      if (medicine.stock_quantity < med.quantity) {
        throw new Error(`Insufficient stock for ${medicine.name}. Available: ${medicine.stock_quantity}`);
      }
      totalAmount += medicine.unit_price * med.quantity;
    }

    // Create walk-in prescription dummy record
    const pres = await this.pharmacyRepository.createWalkInPrescription();

    // Attach medicines to that dummy prescription
    await this.pharmacyRepository.addMedicinesToPrescription(pres.id, medicines);

    // Create the final order
    const order = await this.pharmacyRepository.createOrder({
      prescription_id: pres.id,
      patient_id: undefined, // No patient for walk-in guest
      pharmacist_id: pharmacistId,
      total_amount: totalAmount,
      status: 'collected', // Walk-ins are immediate cash-and-carry
    });

    // Reduce stock
    for (const med of medicines) {
      const medicine = await this.medicineRepository.findById(med.medicine_id);
      if (medicine) {
        await this.medicineRepository.updateStock(medicine.id, medicine.stock_quantity - med.quantity);
      }
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, pharmacistId?: string): Promise<PharmacyOrder> {
    return this.pharmacyRepository.updateOrderStatus(orderId, status, pharmacistId);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<PharmacyOrder[]> {
    return this.pharmacyRepository.findByStatus(status);
  }

  async getOrdersByPatient(patientId: string): Promise<PharmacyOrder[]> {
    return this.pharmacyRepository.findByPatientId(patientId);
  }
}
