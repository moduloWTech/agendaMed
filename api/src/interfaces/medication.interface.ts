import type { Medication } from '../generated/prisma/client';

export interface IMedicationCreate {
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date | string;
  startTime: string;
  times?: string[];
  active?: boolean;
  patientId: string;
}

export interface IMedicationUpdate {
  name?: string;
  dosage?: string;
  frequency?: string;
  startDate?: Date | string;
  startTime?: string;
  times?: string[];
  active?: boolean;
}

export interface IMedicationRepository {
  create(data: IMedicationCreate): Promise<Medication>;
  findById(id: string): Promise<Medication | null>;
  findByPatientId(patientId: string): Promise<Medication[]>;
  update(id: string, data: IMedicationUpdate): Promise<Medication>;
  delete(id: string): Promise<void>;
}
