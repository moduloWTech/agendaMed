"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRouter = void 0;
const auth_middleware_1 = require("../middlewares/auth.middleware");
class AppointmentRouter {
    appointmentUseCase;
    constructor(appointmentUseCase) {
        this.appointmentUseCase = appointmentUseCase;
    }
    register(app) {
        app.register(async (scopedApp) => {
            scopedApp.addHook('preHandler', auth_middleware_1.authMiddleware);
            scopedApp.post('/api/appointments', async (request, reply) => {
                try {
                    const tenantId = request.user.tenantId;
                    const appointment = await this.appointmentUseCase.createAppointment(tenantId, request.body);
                    return reply.status(201).send(appointment);
                }
                catch (error) {
                    app.log.error(error);
                    const statusCode = error.name === 'ZodError' ? 400 : 404;
                    return reply.status(statusCode).send({ error: error.message });
                }
            });
            scopedApp.get('/api/patients/:patientId/appointments', async (request, reply) => {
                try {
                    const { patientId } = request.params;
                    const tenantId = request.user.tenantId;
                    const appointments = await this.appointmentUseCase.getAppointmentsByPatient(patientId, tenantId);
                    return reply.status(200).send(appointments);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(400).send({ error: error.message });
                }
            });
            scopedApp.get('/api/appointments/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    const tenantId = request.user.tenantId;
                    const appointment = await this.appointmentUseCase.getAppointmentById(id, tenantId);
                    return reply.status(200).send(appointment);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(404).send({ error: error.message });
                }
            });
            scopedApp.put('/api/appointments/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    const tenantId = request.user.tenantId;
                    const appointment = await this.appointmentUseCase.updateAppointment(id, tenantId, request.body);
                    return reply.status(200).send(appointment);
                }
                catch (error) {
                    app.log.error(error);
                    const statusCode = error.name === 'ZodError' ? 400 : 404;
                    return reply.status(statusCode).send({ error: error.message });
                }
            });
            scopedApp.delete('/api/appointments/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    const tenantId = request.user.tenantId;
                    await this.appointmentUseCase.deleteAppointment(id, tenantId);
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
exports.AppointmentRouter = AppointmentRouter;
