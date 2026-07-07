import type { Patient } from '@prisma/client';

export interface IPatientCreate {
  name: string;
  birthDate?: Date | string;
  userId: string; // ID do Cuidador/Familiar associado
}

export interface IPatientUpdate {
  name?: string;
  birthDate?: Date | string;
}

export interface IPatientRepository {
  create(data: IPatientCreate): Promise<Patient>;
  findById(id: string): Promise<Patient | null>;
  findByUserId(userId: string): Promise<Patient[]>;
  update(id: string, data: IPatientUpdate): Promise<Patient>;
  delete(id: string): Promise<void>;
}
