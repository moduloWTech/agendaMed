import { IMedicationRepository } from '../interfaces/medication.interface';
import { IPatientRepository } from '../interfaces/patient.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { z } from 'zod';
import type { Medication } from '../generated/prisma/client';
import { pushService } from '../services/push.service';

export class MedicationUseCase {
  constructor(
    private medicationRepository: IMedicationRepository,
    private patientRepository: IPatientRepository,
    private userRepository: IUserRepository
  ) {}

  async createMedication(tenantId: string, data: any): Promise<Medication> {
    const schema = z.object({
      name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
      dosage: z.string().min(1, 'A dosagem é obrigatória'),
      instructions: z.string().min(1, 'As instruções são obrigatórias'),
      frequency: z.string(),
      startDate: z.string(),
      startTime: z.string().min(4, 'O horário inicial é obrigatório'),
      times: z.array(z.string()).optional(),
      active: z.boolean().optional(),
      patientId: z.string().uuid('ID do paciente inválido'),
      photoUrl: z.string().nullable().optional()
    });

    const parsed = schema.parse(data);

    // Regra de Negócio: O paciente precisa existir e pertencer ao Tenant
    const patientExists = await this.patientRepository.findById(parsed.patientId, tenantId);
    if (!patientExists) {
      throw new Error('Paciente associado não encontrado na plataforma.');
    }

    return await this.medicationRepository.create({
      name: parsed.name,
      dosage: parsed.dosage,
      instructions: parsed.instructions,
      frequency: parsed.frequency,
      startDate: new Date(parsed.startDate),
      startTime: parsed.startTime,
      times: parsed.times || [],
      patientId: parsed.patientId,
      photoUrl: parsed.photoUrl
    });
  }

  async getMedicationById(id: string, tenantId: string): Promise<Medication> {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new Error('Medicamento não encontrado.');
    }

    const patientExists = await this.patientRepository.findById(medication.patientId, tenantId);
    if (!patientExists) {
      throw new Error('Medicamento não encontrado.');
    }

    return medication;
  }

  async getMedicationsByPatientId(patientId: string, tenantId: string): Promise<Medication[]> {
    const patientExists = await this.patientRepository.findById(patientId, tenantId);
    if (!patientExists) {
      throw new Error('Paciente não encontrado ou acesso negado.');
    }
    return await this.medicationRepository.findByPatientId(patientId);
  }

  async updateMedication(id: string, tenantId: string, data: any): Promise<Medication> {
    const schema = z.object({
      name: z.string().min(2).optional(),
      dosage: z.string().min(1).optional(),
      instructions: z.string().min(1).optional(),
      frequency: z.string().min(1).optional(),
      startDate: z.string().datetime().or(z.date()).optional(),
      startTime: z.string().min(4).optional(),
      times: z.array(z.string()).optional(),
      active: z.boolean().optional(),
      photoUrl: z.string().nullable().optional()
    });

    const parsedData = schema.parse(data);

    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new Error('Medicamento não encontrado.');
    }

    const patientExists = await this.patientRepository.findById(medication.patientId, tenantId);
    if (!patientExists) {
      throw new Error('Medicamento não encontrado.');
    }

    return await this.medicationRepository.update(id, parsedData);
  }

  async deleteMedication(id: string, tenantId: string): Promise<void> {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new Error('Medicamento não encontrado.');
    }

    const patientExists = await this.patientRepository.findById(medication.patientId, tenantId);
    if (!patientExists) {
      throw new Error('Medicamento não encontrado.');
    }

    await this.medicationRepository.delete(id);
  }

  async getHistory(patientId: string, date: string, tenantId: string): Promise<any[]> {
    const patientExists = await this.patientRepository.findById(patientId, tenantId);
    if (!patientExists) {
      throw new Error('Paciente não encontrado ou acesso negado.');
    }
    return await this.medicationRepository.getHistory(patientId, date);
  }

  async toggleCheckin(userId: string, tenantId: string, data: any): Promise<void> {
    const schema = z.object({
      medicationId: z.string().uuid(),
      patientId: z.string().uuid(),
      date: z.string(),
      time: z.string()
    });
    
    const parsed = schema.parse(data);

    const patientExists = await this.patientRepository.findById(parsed.patientId, tenantId);
    if (!patientExists) {
      throw new Error('Paciente não encontrado ou acesso negado.');
    }

    const wasCreated = await this.medicationRepository.toggleHistory(userId, parsed);

    if (wasCreated) {
      try {
        const medication = await this.medicationRepository.findById(parsed.medicationId);
        const patient: any = await this.patientRepository.findById(parsed.patientId);
        const userWhoDidIt = await this.userRepository.findById(userId);
        
        const userName = userWhoDidIt?.name || 'Um cuidador';
        
        if (patient && medication) {
          // Extrair a lista de todos os usuários atrelados ao paciente
          const allUserIds = (patient.users || []).map((u: any) => u.id);
            
          if (allUserIds.length > 0) {
            pushService.sendNotificationToUsers(allUserIds, {
              title: '✅ Remédio Administrado!',
              body: `${userName} registrou que ${patient.name} tomou ${medication.name}.`,
              url: '/'
            }).catch(console.error);
          }
        }
      } catch (err) {
        console.error('[WebPush] Falha ao enviar notificação de check-in:', err);
      }
    }
  }
}
