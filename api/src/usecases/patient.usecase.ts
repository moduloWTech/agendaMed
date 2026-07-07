import { IPatientRepository } from '../interfaces/patient.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { z } from 'zod';
import type { Patient } from '@prisma/client';

export class PatientUseCase {
  constructor(
    private patientRepository: IPatientRepository,
    private userRepository: IUserRepository // Injetado para validar a existência do Cuidador
  ) {}

  async createPatient(data: any): Promise<Patient> {
    const schema = z.object({
      name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
      birthDate: z.string().datetime().optional().or(z.date().optional()),
      userId: z.string().uuid('ID do cuidador (userId) inválido'),
    });

    const parsedData = schema.parse(data);

    // Validação de Regra de Negócio: O cuidador precisa existir
    const userExists = await this.userRepository.findById(parsedData.userId);
    if (!userExists) {
      throw new Error('Cuidador (User) associado não encontrado na plataforma.');
    }

    return await this.patientRepository.create(parsedData);
  }

  async getPatientById(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new Error('Paciente não encontrado.');
    }
    return patient;
  }

  async getPatientsByUserId(userId: string): Promise<Patient[]> {
    return await this.patientRepository.findByUserId(userId);
  }

  async updatePatient(id: string, data: any): Promise<Patient> {
    const schema = z.object({
      name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').optional(),
      birthDate: z.string().datetime().optional().or(z.date().optional()),
    });

    const parsedData = schema.parse(data);

    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new Error('Paciente não encontrado.');
    }

    return await this.patientRepository.update(id, parsedData);
  }

  async deletePatient(id: string): Promise<void> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new Error('Paciente não encontrado.');
    }

    await this.patientRepository.delete(id);
  }
}
