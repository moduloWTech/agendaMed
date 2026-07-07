import { IMedicationRepository } from '../interfaces/medication.interface';
import { IPatientRepository } from '../interfaces/patient.interface';
import { z } from 'zod';
import type { Medication } from '@prisma/client';

export class MedicationUseCase {
  constructor(
    private medicationRepository: IMedicationRepository,
    private patientRepository: IPatientRepository
  ) {}

  async createMedication(data: any): Promise<Medication> {
    const schema = z.object({
      name: z.string().min(2, 'O nome do medicamento deve ter no mínimo 2 caracteres'),
      dosage: z.string().min(1, 'A dosagem é obrigatória'),
      frequency: z.string().min(1, 'A frequência é obrigatória'),
      startDate: z.string().datetime().or(z.date()),
      startTime: z.string().min(4, 'O horário inicial é obrigatório'),
      times: z.array(z.string()).optional(),
      active: z.boolean().optional(),
      patientId: z.string().uuid('ID do paciente (patientId) inválido'),
    });

    const parsedData = schema.parse(data);

    // Regra de Negócio: O paciente precisa existir
    const patientExists = await this.patientRepository.findById(parsedData.patientId);
    if (!patientExists) {
      throw new Error('Paciente associado não encontrado na plataforma.');
    }

    return await this.medicationRepository.create(parsedData);
  }

  async getMedicationById(id: string): Promise<Medication> {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new Error('Medicamento não encontrado.');
    }
    return medication;
  }

  async getMedicationsByPatientId(patientId: string): Promise<Medication[]> {
    return await this.medicationRepository.findByPatientId(patientId);
  }

  async updateMedication(id: string, data: any): Promise<Medication> {
    const schema = z.object({
      name: z.string().min(2).optional(),
      dosage: z.string().min(1).optional(),
      frequency: z.string().min(1).optional(),
      startDate: z.string().datetime().or(z.date()).optional(),
      startTime: z.string().min(4).optional(),
      times: z.array(z.string()).optional(),
      active: z.boolean().optional(),
    });

    const parsedData = schema.parse(data);

    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new Error('Medicamento não encontrado.');
    }

    return await this.medicationRepository.update(id, parsedData);
  }

  async deleteMedication(id: string): Promise<void> {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new Error('Medicamento não encontrado.');
    }

    await this.medicationRepository.delete(id);
  }
}
