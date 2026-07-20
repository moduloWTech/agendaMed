import type { Patient, User } from '../generated/prisma/client';

export interface IPatientCreate {
  name: string;
  birthDate?: Date | string;
  userId: string; // ID do Cuidador/Familiar associado
  tenantId: string;
}

export interface IPatientUpdate {
  name?: string;
  birthDate?: Date | string;
}

export interface IPatientRepository {
  create(data: IPatientCreate): Promise<Patient>;
  findById(id: string, tenantId: string): Promise<(Patient & { users?: User[] }) | null>;
  findByTenantId(tenantId: string): Promise<Patient[]>;
  update(id: string, tenantId: string, data: IPatientUpdate): Promise<Patient>;
  delete(id: string, tenantId: string): Promise<void>;
}
