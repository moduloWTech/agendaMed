import { IPatientRepository, IPatientCreate, IPatientUpdate } from '../interfaces/patient.interface';
import type { Patient } from '../generated/prisma/client';

import { prisma } from '../DB/prisma.config';

export class PatientRepository implements IPatientRepository {
  async create(data: IPatientCreate): Promise<Patient> {
    return await prisma.patient.create({
      data: {
        name: data.name,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        users: {
          connect: { id: data.userId }
        }
      },
    });
  }

  async findById(id: string): Promise<Patient | null> {
    return await prisma.patient.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Patient[]> {
    return await prisma.patient.findMany({
      where: {
        users: {
          some: { id: userId }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, data: IPatientUpdate): Promise<Patient> {
    return await prisma.patient.update({
      where: { id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.patient.delete({
      where: { id },
    });
  }
}
