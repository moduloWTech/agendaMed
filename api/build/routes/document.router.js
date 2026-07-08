"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRouter = void 0;
const auth_middleware_1 = require("../middlewares/auth.middleware");
class DocumentRouter {
    documentUseCase;
    constructor(documentUseCase) {
        this.documentUseCase = documentUseCase;
    }
    register(app) {
        app.register(async (scopedApp) => {
            scopedApp.addHook('preHandler', auth_middleware_1.authMiddleware);
            // ROTA: Criar Documento
            scopedApp.post('/api/documents', async (request, reply) => {
                try {
                    const document = await this.documentUseCase.createDocument(request.body);
                    return reply.status(201).send(document);
                }
                catch (error) {
                    app.log.error(error);
                    const statusCode = error.name === 'ZodError' ? 400 : 404;
                    return reply.status(statusCode).send({ error: error.message });
                }
            });
            // ROTA: Listar Documentos de um Paciente
            scopedApp.get('/api/patients/:patientId/documents', async (request, reply) => {
                try {
                    const { patientId } = request.params;
                    const documents = await this.documentUseCase.getDocumentsByPatientId(patientId);
                    return reply.status(200).send(documents);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(400).send({ error: error.message });
                }
            });
            // ROTA: Obter Documento Específico
            scopedApp.get('/api/documents/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    const document = await this.documentUseCase.getDocumentById(id);
                    return reply.status(200).send(document);
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(404).send({ error: error.message });
                }
            });
            // ROTA: Atualizar Documento
            scopedApp.put('/api/documents/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    const document = await this.documentUseCase.updateDocument(id, request.body);
                    return reply.status(200).send(document);
                }
                catch (error) {
                    app.log.error(error);
                    const statusCode = error.name === 'ZodError' ? 400 : 404;
                    return reply.status(statusCode).send({ error: error.message });
                }
            });
            // ROTA: Deletar Documento
            scopedApp.delete('/api/documents/:id', async (request, reply) => {
                try {
                    const { id } = request.params;
                    await this.documentUseCase.deleteDocument(id);
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
exports.DocumentRouter = DocumentRouter;
