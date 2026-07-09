import type { User } from '../generated/prisma/client';

export interface IUserCreate {
  phoneWhats: string;
  name?: string;
  email?: string;
  role?: string;
  patientId?: string;
}

export interface IUserUpdate {
  phoneWhats?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface IUserRepository {
  create(data: IUserCreate): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByPhoneWhats(phoneWhats: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByPatientId(patientId: string): Promise<User[]>;
  update(id: string, data: IUserUpdate): Promise<User>;
  delete(id: string): Promise<void>;
}
