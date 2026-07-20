import { IPatientRepository, IPatientCreate, IPatientUpdate } from '../interfaces/patient.interface';
import type { Patient } from '../generated/prisma/client';

import { prisma } from '../DB/prisma.config';

export class PatientRepository implements IPatientRepository {
  async create(data: IPatientCreate): Promise<Patient> {
    return await prisma.patient.create({
      data: {
        name: data.name,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        tenantId: data.tenantId,
        users: {
          connect: { id: data.userId }
        }
      },
    });
  }

  async findById(id: string, tenantId: string): Promise<Patient | null> {
    return await prisma.patient.findUnique({
      where: { id, tenantId },
      include: {
        users: true
      }
    });
  }

  async findByTenantId(tenantId: string): Promise<Patient[]> {
    return await prisma.patient.findMany({
      where: {
        tenantId: tenantId
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, tenantId: string, data: IPatientUpdate): Promise<Patient> {
    return await prisma.patient.update({
      where: { id, tenantId },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined
      },
    });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await prisma.patient.delete({
      where: { id, tenantId },
    });
  }
}
