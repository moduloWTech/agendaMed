import { IUserRepository, IUserCreate } from '../interfaces/user.interface';
import type { User } from '../generated/prisma/client';

import { prisma } from '../DB/prisma.config';

export class UserRepository implements IUserRepository {
  async create(data: IUserCreate): Promise<User> {
    const payload: any = {
      phoneWhats: data.phoneWhats,
      name: data.name || null,
      email: data.email || null,
      role: data.role || 'CARE_GIVER',
    };
    if (data.patientId) {
      payload.patients = {
        connect: { id: data.patientId }
      };
    }
    return await prisma.user.create({
      data: payload,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPhoneWhats(phoneWhats: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { phoneWhats },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findByPatientId(patientId: string): Promise<User[]> {
    return await prisma.user.findMany({
      where: {
        patients: {
          some: { id: patientId }
        }
      }
    });
  }

  async update(id: string, data: any): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  async createAdminWithTenant(userData: any, tenantName: string): Promise<{ user: User, tenant: any }> {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          phoneWhats: userData.phoneWhats,
          passwordHash: userData.passwordHash,
          role: 'ADMIN',
        }
      });

      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          ownerId: user.id,
        }
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { tenantId: tenant.id }
      });

      return { user: updatedUser, tenant };
    });
  }
}
