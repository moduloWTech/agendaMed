"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronService = exports.CronService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const cron_repository_1 = require("../repositories/cron.repository");
const cron_usecase_1 = require("../usecases/cron.usecase");
class CronService {
    cronUseCase;
    constructor(cronUseCase) {
        this.cronUseCase = cronUseCase || new cron_usecase_1.CronUseCase(new cron_repository_1.CronRepository());
    }
    start() {
        // Roda a cada 1 minuto (quando executado em ambiente com processo contínuo)
        node_cron_1.default.schedule('* * * * *', async () => {
            console.log('[Cron] Verificando medicamentos agendados (Fuso: America/Fortaleza)...');
            try {
                const report = await this.cronUseCase.execute({ providedSecret: process.env.CRON_SECRET });
                if (report.totalNotificationsSent > 0) {
                    console.log(`[Cron] ${report.totalNotificationsSent} notificações disparadas com sucesso.`);
                }
            }
            catch (error) {
                console.error('[Cron] Falha ao executar verificação de rotina:', error);
            }
        });
        console.log('[Cron] Serviço de agendamento iniciado (Fuso: America/Fortaleza).');
    }
}
exports.CronService = CronService;
exports.cronService = new CronService();
