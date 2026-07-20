import { FastifyInstance } from 'fastify';
import { MedicationUseCase } from '../usecases/medication.usecase';
import { authMiddleware } from '../middlewares/auth.middleware';

export class MedicationRouter {
  constructor(private medicationUseCase: MedicationUseCase) {}

  register(app: FastifyInstance) {
    app.register(async (scopedApp) => {
      scopedApp.addHook('preHandler', authMiddleware);
      
      // ROTA: Criar Medicamento
      scopedApp.post('/api/medications', async (request, reply) => {
        try {
          const tenantId = (request as any).user.tenantId;
          const medication = await this.medicationUseCase.createMedication(tenantId, request.body);
          return reply.status(201).send(medication);
        } catch (error: any) {
          app.log.error(error);
          const statusCode = error.name === 'ZodError' ? 400 : 404;
          return reply.status(statusCode).send({ error: error.message });
        }
      });

      // ROTA: Listar Medicamentos de um Paciente
      scopedApp.get('/api/patients/:patientId/medications', async (request, reply) => {
        try {
          const { patientId } = request.params as { patientId: string };
          const tenantId = (request as any).user.tenantId;
          const medications = await this.medicationUseCase.getMedicationsByPatientId(patientId, tenantId);
          return reply.status(200).send(medications);
        } catch (error: any) {
          app.log.error(error);
          return reply.status(400).send({ error: error.message });
        }
      });

      // ROTA: Obter Medicamento Específico
      scopedApp.get('/api/medications/:id', async (request, reply) => {
        try {
          const { id } = request.params as { id: string };
          const tenantId = (request as any).user.tenantId;
          const medication = await this.medicationUseCase.getMedicationById(id, tenantId);
          return reply.status(200).send(medication);
        } catch (error: any) {
          app.log.error(error);
          return reply.status(404).send({ error: error.message });
        }
      });

      // ROTA: Atualizar Medicamento (Apenas Admin)
      scopedApp.put('/api/medications/:id', async (request: any, reply) => {
        try {
          if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ error: 'Apenas administradores podem editar medicamentos.' });
          }
          const { id } = request.params as { id: string };
          const tenantId = (request as any).user.tenantId;
          const medication = await this.medicationUseCase.updateMedication(id, tenantId, request.body);
          return reply.status(200).send(medication);
        } catch (error: any) {
          app.log.error(error);
          const statusCode = error.name === 'ZodError' ? 400 : 404;
          return reply.status(statusCode).send({ error: error.message });
        }
      });

      // ROTA: Deletar Medicamento (Apenas Admin)
      scopedApp.delete('/api/medications/:id', async (request: any, reply) => {
        try {
          if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ error: 'Apenas administradores podem excluir medicamentos.' });
          }
          const { id } = request.params as { id: string };
          const tenantId = (request as any).user.tenantId;
          await this.medicationUseCase.deleteMedication(id, tenantId);
          return reply.status(204).send();
        } catch (error: any) {
          app.log.error(error);
          return reply.status(404).send({ error: error.message });
        }
      });

      // ROTA: Obter Histórico de Medicamentos
      scopedApp.get('/api/patients/:patientId/medications/history', async (request: any, reply) => {
        try {
          const { patientId } = request.params as { patientId: string };
          const { date } = request.query as { date: string };
          const tenantId = (request as any).user.tenantId;
          if (!date) return reply.status(400).send({ error: 'Data é obrigatória (date=YYYY-MM-DD)' });

          const history = await this.medicationUseCase.getHistory(patientId, date, tenantId);
          return reply.status(200).send(history);
        } catch (error: any) {
          app.log.error(error);
          return reply.status(400).send({ error: error.message });
        }
      });

      // ROTA: Alternar Check-in (Fazer/Desfazer)
      scopedApp.post('/api/medications/history/toggle', async (request: any, reply) => {
        try {
          const userId = request.user.id;
          const tenantId = request.user.tenantId;
          await this.medicationUseCase.toggleCheckin(userId, tenantId, request.body);
          return reply.status(200).send({ success: true });
        } catch (error: any) {
          app.log.error(error);
          return reply.status(400).send({ error: error.message });
        }
      });
    });
  }
}
