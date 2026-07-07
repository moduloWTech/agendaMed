import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import { UserRouter } from './routes/user.router';
import { UserUseCase } from './usecases/user.usecase';
import { UserRepository } from './repositories/user.repository';

import { PatientRouter } from './routes/patient.router';
import { PatientUseCase } from './usecases/patient.usecase';
import { PatientRepository } from './repositories/patient.repository';

import { MedicationRouter } from './routes/medication.router';
import { MedicationUseCase } from './usecases/medication.usecase';
import { MedicationRepository } from './repositories/medication.repository';

import { DocumentRouter } from './routes/document.router';
import { DocumentUseCase } from './usecases/document.usecase';
import { DocumentRepository } from './repositories/document.repository';

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

    // Injeção de Dependências Manual (OOP) - USER
    const userRepository = new UserRepository();
    const userUseCase = new UserUseCase(userRepository);
    const userRouter = new UserRouter(userUseCase);

    // Injeção de Dependências Manual (OOP) - PATIENT
    const patientRepository = new PatientRepository();
    const patientUseCase = new PatientUseCase(patientRepository, userRepository);
    const patientRouter = new PatientRouter(patientUseCase);

    // Injeção de Dependências Manual (OOP) - MEDICATION
    const medicationRepository = new MedicationRepository();
    const medicationUseCase = new MedicationUseCase(medicationRepository, patientRepository);
    const medicationRouter = new MedicationRouter(medicationUseCase);

    // Injeção de Dependências Manual (OOP) - DOCUMENT
    const documentRepository = new DocumentRepository();
    const documentUseCase = new DocumentUseCase(documentRepository, patientRepository);
    const documentRouter = new DocumentRouter(documentUseCase);

    // Registrando rotas
    userRouter.register(this.app);
    patientRouter.register(this.app);
    medicationRouter.register(this.app);
    documentRouter.register(this.app);
  }

  public async start() {
    this.registerMiddlewares();
    this.registerRoutes();
    await this.listen();
  }
}
