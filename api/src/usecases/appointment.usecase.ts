import { z } from 'zod';
import { IAppointmentRepository } from '../interfaces/appointment.interface';
import { Appointment } from '../generated/prisma/client';

export class AppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async createAppointment(data: any): Promise<Appointment> {
    const schema = z.object({
      specialty: z.string().min(2, 'Especialidade é obrigatória'),
      doctorName: z.string().optional(),
      date: z.string().min(1, 'Data é obrigatória'),
      time: z.string().min(1, 'Horário é obrigatório'),
      location: z.string().optional(),
      notes: z.string().optional(),
      alertEnabled: z.boolean().optional(),
      alertHoursBefore: z.number().optional(),
      intensiveAlerts: z.boolean().optional(),
      patientId: z.string().uuid('ID do paciente inválido'),
    });

    const parsedData = schema.parse(data);

    return this.appointmentRepository.create(parsedData);
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findByPatientId(patientId);
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    return this.appointmentRepository.findById(id);
  }

  async updateAppointment(id: string, data: any): Promise<Appointment> {
    const schema = z.object({
      specialty: z.string().min(2).optional(),
      doctorName: z.string().optional(),
      date: z.string().optional(),
      time: z.string().optional(),
      location: z.string().optional(),
      notes: z.string().optional(),
      alertEnabled: z.boolean().optional(),
      alertHoursBefore: z.number().optional(),
      intensiveAlerts: z.boolean().optional(),
    });

    const parsedData = schema.parse(data);
    return this.appointmentRepository.update(id, parsedData);
  }

  async deleteAppointment(id: string): Promise<void> {
    return this.appointmentRepository.delete(id);
  }
}
