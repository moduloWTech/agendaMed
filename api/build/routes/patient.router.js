"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientRouter = void 0;
const auth_middleware_1 = require("../middlewares/auth.middleware");
class PatientRouter {
    patientUseCase;
    constructor(patientUseCase) {
        this.patientUseCase = patientUseCase;
    }
    register(app) {
        app.register(async (scopedApp) => {
            // Aplica o middleware apenas nestas rotas de pacientes
            scopedApp.addHook('preHandler', auth_middleware_1.authMiddleware);
            // ROTA: Criar Paciente
            scopedApp.post('/api/patients', async (request, reply) => {
                try {
                    const patient = await this.patientUseCase.createPatient(request.body);
                    return reply.status(201).send(patient);
                }
                catch (error) {
                    app.log.error(error);
                    const statusCode = error.name === 'ZodError' ? 400 : 404;
                    return reply.status(statusCode).send({ error: error.message || 'Erro ao criar paciente' });
                }
            });
            // ROTA: Listar Pacientes de um Cuidador (User)
            scopedApp.get('/api/users/:userId/patients', async (request, reply) => {
                try {
                    const { userId } = request.params;
                    const patients = await this.patientUseCase.getPatientsByUserId(userId);
                    return reply.status(200).send(patients);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(400).send({ error: error.message });
                }
            });
            // ROTA: Obter Paciente Específico
            scopedApp.get('/api/patients/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    const patient = await this.patientUseCase.getPatientById(id);
                    return reply.status(200).send(patient);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(404).send({ error: error.message });
                }
            });
            // ROTA: Atualizar Paciente
            scopedApp.put('/api/patients/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    const patient = await this.patientUseCase.updatePatient(id, request.body);
                    return reply.status(200).send(patient);
                }
                catch (error) {
                    app.log.error(error);
                    const statusCode = error.name === 'ZodError' ? 400 : 404;
                    return reply.status(statusCode).send({ error: error.message });
                }
            });
            // ROTA: Deletar Paciente
            scopedApp.delete('/api/patients/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    await this.patientUseCase.deletePatient(id);
                    return reply.status(204).send(); // 204 No Content
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(404).send({ error: error.message });
                }
            });
        });
    }
}
exports.PatientRouter = PatientRouter;
