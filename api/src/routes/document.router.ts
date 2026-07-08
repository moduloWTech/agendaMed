import { FastifyInstance } from 'fastify';
import { DocumentUseCase } from '../usecases/document.usecase';
import { authMiddleware } from '../middlewares/auth.middleware';

export class DocumentRouter {
  constructor(private documentUseCase: DocumentUseCase) {}

  register(app: FastifyInstance) {
    app.register(async (scopedApp) => {
      scopedApp.addHook('preHandler', authMiddleware);
      
      // ROTA: Criar Documento
      scopedApp.post('/api/documents', async (request, reply) => {
        try {
          const document = await this.documentUseCase.createDocument(request.body);
          return reply.status(201).send(document);
        } catch (error: any) {
          app.log.error(error);
          const statusCode = error.name === 'ZodError' ? 400 : 404;
          return reply.status(statusCode).send({ error: error.message });
        }
      });

      // ROTA: Listar Documentos de um Paciente
      scopedApp.get('/api/patients/:patientId/documents', async (request, reply) => {
        try {
          const { patientId } = request.params as { patientId: string };
          const documents = await this.documentUseCase.getDocumentsByPatientId(patientId);
          return reply.status(200).send(documents);
        } catch (error: any) {
          app.log.error(error);
          return reply.status(400).send({ error: error.message });
        }
      });

      // ROTA: Obter Documento Específico
      scopedApp.get('/api/documents/:id', async (request, reply) => {
        try {
          const { id } = request.params as { id: string };
          const document = await this.documentUseCase.getDocumentById(id);
          return reply.status(200).send(document);
        } catch (error: any) {
          app.log.error(error);
          return reply.status(404).send({ error: error.message });
        }
      });

      // ROTA: Atualizar Documento
      scopedApp.put('/api/documents/:id', async (request, reply) => {
        try {
          const { id } = request.params as { id: string };
          const document = await this.documentUseCase.updateDocument(id, request.body);
          return reply.status(200).send(document);
        } catch (error: any) {
          app.log.error(error);
          const statusCode = error.name === 'ZodError' ? 400 : 404;
          return reply.status(statusCode).send({ error: error.message });
        }
      });

      // ROTA: Deletar Documento
      scopedApp.delete('/api/documents/:id', async (request, reply) => {
        try {
          const { id } = request.params as { id: string };
          await this.documentUseCase.deleteDocument(id);
          return reply.status(204).send();
        } catch (error: any) {
          app.log.error(error);
          return reply.status(404).send({ error: error.message });
        }
      });
    });
  }
}
