import { FastifyInstance } from 'fastify';
import { pushService } from '../services/push.service';
import { authMiddleware } from '../middlewares/auth.middleware';

export class PushRouter {
  public register(app: FastifyInstance) {
    app.register(async (scopedApp) => {
      // Aplicamos o middleware de autenticação em todas as rotas deste plugin
      scopedApp.addHook('preHandler', authMiddleware);

      scopedApp.post('/api/push/subscribe', async (request: any, reply) => {
        try {
          const userId = request.user.id;
          const subscription = request.body;
          
          await pushService.saveSubscription(userId, subscription);
          return reply.status(200).send({ success: true });
        } catch (error: any) {
          app.log.error(error);
          return reply.status(400).send({ error: error.message });
        }
      });
    });
  }
}
