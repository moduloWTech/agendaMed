import { z } from 'zod';
import { IAppointmentRepository } from '../interfaces/appointment.interface';
import { IPatientRepository } from '../interfaces/patient.interface';
import { Appointment } from '../generated/prisma/client';

export class AppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private patientRepository: IPatientRepository
  ) {}

  async createAppointment(tenantId: string, data: any): Promise<Appointment> {
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

    // Verify patient belongs to tenant
    const patientExists = await this.patientRepository.findById(parsedData.patientId, tenantId);
    if (!patientExists) {
      throw new Error('Paciente não encontrado ou acesso negado.');
    }

    return this.appointmentRepository.create(parsedData);
  }

  async getAppointmentsByPatient(patientId: string, tenantId: string): Promise<Appointment[]> {
    const patientExists = await this.patientRepository.findById(patientId, tenantId);
    if (!patientExists) {
      throw new Error('Paciente não encontrado ou acesso negado.');
    }
    return this.appointmentRepository.findByPatientId(patientId);
  }

  async getAppointmentById(id: string, tenantId: string): Promise<Appointment | null> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new Error('Consulta não encontrada.');
    }

    const patientExists = await this.patientRepository.findById(appointment.patientId, tenantId);
    if (!patientExists) {
      throw new Error('Consulta não encontrada ou acesso negado.');
    }

    return appointment;
  }

  async updateAppointment(id: string, tenantId: string, data: any): Promise<Appointment> {
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

    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new Error('Consulta não encontrada.');
    }

    const patientExists = await this.patientRepository.findById(appointment.patientId, tenantId);
    if (!patientExists) {
      throw new Error('Consulta não encontrada ou acesso negado.');
    }

    return this.appointmentRepository.update(id, parsedData);
  }

  async deleteAppointment(id: string, tenantId: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new Error('Consulta não encontrada.');
    }

    const patientExists = await this.patientRepository.findById(appointment.patientId, tenantId);
    if (!patientExists) {
      throw new Error('Consulta não encontrada ou acesso negado.');
    }

    return this.appointmentRepository.delete(id);
  }
}
