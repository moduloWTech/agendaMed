import { IUserRepository, IUserCreate } from '../interfaces/user.interface';
import { z } from 'zod';
import type { User } from '@prisma/client';

export class UserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async createUser(data: any): Promise<User> {
    // Regra de Negócio: Validação estrita via Zod
    const schema = z.object({
      phoneWhats: z.string().min(10, 'O telefone deve ter pelo menos 10 dígitos'),
      name: z.string().optional(),
      email: z.string().email('E-mail inválido').optional(),
      role: z.string().optional(),
    });

    const parsedData = schema.parse(data);

    // Regra de Negócio: Verificar se o usuário já existe
    const existingUser = await this.userRepository.findByPhoneWhats(parsedData.phoneWhats);
    if (existingUser) {
      throw new Error('Telefone já cadastrado na plataforma.');
    }
    
    if (parsedData.email) {
      const existingEmail = await this.userRepository.findByEmail(parsedData.email);
      if (existingEmail) throw new Error('E-mail já cadastrado na plataforma.');
    }

    // Regras de negócio passaram, enviar para o repositório salvar
    return await this.userRepository.create(parsedData);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }
    return user;
  }

  async updateUser(id: string, data: any): Promise<User> {
    const schema = z.object({
      phoneWhats: z.string().optional(),
      name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').optional(),
      email: z.string().email('E-mail inválido').optional(),
      role: z.string().optional(),
    });

    const parsedData = schema.parse(data);

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    return await this.userRepository.update(id, parsedData);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    await this.userRepository.delete(id);
  }
}
