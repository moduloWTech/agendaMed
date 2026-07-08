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
}
