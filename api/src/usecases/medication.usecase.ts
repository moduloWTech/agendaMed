import { IMedicationRepository } from '../interfaces/medication.interface';
import { IPatientRepository } from '../interfaces/patient.interface';
import { z } from 'zod';
import type { Medication } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { pushService } from '../services/push.service';

export class MedicationUseCase {
  constructor(
    private medicationRepository: IMedicationRepository,
    private patientRepository: IPatientRepository
  ) {}

  async createMedication(data: any): Promise<Medication> {
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
    });

    const parsed = schema.parse(data);

    // Regra de Negócio: O paciente precisa existir
    const patientExists = await this.patientRepository.findById(parsed.patientId);
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
      patientId: parsed.patientId
    });
  }

  async getMedicationById(id: string): Promise<Medication> {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new Error('Medicamento não encontrado.');
    }
    return medication;
  }

  async getMedicationsByPatientId(patientId: string): Promise<Medication[]> {
    return await this.medicationRepository.findByPatientId(patientId);
  }

  async updateMedication(id: string, data: any): Promise<Medication> {
    const schema = z.object({
      name: z.string().min(2).optional(),
      dosage: z.string().min(1).optional(),
      instructions: z.string().min(1).optional(),
      frequency: z.string().min(1).optional(),
      startDate: z.string().datetime().or(z.date()).optional(),
      startTime: z.string().min(4).optional(),
      times: z.array(z.string()).optional(),
      active: z.boolean().optional(),
    });

    const parsedData = schema.parse(data);

    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new Error('Medicamento não encontrado.');
    }

    return await this.medicationRepository.update(id, parsedData);
  }

  async deleteMedication(id: string): Promise<void> {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new Error('Medicamento não encontrado.');
    }

    await this.medicationRepository.delete(id);
  }

  async getHistory(patientId: string, date: string): Promise<any[]> {
    return await this.medicationRepository.getHistory(patientId, date);
  }

  async toggleCheckin(userId: string, data: any): Promise<void> {
    const schema = z.object({
      medicationId: z.string().uuid(),
      patientId: z.string().uuid(),
      date: z.string(),
      time: z.string()
    });
    
    const parsed = schema.parse(data);
    const wasCreated = await this.medicationRepository.toggleHistory(userId, parsed);

    if (wasCreated) {
      try {
        const medication = await this.medicationRepository.findById(parsed.medicationId);
        const patient: any = await this.patientRepository.findById(parsed.patientId);
        const userWhoDidIt = await prisma.user.findUnique({ where: { id: userId } });
        
        const userName = userWhoDidIt?.name || 'Um cuidador';
        
        if (patient && medication) {
          // Filtrar os usuários do paciente para enviar a notificação (exceto para o que acabou de dar o remédio)
          const otherUserIds = (patient.users || [])
            .map((u: any) => u.id)
            .filter((id: string) => id !== userId);
            
          if (otherUserIds.length > 0) {
            pushService.sendNotificationToUsers(otherUserIds, {
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
