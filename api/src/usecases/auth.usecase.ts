import { IUserRepository } from '../interfaces/user.interface';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { User } from '../generated/prisma/client';
import { IRegisterData, ILoginData, IAcceptInviteData } from '../types/auth.types';

import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mwt-2026';

export class AuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  async register(data: IRegisterData): Promise<{ user: User, accessToken: string }> {
    const schema = z.object({
      name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
      email: z.string().email('E-mail inválido'),
      phoneWhats: z.string().min(10, 'Telefone inválido'),
      password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    });

    const parsed = schema.parse(data);

    // Verifica se email ou telefone já existem
    const existingUserByEmail = await this.userRepository.findByEmail(parsed.email);
    if (existingUserByEmail) throw new Error('E-mail já cadastrado.');
    
    const existingUserByPhone = await this.userRepository.findByPhoneWhats(parsed.phoneWhats);
    if (existingUserByPhone) throw new Error('Telefone já cadastrado.');

    const passwordHash = await bcrypt.hash(parsed.password, 10);

    // B2C: Cria o Tenant (Conta) e o Usuário Admin
    const tenantName = `Família de ${parsed.name.split(' ')[0]}`;

    // Precisamos usar transação para garantir que ambos criem
    const result = await this.userRepository.createAdminWithTenant({
      name: parsed.name,
      email: parsed.email,
      phoneWhats: parsed.phoneWhats,
      passwordHash: passwordHash
    }, tenantName);

    const accessToken = jwt.sign(
      { id: result.user.id, role: result.user.role, tenantId: result.user.tenantId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user: result.user, accessToken };
  }

  async login(data: ILoginData): Promise<{ user: User, accessToken: string }> {
    const schema = z.object({
      email: z.string().email('E-mail inválido'),
      password: z.string().min(1, 'Senha é obrigatória'),
    });

    const parsed = schema.parse(data);

    const user = await this.userRepository.findByEmail(parsed.email);
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

  async acceptInvite(data: IAcceptInviteData): Promise<{ user: User, accessToken: string }> {
    const schema = z.object({
      token: z.string(),
      name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
      email: z.string().email('E-mail inválido'),
      phoneWhats: z.string().min(10, 'Telefone inválido'),
      password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    });

    const parsed = schema.parse(data);

    // Valida o Token de Convite
    let inviteData: any;
    try {
      inviteData = jwt.verify(parsed.token, JWT_SECRET);
    } catch (e: any) {
      console.error('JWT VERIFY ERROR:', e);
      throw new Error(`Convite inválido ou expirado. Detalhe: ${e.message}`);
    }

    if (!inviteData.tenantId) {
      throw new Error('Convite inválido (Tenant ausente).');
    }

    // Verifica se email ou telefone já existem
    const existingUserByEmail = await this.userRepository.findByEmail(parsed.email);
    if (existingUserByEmail) throw new Error('E-mail já cadastrado.');
    
    const existingUserByPhone = await this.userRepository.findByPhoneWhats(parsed.phoneWhats);
    if (existingUserByPhone) throw new Error('Telefone já cadastrado.');

    const passwordHash = await bcrypt.hash(parsed.password, 10);

    // Cria o usuário Cuidador atrelado ao Tenant do convite
    const user = await this.userRepository.create({
      name: parsed.name,
      email: parsed.email,
      phoneWhats: parsed.phoneWhats,
      passwordHash: passwordHash,
      role: 'CARE_GIVER',
      tenantId: inviteData.tenantId,
      patientId: inviteData.patientId
    });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenantId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user, accessToken };
  }
}
