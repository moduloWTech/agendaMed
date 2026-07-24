"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationRouter = void 0;
const auth_middleware_1 = require("../middlewares/auth.middleware");
class MedicationRouter {
    medicationUseCase;
    constructor(medicationUseCase) {
        this.medicationUseCase = medicationUseCase;
    }
    register(app) {
        app.register(async (scopedApp) => {
            scopedApp.addHook('preHandler', auth_middleware_1.authMiddleware);
            // ROTA: Criar Medicamento
            scopedApp.post('/api/medications', async (request, reply) => {
                try {
                    const tenantId = request.user.tenantId;
                    const medication = await this.medicationUseCase.createMedication(tenantId, request.body);
                    return reply.status(201).send(medication);
                }
                catch (error) {
                    app.log.error(error);
                    const statusCode = error.name === 'ZodError' ? 400 : 404;
                    return reply.status(statusCode).send({ error: error.message });
                }
            });
            // ROTA: Listar Medicamentos de um Paciente
            scopedApp.get('/api/patients/:patientId/medications', async (request, reply) => {
                try {
                    const { patientId } = request.params;
                    const tenantId = request.user.tenantId;
                    const medications = await this.medicationUseCase.getMedicationsByPatientId(patientId, tenantId);
                    return reply.status(200).send(medications);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(400).send({ error: error.message });
                }
            });
            // ROTA: Obter Medicamento Específico
            scopedApp.get('/api/medications/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    const tenantId = request.user.tenantId;
                    const medication = await this.medicationUseCase.getMedicationById(id, tenantId);
                    return reply.status(200).send(medication);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(404).send({ error: error.message });
                }
            });
            // ROTA: Atualizar Medicamento (Apenas Admin)
            scopedApp.put('/api/medications/:id', async (request, reply) => {
                try {
                    if (request.user.role !== 'ADMIN') {
                        return reply.status(403).send({ error: 'Apenas administradores podem editar medicamentos.' });
                    }
                    const { id } = request.params;
                    const tenantId = request.user.tenantId;
                    const medication = await this.medicationUseCase.updateMedication(id, tenantId, request.body);
                    return reply.status(200).send(medication);
                }
                catch (error) {
                    app.log.error(error);
                    const statusCode = error.name === 'ZodError' ? 400 : 404;
                    return reply.status(statusCode).send({ error: error.message });
                }
            });
            // ROTA: Deletar Medicamento (Apenas Admin)
            scopedApp.delete('/api/medications/:id', async (request, reply) => {
                try {
                    if (request.user.role !== 'ADMIN') {
                        return reply.status(403).send({ error: 'Apenas administradores podem excluir medicamentos.' });
                    }
                    const { id } = request.params;
                    const tenantId = request.user.tenantId;
                    await this.medicationUseCase.deleteMedication(id, tenantId);
                    return reply.status(204).send();
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(404).send({ error: error.message });
                }
            });
            // ROTA: Obter Histórico de Medicamentos
            scopedApp.get('/api/patients/:patientId/medications/history', async (request, reply) => {
                try {
                    const { patientId } = request.params;
                    const { date } = request.query;
                    const tenantId = request.user.tenantId;
                    if (!date)
                        return reply.status(400).send({ error: 'Data é obrigatória (date=YYYY-MM-DD)' });
                    const history = await this.medicationUseCase.getHistory(patientId, date, tenantId);
                    return reply.status(200).send(history);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(400).send({ error: error.message });
                }
            });
            // ROTA: Alternar Check-in (Fazer/Desfazer)
            scopedApp.post('/api/medications/history/toggle', async (request, reply) => {
                try {
                    const userId = request.user.id;
                    const tenantId = request.user.tenantId;
                    await this.medicationUseCase.toggleCheckin(userId, tenantId, request.body);
                    return reply.status(200).send({ success: true });
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(400).send({ error: error.message });
                }
            });
        });
    }
}
exports.MedicationRouter = MedicationRouter;
