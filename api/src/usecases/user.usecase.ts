import { IUserRepository, IUserCreate } from '../interfaces/user.interface';
import { z } from 'zod';
import type { User } from '../generated/prisma/client';
import { whatsappService } from '../services/whatsapp.service';

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

  async inviteCaregiver(adminId: string, data: any): Promise<User> {
    const schema = z.object({
      phoneWhats: z.string().min(10, 'O telefone deve ter pelo menos 10 dígitos'),
      name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
      patientId: z.string().uuid('ID do paciente inválido'),
      patientName: z.string() // para enviar na mensagem
    });

    const parsedData = schema.parse(data);

    // Valida admin
    const admin = await this.userRepository.findById(adminId);
    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('Apenas administradores podem convidar cuidadores.');
    }

    // Verifica se já existe
    let user = await this.userRepository.findByPhoneWhats(parsedData.phoneWhats);
    if (user) {
      // Se existir, apenas atualiza para vincular ao paciente (se precisar)
      throw new Error('Este número já está cadastrado no sistema.');
    }

    // Cria o usuário Cuidador
    user = await this.userRepository.create({
      phoneWhats: parsedData.phoneWhats,
      name: parsedData.name,
      role: 'CARE_GIVER',
      patientId: parsedData.patientId
    });

    // Envia WhatsApp
    const message = `Olá, ${parsedData.name}! 👋\n\nVocê foi convidado(a) por *${admin.name || 'um administrador'}* para fazer parte da equipe de cuidados de *${parsedData.patientName}* no aplicativo *AgendaMed*.\n\nAcesse o link abaixo para entrar no sistema:\n${process.env.FRONTEND_URL || 'http://localhost:5173'}\n\nLá, basta digitar o seu número de telefone para acessar a conta.`;
    
    try {
      await whatsappService.sendMessage(parsedData.phoneWhats, message);
    } catch (e) {
      console.error('Erro ao enviar mensagem de convite no WhatsApp', e);
    }

    return user;
  }

  async getCaregivers(patientId: string): Promise<User[]> {
    return await this.userRepository.findByPatientId(patientId);
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

    return await this.userRepository.update(targetUserId, { role: parsedData.newRole });
  }
}
