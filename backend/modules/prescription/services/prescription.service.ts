import { PrescriptionRepository } from '../repository/prescription.repository';
import { CreatePrescriptionRequest } from '@/backend/types/api.types';
import { Prescription } from '@/backend/types/database.types';

export class PrescriptionService {
  private prescriptionRepository: PrescriptionRepository;

  constructor() {
    this.prescriptionRepository = new PrescriptionRepository();
  }

  async createPrescription(
    doctorId: string,
    patientId: string,
    data: CreatePrescriptionRequest
  ): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.createPrescription({
      appointment_id: data.appointment_id,
      doctor_id: doctorId,
      patient_id: patientId,
      diagnosis: data.diagnosis,
      notes: data.notes,
    });

    const medicines = data.medicines.map((med) => ({
      prescription_id: prescription.id,
      medicine_id: med.medicine_id,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      quantity: med.quantity,
    }));

    await this.prescriptionRepository.addMedicines(medicines);

    return prescription;
  }

  async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    return this.prescriptionRepository.findByPatientId(patientId);
  }
}
