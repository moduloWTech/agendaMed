import { FastifyInstance } from 'fastify';
import { AuthUseCase } from '../usecases/auth.usecase';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthRouter {
  constructor(private authUseCase: AuthUseCase) {}

  register(app: FastifyInstance) {
    // 0. Checagem de Setup do Sistema
    app.get('/api/system/setup-status', async (request, reply) => {
      try {
        const userCount = await prisma.user.count();
        return reply.status(200).send({ isSetup: userCount > 0 });
      } catch (error: any) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro ao checar status do sistema' });
      }
    });

    // 1. O usuário digita o número e solicita o link
    app.post('/api/auth/request-link', async (request, reply) => {
      try {
        const { phoneWhats } = request.body as { phoneWhats: string };
        const result = await this.authUseCase.requestLogin(phoneWhats);
        return reply.status(200).send(result);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({ error: error.message });
      }
    });

    // 1.5. Configura o admin inicial quando o banco está vazio
    app.post('/api/auth/setup-admin', async (request, reply) => {
      try {
        const result = await this.authUseCase.setupAdmin(request.body);
        return reply.status(201).send(result);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({ error: error.message });
      }
    });

    // 2. O usuário clicou no link recebido no zap e o frontend repassa pra cá
    app.post('/api/auth/verify-link', async (request, reply) => {
      try {
        const { token } = request.body as { token: string };
        const result = await this.authUseCase.verifyMagicLink(token);
        return reply.status(200).send(result);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(401).send({ error: error.message });
      }
    });
  }
}
