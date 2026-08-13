import { FastifyInstance } from 'fastify';
import { PatientUseCase } from '../usecases/patient.usecase';
import { authMiddleware } from '../middlewares/auth.middleware';

export class PatientRouter {
  constructor(private patientUseCase: PatientUseCase) {}

  register(app: FastifyInstance) {
    app.register(async (scopedApp) => {
      // Aplica o middleware apenas nestas rotas de pacientes
      scopedApp.addHook('preHandler', authMiddleware);
      
      // ROTA: Criar Paciente
      scopedApp.post('/api/patients', async (request, reply) => {
      try {
        const payload = { ...request.body as object, tenantId: (request as any).user.tenantId };
        const patient = await this.patientUseCase.createPatient(payload);
        return reply.status(201).send(patient);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : 404;
        return reply.status(statusCode).send({ error: error.message || 'Erro ao criar paciente' });
      }
    });

    // ROTA: Listar Pacientes do Tenant Atual
    scopedApp.get('/api/patients', async (request, reply) => {
      try {
        const tenantId = (request as any).user.tenantId;
        const patients = await this.patientUseCase.getPatientsByTenantId(tenantId);
        return reply.status(200).send(patients);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({ error: error.message });
      }
    });

    // ROTA: Obter Dados do Relatório de Saúde do Paciente
    scopedApp.get('/api/patients/:id/report-data', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };
        const tenantId = (request as any).user.tenantId;
        const reportData = await this.patientUseCase.getReportData(id, tenantId, startDate, endDate);
        return reply.status(200).send(reportData);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({ error: error.message || 'Erro ao gerar dados do relatório' });
      }
    });

    // ROTA: Obter Paciente Específico
    scopedApp.get('/api/patients/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const tenantId = (request as any).user.tenantId;
        const patient = await this.patientUseCase.getPatientById(id, tenantId);
        return reply.status(200).send(patient);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(404).send({ error: error.message });
      }
    });

    // ROTA: Atualizar Paciente
    scopedApp.put('/api/patients/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const tenantId = (request as any).user.tenantId;
        const patient = await this.patientUseCase.updatePatient(id, tenantId, request.body);
        return reply.status(200).send(patient);
      } catch (error: any) {
        app.log.error(error);
        const statusCode = error.name === 'ZodError' ? 400 : 404;
        return reply.status(statusCode).send({ error: error.message });
      }
    });

    // ROTA: Deletar Paciente
    scopedApp.delete('/api/patients/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const tenantId = (request as any).user.tenantId;
        await this.patientUseCase.deletePatient(id, tenantId);
        return reply.status(204).send(); // 204 No Content
      } catch (error: any) {
        app.log.error(error);
        return reply.status(404).send({ error: error.message });
      }
    });

    });
  }
}
