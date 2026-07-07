import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

export class App {
  private app: FastifyInstance;
  public PORT: number;

  constructor() {
    this.app = fastify({
      logger: true,
    });
    this.PORT = process.env.PORT ? Number(process.env.PORT) : 3333;
  }

  public getServer(): FastifyInstance {
    return this.app;
  }

  public async listen() {
    try {
      await this.app.listen({
        host: '0.0.0.0',
        port: this.PORT,
      });
      console.log(`🚀 Backend rodando na porta ${this.PORT}`);
    } catch (err) {
      this.app.log.error(err);
      process.exit(1);
    }
  }

  public registerMiddlewares() {
    // Middlewares de Segurança (Constituição MWT)
    this.app.register(helmet);

    this.app.register(cors, {
      origin: '*', // Em produção, usar whitelist
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    });
  }

  public registerRoutes() {
    // Rota de Health-Check base
    this.app.get('/api/health', async (request, reply) => {
      return { status: 'ok', message: 'AgendaMed Backend (OOP MWT R-U-R) rodando 100%' };
    });

    // Aqui vamos registrar as instâncias dos nossos Routers
    // Exemplo futuro: 
    // const userRouter = new UserRouter(new UserUseCase(new UserRepository()));
    // userRouter.register(this.app);
  }

  public async start() {
    this.registerMiddlewares();
    this.registerRoutes();
    await this.listen();
  }
}
