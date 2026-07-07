import { FastifyInstance } from 'fastify';
import { MedicationUseCase } from '../usecases/medication.usecase';

export class MedicationRouter {
  constructor(private medicationUseCase: MedicationUseCase) {}

  register(app: FastifyInstance) {
    
    // ROTA: Criar Medicamento
    app.post('/api/medications', async (request, reply) => {
      try {
        const medication = await this.medicationUseCase.createMedication(request.body);
        return reply.status(201).send(medication);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : 404;
        return reply.status(statusCode).send({ error: error.message });
      }
    });

    // ROTA: Listar Medicamentos de um Paciente
    app.get('/api/patients/:patientId/medications', async (request, reply) => {
      try {
        const { patientId } = request.params as { patientId: string };
        const medications = await this.medicationUseCase.getMedicationsByPatientId(patientId);
        return reply.status(200).send(medications);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({ error: error.message });
      }
    });

    // ROTA: Obter Medicamento Específico
    app.get('/api/medications/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const medication = await this.medicationUseCase.getMedicationById(id);
        return reply.status(200).send(medication);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(404).send({ error: error.message });
      }
    });

    // ROTA: Atualizar Medicamento
    app.put('/api/medications/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const medication = await this.medicationUseCase.updateMedication(id, request.body);
        return reply.status(200).send(medication);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : 404;
        return reply.status(statusCode).send({ error: error.message });
      }
    });

    // ROTA: Deletar Medicamento
    app.delete('/api/medications/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        await this.medicationUseCase.deleteMedication(id);
        return reply.status(204).send();
      } catch (error: any) {
        app.log.error(error);
        return reply.status(404).send({ error: error.message });
      }
    });

  }
}
