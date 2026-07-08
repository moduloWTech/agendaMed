import { FastifyInstance } from 'fastify';
import { AppointmentUseCase } from '../usecases/appointment.usecase';
import { authMiddleware } from '../middlewares/auth.middleware';

export class AppointmentRouter {
  constructor(private appointmentUseCase: AppointmentUseCase) {}

  register(app: FastifyInstance) {
    app.register(async (scopedApp) => {
      scopedApp.addHook('preHandler', authMiddleware);
      
      scopedApp.post('/api/appointments', async (request, reply) => {
        try {
          const appointment = await this.appointmentUseCase.createAppointment(request.body);
          return reply.status(201).send(appointment);
        } catch (error: any) {
          app.log.error(error);
          const statusCode = error.name === 'ZodError' ? 400 : 404;
          return reply.status(statusCode).send({ error: error.message });
        }
      });

      scopedApp.get('/api/patients/:patientId/appointments', async (request, reply) => {
        try {
          const { patientId } = request.params as { patientId: string };
          const appointments = await this.appointmentUseCase.getAppointmentsByPatient(patientId);
          return reply.status(200).send(appointments);
        } catch (error: any) {
          app.log.error(error);
          return reply.status(400).send({ error: error.message });
        }
      });

      scopedApp.get('/api/appointments/:id', async (request, reply) => {
        try {
          const { id } = request.params as { id: string };
          const appointment = await this.appointmentUseCase.getAppointmentById(id);
          return reply.status(200).send(appointment);
        } catch (error: any) {
          app.log.error(error);
          return reply.status(404).send({ error: error.message });
        }
      });

      scopedApp.put('/api/appointments/:id', async (request, reply) => {
        try {
          const { id } = request.params as { id: string };
          const appointment = await this.appointmentUseCase.updateAppointment(id, request.body);
          return reply.status(200).send(appointment);
        } catch (error: any) {
          app.log.error(error);
          const statusCode = error.name === 'ZodError' ? 400 : 404;
          return reply.status(statusCode).send({ error: error.message });
        }
      });

      scopedApp.delete('/api/appointments/:id', async (request, reply) => {
        try {
          const { id } = request.params as { id: string };
          await this.appointmentUseCase.deleteAppointment(id);
          return reply.status(204).send();
        } catch (error: any) {
          app.log.error(error);
          return reply.status(404).send({ error: error.message });
        }
      });
    });
  }
}
