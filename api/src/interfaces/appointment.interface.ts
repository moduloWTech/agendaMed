import type { Appointment } from '../generated/prisma/client';

export interface IAppointmentCreate {
  specialty: string;
  doctorName?: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  alertEnabled?: boolean;
  alertHoursBefore?: number;
  intensiveAlerts?: boolean;
  patientId: string;
}

export interface IAppointmentUpdate {
  specialty?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  location?: string;
  notes?: string;
  alertEnabled?: boolean;
  alertHoursBefore?: number;
  intensiveAlerts?: boolean;
}

export interface IAppointmentRepository {
  create(data: IAppointmentCreate): Promise<Appointment>;
  findById(id: string): Promise<Appointment | null>;
  findByPatientId(patientId: string): Promise<Appointment[]>;
  update(id: string, data: IAppointmentUpdate): Promise<Appointment>;
  delete(id: string): Promise<void>;
}
