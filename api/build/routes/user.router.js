"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const auth_middleware_1 = require("../middlewares/auth.middleware");
class UserRouter {
    userUseCase;
    constructor(userUseCase) {
        this.userUseCase = userUseCase;
    }
    register(app) {
        // ROTA: Criar Usuário (pública, usada pelo webhooks/admin setup)
        app.post('/api/users', async (request, reply) => {
            try {
                const user = await this.userUseCase.createUser(request.body);
                return reply.status(201).send(user);
            }
            catch (error) {
                app.log.error(error);
                const statusCode = error.name === 'ZodError' ? 400 : 409;
                return reply.status(statusCode).send({ error: error.message || 'Erro interno ao criar usuário' });
            }
        });
        // ROTA: Convidar Cuidador (Protegida)
        app.post('/api/users/invite', { preHandler: [auth_middleware_1.authMiddleware] }, async (request, reply) => {
            try {
                const adminId = request.user.id; // Correção: O payload do JWT salva como "id" e não "userId"
                const user = await this.userUseCase.inviteCaregiver(adminId, request.body);
                return reply.status(201).send(user);
            }
            catch (error) {
                app.log.error(error);
                const statusCode = error.name === 'ZodError' ? 400 : 400;
                return reply.status(statusCode).send({ error: error.message });
            }
        });
        // ROTA: Listar Cuidadores de um Paciente (Protegida)
        app.get('/api/users/family/:patientId', { preHandler: [auth_middleware_1.authMiddleware] }, async (request, reply) => {
            try {
                const { patientId } = request.params;
                const tenantId = request.user.tenantId;
                const users = await this.userUseCase.getCaregivers(patientId, tenantId);
                return reply.status(200).send(users);
            }
            catch (error) {
                app.log.error(error);
                return reply.status(404).send({ error: error.message });
            }
        });
        // ROTA: Obter Usuário (Protegida)
        app.get('/api/users/:id', { preHandler: [auth_middleware_1.authMiddleware] }, async (request, reply) => {
            try {
                const { id } = request.params;
                const tenantId = request.user.tenantId;
                const user = await this.userUseCase.getUserById(id, tenantId);
                return reply.status(200).send(user);
            }
            catch (error) {
                app.log.error(error);
                return reply.status(404).send({ error: error.message });
            }
        });
        // ROTA: Atualizar Usuário (Protegida)
        app.put('/api/users/:id', { preHandler: [auth_middleware_1.authMiddleware] }, async (request, reply) => {
            try {
                const { id } = request.params;
                const tenantId = request.user.tenantId;
                const user = await this.userUseCase.updateUser(id, request.body, tenantId);
                return reply.status(200).send(user);
            }
            catch (error) {
                app.log.error(error);
                const statusCode = error.name === 'ZodError' ? 400 : 404;
                return reply.status(statusCode).send({ error: error.message });
            }
        });
        // ROTA: Atualizar Preferências (Protegida)
        app.patch('/api/users/:id/preferences', { preHandler: [auth_middleware_1.authMiddleware] }, async (request, reply) => {
            try {
                const { id } = request.params;
                const userIdFromToken = request.user.id;
                if (id !== userIdFromToken) {
                    return reply.status(403).send({ error: 'Você só pode alterar suas próprias preferências.' });
                }
                const user = await this.userUseCase.updatePreferences(id, request.body);
                return reply.status(200).send(user);
            }
            catch (error) {
                app.log.error(error);
                const statusCode = error.name === 'ZodError' ? 400 : 400;
                return reply.status(statusCode).send({ error: error.message });
            }
        });
        // ROTA: Deletar Usuário (Protegida)
        app.delete('/api/users/:id', { preHandler: [auth_middleware_1.authMiddleware] }, async (request, reply) => {
            try {
                const { id } = request.params;
                const tenantId = request.user.tenantId;
                await this.userUseCase.deleteUser(id, tenantId);
                return reply.status(204).send(); // 204 No Content
            }
            catch (error) {
                app.log.error(error);
                return reply.status(404).send({ error: error.message });
            }
        });
        // ROTA: Alterar cargo do usuário (Protegida, apenas ADMIN)
        app.patch('/api/users/:id/role', { preHandler: [auth_middleware_1.authMiddleware] }, async (request, reply) => {
            try {
                const adminId = request.user.id;
                const targetUserId = request.params.id;
                const { role } = request.body;
                const updatedUser = await this.userUseCase.changeUserRole(adminId, targetUserId, role);
                return reply.status(200).send(updatedUser);
            }
            catch (error) {
                app.log.error(error);
                const statusCode = error.name === 'ZodError' ? 400 : (error.message.includes('Apenas admin') ? 403 : 400);
                return reply.status(statusCode).send({ error: error.message });
            }
        });
    }
}
exports.UserRouter = UserRouter;
