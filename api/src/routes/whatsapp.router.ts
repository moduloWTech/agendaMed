import { FastifyInstance } from 'fastify';
// import { whatsappService } from '../services/whatsapp.service';

export class WhatsappRouter {
  register(app: FastifyInstance) {
    // Rota que retorna o status da conexão e o QR Code, se houver
    /* app.get('/api/whatsapp/status', async (request, reply) => {
      try {
        const status = whatsappService.getStatus();
        return reply.status(200).send(status);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Falha ao buscar status do WhatsApp' });
      }
    }); */
  }
}
