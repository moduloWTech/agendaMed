"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
class AuthRouter {
    authUseCase;
    constructor(authUseCase) {
        this.authUseCase = authUseCase;
    }
    register(app) {
        // 0. Checagem de Setup do Sistema (Sempre true no modo B2C)
        app.get('/api/system/setup-status', async (request, reply) => {
            return reply.status(200).send({ isSetup: true });
        });
        // 1. Registro B2C
        app.post('/api/auth/register', async (request, reply) => {
            try {
                const result = await this.authUseCase.register(request.body);
                return reply.status(201).send(result);
            }
            catch (error) {
                app.log.error(error);
                const statusCode = error.name === 'ZodError' ? 400 : 409;
                return reply.status(statusCode).send({ error: error.message });
            }
        });
        // 2. Login B2C com Email e Senha
        app.post('/api/auth/login', async (request, reply) => {
            try {
                const result = await this.authUseCase.login(request.body);
                return reply.status(200).send(result);
            }
            catch (error) {
                app.log.error(error);
                return reply.status(401).send({ error: error.message });
            }
        });
        // 2.5 Login B2C com Google
        app.post('/api/auth/google', async (request, reply) => {
            try {
                const body = request.body;
                if (!body.credential) {
                    throw new Error('Credential ausente.');
                }
                const result = await this.authUseCase.loginWithGoogle(body.credential);
                return reply.status(200).send(result);
            }
            catch (error) {
                app.log.error(error);
                return reply.status(401).send({ error: error.message });
            }
        });
        // 3. Aceitar Convite (Cuidador)
        app.post('/api/auth/accept-invite', async (request, reply) => {
            try {
                const result = await this.authUseCase.acceptInvite(request.body);
                return reply.status(201).send(result);
            }
            catch (error) {
                app.log.error(error);
                const statusCode = error.name === 'ZodError' ? 400 : 409;
                return reply.status(statusCode).send({ error: error.message });
            }
        });
    }
}
exports.AuthRouter = AuthRouter;
