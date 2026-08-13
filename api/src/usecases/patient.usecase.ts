import { IPatientRepository } from '../interfaces/patient.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { z } from 'zod';
import type { Patient } from '../generated/prisma/client';
import { prisma } from '../DB/prisma.config';

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
      tenantId: z.string().uuid('TenantId inválido'),
    });

    const parsedData = schema.parse(data);

    // Validação de Regra de Negócio: O cuidador precisa existir
    const userExists = await this.userRepository.findById(parsedData.userId);
    if (!userExists) {
      throw new Error('Cuidador (User) associado não encontrado na plataforma.');
    }

    return await this.patientRepository.create(parsedData);
  }

  async getPatientById(id: string, tenantId: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(id, tenantId);
    if (!patient) {
      throw new Error('Paciente não encontrado.');
    }
    return patient;
  }

  async getPatientsByTenantId(tenantId: string): Promise<Patient[]> {
    return await this.patientRepository.findByTenantId(tenantId);
  }

  async updatePatient(id: string, tenantId: string, data: any): Promise<Patient> {
    const schema = z.object({
      name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').optional(),
      birthDate: z.string().datetime().optional().or(z.date().optional()),
    });

    const parsedData = schema.parse(data);

    const patient = await this.patientRepository.findById(id, tenantId);
    if (!patient) {
      throw new Error('Paciente não encontrado.');
    }

    return await this.patientRepository.update(id, tenantId, parsedData);
  }

  async deletePatient(id: string, tenantId: string): Promise<void> {
    const patient = await this.patientRepository.findById(id, tenantId);
    if (!patient) {
      throw new Error('Paciente não encontrado.');
    }

    await this.patientRepository.delete(id, tenantId);
  }

  async getReportData(id: string, tenantId: string, startDate?: string, endDate?: string): Promise<any> {
    const patient = await this.patientRepository.findById(id, tenantId);
    if (!patient) {
      throw new Error('Paciente não encontrado.');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const defaultStartStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const start = startDate || defaultStartStr;
    const end = endDate || todayStr;

    const dStart = new Date(start);
    const dEnd = new Date(end);
    const timeDiff = Math.max(0, dEnd.getTime() - dStart.getTime());
    const daysCount = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1);

    const medications = await prisma.medication.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' }
    });

    const historyLogs = await prisma.medicationHistory.findMany({
      where: {
        patientId: id,
        date: {
          gte: start,
          lte: end
        }
      },
      include: {
        medication: true,
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: [
        { date: 'desc' },
        { time: 'desc' }
      ]
    });

    const appointments = await prisma.appointment.findMany({
      where: { patientId: id },
      orderBy: { date: 'asc' }
    });

    const activeMedications = medications.filter(m => m.active);
    const scheduledDosesPerDay = activeMedications.reduce((sum, med) => sum + (med.times?.length || 1), 0);
    const totalScheduledDoses = scheduledDosesPerDay * daysCount;
    const takenDoses = historyLogs.length;

    const adherencePercentage = totalScheduledDoses > 0 
      ? Math.min(100, Math.round((takenDoses / totalScheduledDoses) * 100))
      : 100;

    return {
      patient: {
        id: patient.id,
        name: patient.name,
        birthDate: patient.birthDate,
      },
      period: {
        startDate: start,
        endDate: end,
        daysCount,
      },
      metrics: {
        totalScheduledDoses,
        takenDoses,
        missedDoses: Math.max(0, totalScheduledDoses - takenDoses),
        adherencePercentage,
      },
      medications: medications.map(m => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        times: m.times,
        instructions: m.instructions,
        active: m.active,
        photoUrl: m.photoUrl,
      })),
      historyLogs: historyLogs.map(log => ({
        id: log.id,
        medicationId: log.medicationId,
        medicationName: log.medication?.name || 'Medicamento',
        dosage: log.medication?.dosage || '',
        date: log.date,
        time: log.time,
        takenAt: log.takenAt,
        registeredBy: log.user?.name || 'Cuidador',
      })),
      appointments: appointments.map(a => ({
        id: a.id,
        specialty: a.specialty,
        doctorName: a.doctorName,
        date: a.date,
        time: a.time,
        location: a.location,
        notes: a.notes,
      })),
    };
  }
}

