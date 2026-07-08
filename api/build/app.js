"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const upload_router_1 = require("./routes/upload.router");
const user_router_1 = require("./routes/user.router");
const user_usecase_1 = require("./usecases/user.usecase");
const user_repository_1 = require("./repositories/user.repository");
const patient_router_1 = require("./routes/patient.router");
const patient_usecase_1 = require("./usecases/patient.usecase");
const patient_repository_1 = require("./repositories/patient.repository");
const medication_router_1 = require("./routes/medication.router");
const medication_usecase_1 = require("./usecases/medication.usecase");
const medication_repository_1 = require("./repositories/medication.repository");
const document_router_1 = require("./routes/document.router");
const document_usecase_1 = require("./usecases/document.usecase");
const document_repository_1 = require("./repositories/document.repository");
const appointment_router_1 = require("./routes/appointment.router");
const appointment_usecase_1 = require("./usecases/appointment.usecase");
const appointment_repository_1 = require("./repositories/appointment.repository");
const auth_router_1 = require("./routes/auth.router");
const auth_usecase_1 = require("./usecases/auth.usecase");
const whatsapp_router_1 = require("./routes/whatsapp.router");
class App {
    app;
    PORT;
    constructor() {
        this.app = (0, fastify_1.default)({
            logger: true,
        });
        this.PORT = process.env.PORT ? Number(process.env.PORT) : 3333;
    }
    getServer() {
        return this.app;
    }
    async listen() {
        try {
            await this.app.listen({
                host: '0.0.0.0',
                port: this.PORT,
            });
            console.log(`🚀 Backend rodando na porta ${this.PORT}`);
        }
        catch (err) {
            this.app.log.error(err);
            process.exit(1);
        }
    }
    registerMiddlewares() {
        // Middlewares de Segurança (Constituição MWT)
        this.app.register(helmet_1.default);
        // Multipart para aceitar envio de arquivos
        this.app.register(multipart_1.default, {
            limits: {
                fileSize: 10 * 1024 * 1024 // 10MB limit
            }
        });
        this.app.register(cors_1.default, {
            origin: '*', // Em produção, usar whitelist
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        });
    }
    registerRoutes() {
        // Rota de Health-Check base
        this.app.get('/api/health', async (request, reply) => {
            return { status: 'ok', message: 'AgendaMed Backend (OOP MWT R-U-R) rodando 100%' };
        });
        // Injeção de Dependências Manual (OOP) - USER
        const userRepository = new user_repository_1.UserRepository();
        const userUseCase = new user_usecase_1.UserUseCase(userRepository);
        const userRouter = new user_router_1.UserRouter(userUseCase);
        // Injeção de Dependências Manual (OOP) - PATIENT
        const patientRepository = new patient_repository_1.PatientRepository();
        const patientUseCase = new patient_usecase_1.PatientUseCase(patientRepository, userRepository);
        const patientRouter = new patient_router_1.PatientRouter(patientUseCase);
        // Injeção de Dependências Manual (OOP) - MEDICATION
        const medicationRepository = new medication_repository_1.MedicationRepository();
        const medicationUseCase = new medication_usecase_1.MedicationUseCase(medicationRepository, patientRepository);
        const medicationRouter = new medication_router_1.MedicationRouter(medicationUseCase);
        // Injeção de Dependências Manual (OOP) - DOCUMENT
        const documentRepository = new document_repository_1.DocumentRepository();
        const documentUseCase = new document_usecase_1.DocumentUseCase(documentRepository, patientRepository);
        const documentRouter = new document_router_1.DocumentRouter(documentUseCase);
        // Injeção de Dependências Manual (OOP) - APPOINTMENT
        const appointmentRepository = new appointment_repository_1.AppointmentRepository();
        const appointmentUseCase = new appointment_usecase_1.AppointmentUseCase(appointmentRepository);
        const appointmentRouter = new appointment_router_1.AppointmentRouter(appointmentUseCase);
        // Injeção de Dependências Manual (OOP) - AUTH
        const authUseCase = new auth_usecase_1.AuthUseCase(userRepository);
        const authRouter = new auth_router_1.AuthRouter(authUseCase);
        // Injeção de Dependências Manual (OOP) - WHATSAPP
        const whatsappRouter = new whatsapp_router_1.WhatsappRouter();
        // Registrando rotas
        userRouter.register(this.app);
        patientRouter.register(this.app);
        medicationRouter.register(this.app);
        documentRouter.register(this.app);
        appointmentRouter.register(this.app);
        authRouter.register(this.app);
        whatsappRouter.register(this.app);
        this.app.register(upload_router_1.uploadRoutes, { prefix: '/api/upload' });
    }
    async start() {
        this.registerMiddlewares();
        this.registerRoutes();
        await this.listen();
    }
}
exports.App = App;
