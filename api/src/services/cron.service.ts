import cron from 'node-cron';
import { ICronUseCase } from '../interfaces/cron.interface';
import { CronRepository } from '../repositories/cron.repository';
import { CronUseCase } from '../usecases/cron.usecase';

export class CronService {
  private cronUseCase: ICronUseCase;

  constructor(cronUseCase?: ICronUseCase) {
    this.cronUseCase = cronUseCase || new CronUseCase(new CronRepository());
  }

  public start() {
    // Roda a cada 1 minuto (quando executado em ambiente com processo contínuo)
    cron.schedule('* * * * *', async () => {
      console.log('[Cron] Verificando medicamentos agendados (Fuso: America/Fortaleza)...');
      try {
        const report = await this.cronUseCase.execute({ providedSecret: process.env.CRON_SECRET });
        if (report.totalNotificationsSent > 0) {
          console.log(`[Cron] ${report.totalNotificationsSent} notificações disparadas com sucesso.`);
        }
      } catch (error) {
        console.error('[Cron] Falha ao executar verificação de rotina:', error);
      }
    });
    console.log('[Cron] Serviço de agendamento iniciado (Fuso: America/Fortaleza).');
  }
}

export const cronService = new CronService();
