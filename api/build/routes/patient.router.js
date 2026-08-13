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
                    const payload = { ...request.body, tenantId: request.user.tenantId };
                    const patient = await this.patientUseCase.createPatient(payload);
                    return reply.status(201).send(patient);
                }
                catch (error) {
                    app.log.error(error);
                    const statusCode = error.name === 'ZodError' ? 400 : 404;
                    return reply.status(statusCode).send({ error: error.message || 'Erro ao criar paciente' });
                }
            });
            // ROTA: Listar Pacientes do Tenant Atual
            scopedApp.get('/api/patients', async (request, reply) => {
                try {
                    const tenantId = request.user.tenantId;
                    const patients = await this.patientUseCase.getPatientsByTenantId(tenantId);
                    return reply.status(200).send(patients);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(400).send({ error: error.message });
                }
            });
            // ROTA: Obter Dados do Relatório de Saúde do Paciente
            scopedApp.get('/api/patients/:id/report-data', async (request, reply) => {
                try {
                    const { id } = request.params;
                    const { startDate, endDate } = request.query;
                    const tenantId = request.user.tenantId;
                    const reportData = await this.patientUseCase.getReportData(id, tenantId, startDate, endDate);
                    return reply.status(200).send(reportData);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(400).send({ error: error.message || 'Erro ao gerar dados do relatório' });
                }
            });
            // ROTA: Obter Paciente Específico
            scopedApp.get('/api/patients/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    const tenantId = request.user.tenantId;
                    const patient = await this.patientUseCase.getPatientById(id, tenantId);
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
                    const tenantId = request.user.tenantId;
                    const patient = await this.patientUseCase.updatePatient(id, tenantId, request.body);
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
                    const tenantId = request.user.tenantId;
                    await this.patientUseCase.deletePatient(id, tenantId);
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
