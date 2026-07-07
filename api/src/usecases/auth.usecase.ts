import { IUserRepository } from '../interfaces/user.interface';
import { whatsappService } from '../services/whatsapp.service';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mwt-2026';
const prisma = new PrismaClient(); // Apenas para a checagem de banco vazio

export class AuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Verifica se é o Primeiro Acesso da plataforma.
   * Se não existir NENHUM usuário no banco, o primeiro WhatsApp cadastrado vira ADMIN.
   */
  async requestLogin(phoneWhats: string): Promise<{ message: string }> {
    const schema = z.string().min(10, 'Telefone inválido');
    const phone = schema.parse(phoneWhats);

    let user = await this.userRepository.findByPhoneWhats(phone);

    // Bootstrap (Primeiro Acesso Geral)
    if (!user) {
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        console.log(`[Auth] Bootstrap acionado! Cadastrando o dono da família (ADMIN): ${phone}`);
        user = await this.userRepository.create({
          phoneWhats: phone,
          role: 'ADMIN',
        });
      } else {
        // Se o banco não está vazio, é um cuidador tentando logar sem convite
        // Retornamos falso positivo pra não vazar informações, ou erro claro se preferir
        throw new Error('Número não cadastrado. Fale com o administrador da família.');
      }
    }

    // Gera um Magic Link Token válido por 15 minutos
    const magicToken = jwt.sign({ id: user.id, phoneWhats: user.phoneWhats }, JWT_SECRET, { expiresIn: '15m' });
    
    // Constrói o link
    const magicLink = `http://localhost:5173/auth/callback?token=${magicToken}`; // Mudar para o domínio oficial em prod

    // Mensagem
    let text = '';
    if (!user.name) {
      text = `👋 Olá! Bem-vindo(a) ao AgendaMed.\n\nPara finalizar o seu cadastro, clique no link seguro abaixo:\n\n🔗 ${magicLink}\n\nEste link expira em 15 minutos.`;
    } else {
      text = `👋 Olá, ${user.name}! Bem-vindo(a) de volta ao AgendaMed.\n\nPara acessar a sua conta, clique no link seguro abaixo:\n\n🔗 ${magicLink}\n\nEste link expira em 15 minutos.`;
    }

    // Dispara via Baileys
    const sent = await whatsappService.sendMessage(phone, text);
    
    if (!sent) {
      throw new Error('Falha ao enviar mensagem de WhatsApp. O serviço está conectado?');
    }

    return { message: 'Link mágico enviado para o WhatsApp.' };
  }

  /**
   * Valida o token mágico quando o usuário clica no link
   */
  async verifyMagicLink(token: string): Promise<{ user: any, accessToken: string }> {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      const user = await this.userRepository.findById(decoded.id);
      if (!user) throw new Error('Usuário não encontrado.');

      // Gera o Token Permanente/Longo (ex: 7 dias)
      const accessToken = jwt.sign(
        { id: user.id, role: user.role, phoneWhats: user.phoneWhats, needsOnboarding: !user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return { user, accessToken };
    } catch (err) {
      throw new Error('Link mágico inválido ou expirado.');
    }
  }
}
