import { FastifyInstance } from 'fastify';
import { AuthUseCase } from '../usecases/auth.usecase';

export class AuthRouter {
  constructor(private authUseCase: AuthUseCase) {}

  register(app: FastifyInstance) {
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
