import { IUserRepository, IUserCreate } from '../interfaces/user.interface';
import type { User } from '../generated/prisma/client';

import { prisma } from '../DB/prisma.config';

export class UserRepository implements IUserRepository {
  async create(data: IUserCreate): Promise<User> {
    return await prisma.user.create({
      data: {
        phoneWhats: data.phoneWhats,
        name: data.name || null,
        email: data.email || null,
        role: data.role || 'CARE_GIVER',
      },
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
}
