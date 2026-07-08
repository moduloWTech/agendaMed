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
                    const medication = await this.medicationUseCase.createMedication(request.body);
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
                    const medications = await this.medicationUseCase.getMedicationsByPatientId(patientId);
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
                    const medication = await this.medicationUseCase.getMedicationById(id);
                    return reply.status(200).send(medication);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(404).send({ error: error.message });
                }
            });
            // ROTA: Atualizar Medicamento
            scopedApp.put('/api/medications/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    const medication = await this.medicationUseCase.updateMedication(id, request.body);
                    return reply.status(200).send(medication);
                }
                catch (error) {
                    app.log.error(error);
                    const statusCode = error.name === 'ZodError' ? 400 : 404;
                    return reply.status(statusCode).send({ error: error.message });
                }
            });
            // ROTA: Deletar Medicamento
            scopedApp.delete('/api/medications/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    await this.medicationUseCase.deleteMedication(id);
                    return reply.status(204).send();
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(404).send({ error: error.message });
                }
            });
        });
    }
}
exports.MedicationRouter = MedicationRouter;
