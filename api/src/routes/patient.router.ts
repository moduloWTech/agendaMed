import { FastifyInstance } from 'fastify';
import { PatientUseCase } from '../usecases/patient.usecase';

export class PatientRouter {
  constructor(private patientUseCase: PatientUseCase) {}

  register(app: FastifyInstance) {
    
    // ROTA: Criar Paciente
    app.post('/api/patients', async (request, reply) => {
      try {
        const patient = await this.patientUseCase.createPatient(request.body);
        return reply.status(201).send(patient);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : 404;
        return reply.status(statusCode).send({ error: error.message || 'Erro ao criar paciente' });
      }
    });

    // ROTA: Listar Pacientes de um Cuidador (User)
    app.get('/api/users/:userId/patients', async (request, reply) => {
      try {
        const { userId } = request.params as { userId: string };
        const patients = await this.patientUseCase.getPatientsByUserId(userId);
        return reply.status(200).send(patients);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({ error: error.message });
      }
    });

    // ROTA: Obter Paciente Específico
    app.get('/api/patients/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const patient = await this.patientUseCase.getPatientById(id);
        return reply.status(200).send(patient);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(404).send({ error: error.message });
      }
    });

    // ROTA: Atualizar Paciente
    app.put('/api/patients/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const patient = await this.patientUseCase.updatePatient(id, request.body);
        return reply.status(200).send(patient);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : 404;
        return reply.status(statusCode).send({ error: error.message });
      }
    });

    // ROTA: Deletar Paciente
    app.delete('/api/patients/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        await this.patientUseCase.deletePatient(id);
        return reply.status(204).send(); // 204 No Content
      } catch (error: any) {
        app.log.error(error);
        return reply.status(404).send({ error: error.message });
      }
    });

  }
}
