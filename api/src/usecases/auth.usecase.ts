import { IUserRepository } from '../interfaces/user.interface';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mwt-2026';
import { prisma } from '../DB/prisma.config';

export class AuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  async register(data: any): Promise<{ user: any, accessToken: string }> {
    const schema = z.object({
      name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
      email: z.string().email('E-mail inválido'),
      phoneWhats: z.string().min(10, 'Telefone inválido'),
      password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    });

    const parsed = schema.parse(data);

    // Verifica se email ou telefone já existem
    const existingUserByEmail = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existingUserByEmail) throw new Error('E-mail já cadastrado.');
    
    const existingUserByPhone = await prisma.user.findUnique({ where: { phoneWhats: parsed.phoneWhats } });
    if (existingUserByPhone) throw new Error('Telefone já cadastrado.');

    const passwordHash = await bcrypt.hash(parsed.password, 10);

    // B2C: Cria o Tenant (Conta) e o Usuário Admin
    const tenantName = `Família de ${parsed.name.split(' ')[0]}`;

    // Precisamos usar transação para garantir que ambos criem
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cria o usuário primeiro para ser o dono, mas não tem tenantId ainda
      // No Prisma, não podemos criar ciclo infinito se ambos são requiridos, 
      // mas `tenantId` é opcional no User para evitar problema de ciclo.
      
      const user = await tx.user.create({
        data: {
          name: parsed.name,
          email: parsed.email,
          phoneWhats: parsed.phoneWhats,
          passwordHash: passwordHash,
          role: 'ADMIN',
        }
      });

      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          ownerId: user.id,
        }
      });

      // Vincula o user ao tenant recém criado
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { tenantId: tenant.id }
      });

      return { user: updatedUser, tenant };
    });

    const accessToken = jwt.sign(
      { id: result.user.id, role: result.user.role, tenantId: result.user.tenantId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user: result.user, accessToken };
  }

  async login(data: any): Promise<{ user: any, accessToken: string }> {
    const schema = z.object({
      email: z.string().email('E-mail inválido'),
      password: z.string().min(1, 'Senha é obrigatória'),
    });

    const parsed = schema.parse(data);

    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user || !user.passwordHash) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const isMatch = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenantId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user, accessToken };
  }
}
