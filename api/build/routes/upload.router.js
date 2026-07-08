"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = uploadRoutes;
const UploadFileUseCase_1 = require("../usecases/upload/UploadFileUseCase");
const auth_middleware_1 = require("../middlewares/auth.middleware");
async function uploadRoutes(app) {
    const uploadFileUseCase = new UploadFileUseCase_1.UploadFileUseCase();
    // POST /api/upload
    app.post('/', { preHandler: [auth_middleware_1.authMiddleware] }, async (request, reply) => {
        const data = await request.file();
        if (!data) {
            return reply.status(400).send({ error: 'Nenhum arquivo enviado.' });
        }
        // Converte o arquivo do formato stream do Fastify Multipart para um Buffer completo
        const buffer = await data.toBuffer();
        try {
            const { fileUrl } = await uploadFileUseCase.execute({
                filename: data.filename,
                mimetype: data.mimetype,
                buffer,
            });
            return reply.status(200).send({ fileUrl });
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    });
}
