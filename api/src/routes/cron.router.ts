import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ICronUseCase } from '../interfaces/cron.interface';

export class CronRouter {
  constructor(private cronUseCase: ICronUseCase) {}

  public register(app: FastifyInstance) {
    const handler = async (request: FastifyRequest, reply: FastifyReply) => {
      // 1. Extração de parâmetros HTTP (A rota apenas recebe e repassa ao UseCase)
      const headerSecret = request.headers['x-cron-secret'] as string | undefined;
      const authHeader = request.headers['authorization'];
      const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
      const query = request.query as { secret?: string };

      const providedSecret = headerSecret || bearerSecret || query?.secret;

      // 2. Execução do UseCase de Verificação de Medicamentos
      try {
        const report = await this.cronUseCase.execute({ providedSecret });

        if (!report.success) {
          app.log.error(report.message);
          return reply.status(500).send(report);
        }

        return reply.status(200).send(report);
      } catch (error: any) {
        app.log.error(error);
        const isUnauthorized = error.message?.includes('Acesso não autorizado');

        return reply.status(isUnauthorized ? 401 : 500).send({
          success: false,
          error: error.message || 'Falha interna ao processar verificação de medicamentos.',
        });
      }
    };

    // Suporta tanto GET quanto POST para compatibilidade total com o Cloud Scheduler
    app.get('/api/cron/check-medications', handler);
    app.post('/api/cron/check-medications', handler);
  }
}
