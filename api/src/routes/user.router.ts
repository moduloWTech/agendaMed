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
        const adminId = request.user.id || request.user.userId;
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
        const tenantId = (request as any).user.tenantId;
        const users = await this.userUseCase.getCaregivers(patientId, tenantId);
        return reply.status(200).send(users);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(404).send({ error: error.message });
      }
    });

    // ROTA: Obter Usuário (Protegida)
    app.get('/api/users/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const tenantId = (request as any).user.tenantId;
        const user = await this.userUseCase.getUserById(id, tenantId);
        return reply.status(200).send(user);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(404).send({ error: error.message });
      }
    });

    // ROTA: Atualizar Usuário (Protegida)
    app.put('/api/users/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const tenantId = (request as any).user.tenantId;
        const user = await this.userUseCase.updateUser(id, request.body, tenantId);
        return reply.status(200).send(user);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : 404;
        return reply.status(statusCode).send({ error: error.message });
      }
    });

    // ROTA: Atualizar Preferências (Protegida)
    app.patch('/api/users/:id/preferences', { preHandler: [authMiddleware] }, async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const userIdFromToken = (request as any).user.id || (request as any).user.userId;
        
        if (id !== userIdFromToken) {
          return reply.status(403).send({ error: 'Você só pode alterar suas próprias preferências.' });
        }

        const user = await this.userUseCase.updatePreferences(id, request.body);
        return reply.status(200).send(user);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : 400;
        return reply.status(statusCode).send({ error: error.message });
      }
    });

    // ROTA: Deletar Usuário (Protegida)
    app.delete('/api/users/:id', { preHandler: [authMiddleware] }, async (request: any, reply) => {
      try {
        const targetUserId = request.params.id;
        const requesterId = request.user?.id || request.user?.userId;
        const tenantId = request.user?.tenantId;
        await this.userUseCase.deleteUser(requesterId, targetUserId, tenantId);
        return reply.status(204).send(); // 204 No Content
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.message?.includes('Apenas') || error.message?.includes('negado') ? 403 : 400;
        return reply.status(statusCode).send({ error: error.message || 'Erro ao remover cuidador' });
      }
    });

    // ROTA: Alterar cargo do usuário (Protegida, apenas ADMIN)
    app.patch('/api/users/:id/role', { preHandler: [authMiddleware] }, async (request: any, reply) => {
      try {
        const adminId = request.user?.id || request.user?.userId;
        const targetUserId = request.params.id;
        const { role } = request.body;
        
        const updatedUser = await this.userUseCase.changeUserRole(adminId, targetUserId, role);
        return reply.status(200).send(updatedUser);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : (error.message?.includes('Apenas') ? 403 : 400);
        return reply.status(statusCode).send({ error: error.message });
      }
    });

  }
}
