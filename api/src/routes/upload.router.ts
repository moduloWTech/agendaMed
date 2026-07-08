import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UploadFileUseCase } from '../usecases/upload/UploadFileUseCase';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function uploadRoutes(app: FastifyInstance) {
  const uploadFileUseCase = new UploadFileUseCase();

  // POST /api/upload
  app.post(
    '/',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
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
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );
}
