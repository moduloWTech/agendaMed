import type { Medication } from '../generated/prisma/client';

export interface IMedicationCreate {
  name: string;
  dosage: string;
  instructions: string;
  frequency: string;
  startDate: Date | string;
  startTime: string;
  times?: string[];
  active?: boolean;
  photoUrl?: string | null;
  patientId: string;
}

export interface IMedicationUpdate {
  name?: string;
  dosage?: string;
  instructions?: string;
  frequency?: string;
  startDate?: Date | string;
  startTime?: string;
  times?: string[];
  active?: boolean;
  photoUrl?: string | null;
}

export interface IMedicationRepository {
  create(data: IMedicationCreate): Promise<Medication>;
  findById(id: string): Promise<Medication | null>;
  findByPatientId(patientId: string): Promise<Medication[]>;
  update(id: string, data: IMedicationUpdate): Promise<Medication>;
  delete(id: string): Promise<void>;
  getHistory(patientId: string, date: string): Promise<any[]>;
  toggleHistory(userId: string, data: { medicationId: string, patientId: string, date: string, time: string }): Promise<boolean>;
}
