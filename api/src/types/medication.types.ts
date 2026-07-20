export interface IMedicationCreateData {
  name: string;
  dosage: string;
  instructions: string;
  frequency: string;
  startDate: string;
  startTime: string;
  times?: string[];
  active?: boolean;
  patientId: string;
  photoUrl?: string | null;
}

export interface IMedicationUpdateData {
  name?: string;
  dosage?: string;
  instructions?: string;
  frequency?: string;
  startDate?: string | Date;
  startTime?: string;
  times?: string[];
  active?: boolean;
  photoUrl?: string | null;
}

export interface ICheckinData {
  medicationId: string;
  patientId: string;
  date: string;
  time: string;
}
