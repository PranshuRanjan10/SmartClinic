import { AppointmentRepository } from '../repository/appointment.repository';
import { CreateAppointmentRequest } from '@/backend/types/api.types';
import { Appointment } from '@/backend/types/database.types';

export class AppointmentService {
  private appointmentRepository: AppointmentRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
  }

  async createAppointment(patientId: string, data: CreateAppointmentRequest): Promise<Appointment> {
    // Check if slot is available
    const isAvailable = await this.appointmentRepository.isSlotAvailable(
      data.doctor_id,
      data.appointment_date,
      data.time_slot
    );

    if (!isAvailable) {
      throw new Error('Time slot is not available');
    }

    // Get queue number for the day
    const queueNumber = await this.appointmentRepository.getNextQueueNumber(
      data.doctor_id,
      data.appointment_date
    );

    const appointment = await this.appointmentRepository.createAppointment({
      patient_id: patientId,
      doctor_id: data.doctor_id,
      appointment_date: data.appointment_date,
      time_slot: data.time_slot,
      queue_number: queueNumber,
      status: 'upcoming',
      notes: data.notes,
    });

    return appointment;
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findByPatientId(patientId);
  }

  async getDoctorAppointments(doctorId: string, date?: string): Promise<Appointment[]> {
    return this.appointmentRepository.findByDoctorId(doctorId, date);
  }

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<Appointment> {
    return this.appointmentRepository.updateStatus(appointmentId, status);
  }
}
