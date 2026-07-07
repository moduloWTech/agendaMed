import { PrismaClient } from '@prisma/client';
import { IUserRepository, IUserCreate } from '../interfaces/user.interface';
import type { User } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository implements IUserRepository {
  async create(data: IUserCreate): Promise<User> {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role || 'CARE_GIVER',
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
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
