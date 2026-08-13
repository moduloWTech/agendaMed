import { IUserRepository } from '../interfaces/user.interface';
import { z } from 'zod';
import type { User } from '../generated/prisma/client';
import { prisma } from '../DB/prisma.config';

export class UserUseCase {
  constructor(private userRepository: IUserRepository) { }

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

  async getUserById(id: string, tenantId?: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }
    if (tenantId && user.tenantId !== tenantId) {
      throw new Error('Acesso negado. O usuário não pertence à sua família.');
    }
    return user;
  }

  async updateUser(id: string, data: any, tenantId?: string): Promise<User> {
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
    if (tenantId && user.tenantId !== tenantId) {
      throw new Error('Acesso negado. O usuário não pertence à sua família.');
    }

    return await this.userRepository.update(id, parsedData);
  }

  async deleteUser(requesterId: string, targetId: string, tenantId?: string): Promise<void> {
    const requester = await this.userRepository.findById(requesterId);
    if (!requester || requester.role !== 'ADMIN') {
      throw new Error('Apenas administradores podem remover membros da equipe.');
    }

    if (requesterId === targetId) {
      throw new Error('Você não pode remover a si mesmo.');
    }

    const targetUser = await this.userRepository.findById(targetId);
    if (!targetUser) {
      throw new Error('Usuário não encontrado.');
    }

    if (tenantId && targetUser.tenantId !== tenantId) {
      throw new Error('Acesso negado. O usuário não pertence à sua família.');
    }

    // Verifica se é o dono do Tenant
    if (targetUser.tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: targetUser.tenantId } });
      if (tenant && tenant.ownerId === targetId) {
        throw new Error('O proprietário da conta não pode ser removido.');
      }
    }

    // Remove a vinculação do usuário com o Tenant e Pacientes
    await prisma.user.update({
      where: { id: targetId },
      data: {
        tenantId: null,
        patients: {
          set: []
        }
      }
    });

    // Tenta deletar fisicamente o usuário se não houver impedimentos de chave estrangeira (ex: histórico)
    try {
      await this.userRepository.delete(targetId);
    } catch (e) {
      // Se houver histórico mantem o registro preservado mas 100% desvinculado do grupo
    }
  }

  async updatePreferences(id: string, data: any): Promise<User> {
    const schema = z.object({
      defaultIntensiveAlerts: z.boolean().optional(),
      defaultAlertAdvance: z.string().optional(),
      syncGoogle: z.boolean().optional(),
      darkMode: z.boolean().optional(),
    });

    const parsedData = schema.parse(data);

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    return await this.userRepository.update(id, parsedData);
  }

  async inviteCaregiver(adminId: string, data: any): Promise<{ success: boolean, message: string, inviteLink?: string }> {
    const schema = z.object({
      phoneWhats: z.string().min(10, 'O telefone deve ter pelo menos 10 dígitos'),
      name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
      patientId: z.string().uuid('ID do paciente inválido'),
      patientName: z.string() // para enviar na mensagem
    });

    const parsedData = schema.parse(data);

    // Valida admin
    const admin = await this.userRepository.findById(adminId);
    if (!admin || admin.role !== 'ADMIN' || !admin.tenantId) {
      throw new Error('Apenas administradores de família podem convidar cuidadores.');
    }

    // Verifica se já existe
    let user = await this.userRepository.findByPhoneWhats(parsedData.phoneWhats);
    if (user) {
      throw new Error('Este número já está cadastrado no sistema.');
    }

    // Gera Token JWT para o convite (duração 48 horas)
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mwt-2026';
    const inviteToken = jwt.sign(
      {
        tenantId: admin.tenantId,
        patientId: parsedData.patientId,
        invitedPhone: parsedData.phoneWhats,
        invitedName: parsedData.name
      },
      JWT_SECRET,
      { expiresIn: '48h' }
    );

    // Monta a mensagem de WhatsApp
    const message = `Olá, ${parsedData.name}! 👋\n\nVocê foi convidado(a) por *${admin.name || 'um administrador'}* para fazer parte da equipe de cuidados de *${parsedData.patientName}* no aplicativo *AgendaMed*.\n\nAcesse o link abaixo para criar sua conta de cuidador(a):\n${process.env.FRONTEND_URL || 'http://localhost:5173'}/convite?token=${inviteToken}`;
    
    // Formata o número (remover caracteres especiais e adicionar 55 se precisar)
    let numericPhone = parsedData.phoneWhats.replace(/\D/g, '');
    if (numericPhone.length === 10 || numericPhone.length === 11) {
      numericPhone = `55${numericPhone}`;
    }

    // Gera o Deep Link
    const inviteLink = `https://wa.me/${numericPhone}?text=${encodeURIComponent(message)}`;

    return { success: true, message: 'Convite gerado com sucesso.', inviteLink };
  }

  async getCaregivers(patientId: string, tenantId?: string): Promise<User[]> {
    const users = await this.userRepository.findByPatientId(patientId);
    if (tenantId) {
      return users.filter(u => u.tenantId === tenantId);
    }
    return users;
  }

  async changeUserRole(adminId: string, targetUserId: string, newRole: string): Promise<User> {
    const schema = z.object({
      newRole: z.enum(['ADMIN', 'CARE_GIVER'])
    });

    const parsedData = schema.parse({ newRole });

    if (adminId === targetUserId) {
      throw new Error('Você não pode alterar o seu próprio cargo.');
    }

    const admin = await this.userRepository.findById(adminId);
    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('Apenas administradores podem alterar cargos.');
    }

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new Error('Usuário alvo não encontrado.');
    }
    if (targetUser.tenantId !== admin.tenantId) {
      throw new Error('O usuário não pertence à sua família.');
    }

    return await this.userRepository.update(targetUserId, { role: parsedData.newRole });
  }
}
