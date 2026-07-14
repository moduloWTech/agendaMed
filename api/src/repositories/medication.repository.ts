import { IMedicationRepository, IMedicationCreate, IMedicationUpdate } from '../interfaces/medication.interface';
import type { Medication } from '../generated/prisma/client';

import { prisma } from '../DB/prisma.config';

export class MedicationRepository implements IMedicationRepository {
  async create(data: IMedicationCreate): Promise<Medication> {
    return await prisma.medication.create({
      data: {
        name: data.name,
        dosage: data.dosage,
        instructions: data.instructions,
        frequency: data.frequency,
        startDate: new Date(data.startDate),
        startTime: data.startTime,
        times: data.times || [],
        active: data.active ?? true,
        photoUrl: data.photoUrl || null,
        patientId: data.patientId,
      },
    });
  }

  async findById(id: string): Promise<Medication | null> {
    return await prisma.medication.findUnique({
      where: { id },
    });
  }

  async findByPatientId(patientId: string): Promise<Medication[]> {
    return await prisma.medication.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, data: IMedicationUpdate): Promise<Medication> {
    const updateData: any = { ...data };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }

    return await prisma.medication.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.medication.delete({
      where: { id },
    });
  }

  async getHistory(patientId: string, date: string): Promise<any[]> {
    return await prisma.medicationHistory.findMany({
      where: { patientId, date }
    });
  }

  async toggleHistory(userId: string, data: { medicationId: string, patientId: string, date: string, time: string }): Promise<void> {
    const existing = await prisma.medicationHistory.findUnique({
      where: {
        medicationId_date_time: {
          medicationId: data.medicationId,
          date: data.date,
          time: data.time
        }
      }
    });

    if (existing) {
      // Se já existe, o usuário quer desfazer o checkin
      await prisma.medicationHistory.delete({
        where: { id: existing.id }
      });
    } else {
      // Se não existe, faz o checkin
      await prisma.medicationHistory.create({
        data: {
          medicationId: data.medicationId,
          patientId: data.patientId,
          userId,
          date: data.date,
          time: data.time
        }
      });
    }
  }
}
