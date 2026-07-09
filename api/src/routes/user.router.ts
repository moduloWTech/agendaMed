import { FastifyInstance } from 'fastify';
import { UserUseCase } from '../usecases/user.usecase';
import { authMiddleware } from '../middlewares/auth.middleware';
export class UserRouter {
  constructor(private userUseCase: UserUseCase) {}

  register(app: FastifyInstance) {
    
    // ROTA: Criar Usuário (pública, usada pelo webhooks/admin setup)
    app.post('/api/users', async (request, reply) => {
      try {
        const user = await this.userUseCase.createUser(request.body);
        return reply.status(201).send(user);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : 409;
        return reply.status(statusCode).send({ error: error.message || 'Erro interno ao criar usuário' });
      }
    });

    // ROTA: Convidar Cuidador (Protegida)
    app.post('/api/users/invite', { preHandler: [authMiddleware] }, async (request: any, reply) => {
      try {
        const adminId = request.user.id; // Correção: O payload do JWT salva como "id" e não "userId"
        const user = await this.userUseCase.inviteCaregiver(adminId, request.body);
        return reply.status(201).send(user);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : 400;
        return reply.status(statusCode).send({ error: error.message });
      }
    });

    // ROTA: Listar Cuidadores de um Paciente (Protegida)
    app.get('/api/users/family/:patientId', { preHandler: [authMiddleware] }, async (request, reply) => {
      try {
        const { patientId } = request.params as { patientId: string };
        const users = await this.userUseCase.getCaregivers(patientId);
        return reply.status(200).send(users);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(404).send({ error: error.message });
      }
    });

    // ROTA: Obter Usuário
    app.get('/api/users/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const user = await this.userUseCase.getUserById(id);
        return reply.status(200).send(user);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(404).send({ error: error.message });
      }
    });

    // ROTA: Atualizar Usuário
    app.put('/api/users/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const user = await this.userUseCase.updateUser(id, request.body);
        return reply.status(200).send(user);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : 404;
        return reply.status(statusCode).send({ error: error.message });
      }
    });

    // ROTA: Deletar Usuário
    app.delete('/api/users/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        await this.userUseCase.deleteUser(id);
        return reply.status(204).send(); // 204 No Content
      } catch (error: any) {
        app.log.error(error);
        return reply.status(404).send({ error: error.message });
      }
    });

  }
}
