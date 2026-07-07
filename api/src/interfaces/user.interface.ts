import type { User } from '@prisma/client';

export interface IUserCreate {
  name: string;
  email: string;
  role?: string;
}

export interface IUserUpdate {
  name?: string;
  role?: string;
}

export interface IUserRepository {
  create(data: IUserCreate): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: IUserUpdate): Promise<User>;
  delete(id: string): Promise<void>;
}
