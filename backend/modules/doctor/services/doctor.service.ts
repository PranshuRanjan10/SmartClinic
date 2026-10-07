import { DoctorRepository } from '../repository/doctor.repository';
import { Doctor } from '@/backend/types/database.types';

export class DoctorService {
  private doctorRepository: DoctorRepository;

  constructor() {
    this.doctorRepository = new DoctorRepository();
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    return this.doctorRepository.findById(id);
  }

  async getDoctorByUserId(userId: string): Promise<Doctor | null> {
    return this.doctorRepository.findByUserId(userId);
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return this.doctorRepository.findAll();
  }

  async getAvailableTimeSlots(doctorId: string): Promise<string[]> {
    return this.doctorRepository.generateTimeSlots(doctorId);
  }
}
