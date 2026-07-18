import cron from 'node-cron';
import { prisma } from '../DB/prisma.config';
import { pushService } from './push.service';

export class CronService {
  public start() {
    // Roda a cada 1 minuto
    cron.schedule('* * * * *', async () => {
      console.log('[Cron] Verificando medicamentos agendados (Fuso: America/Fortaleza)...');
      await this.checkMedications();
    });
    console.log('[Cron] Serviço de agendamento iniciado (Fuso: America/Fortaleza).');
  }

  // Converte qualquer data para a string local de Fortaleza
  private getFortalezaTime(date: Date) {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Fortaleza',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;
    return {
      dateStr: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
      timeStr: `${getPart('hour')}:${getPart('minute')}`
    };
  }

  private async checkMedications() {
    const now = new Date();
    const { dateStr: todayStr, timeStr: currentTimeStr } = this.getFortalezaTime(now);

    try {
      // 1. Busca medicamentos ativos e com patient.users
      const medications = await prisma.medication.findMany({
        where: { active: true },
        include: {
          patient: {
            include: {
              users: true
            }
          }
        }
      });

      for (const med of medications) {
        // Pega a data de inicio exata baseada no fuso de Fortaleza
        const { dateStr: medStartDateStr } = this.getFortalezaTime(med.startDate);

        // 2. Calcula os horários do medicamento para HOJE
        const todayTimes = this.getTimesForToday(med, todayStr, medStartDateStr);
        
        // 3. Se a hora atual está no array de horários de hoje
        if (todayTimes.includes(currentTimeStr)) {
          
          // 4. Checar se JÁ EXISTE checkin
          const alreadyTaken = await prisma.medicationHistory.findFirst({
            where: {
              medicationId: med.id,
              date: todayStr,
              time: currentTimeStr
            }
          });

          if (!alreadyTaken) {
            // 5. Enviar Notificações para todos os usuários do paciente
            const userIds = med.patient.users.map((u: any) => u.id);
            if (userIds.length > 0) {
              console.log(`[Cron] Disparando Push para ${med.name} (${currentTimeStr}) - Paciente: ${med.patient.name}`);
              await pushService.sendNotificationToUsers(userIds, {
                title: 'AgendaMed Lembrete ⏰',
                body: `Hora de tomar ${med.name} (${med.dosage})\nPaciente: ${med.patient.name}`,
                url: '/', // Abre a raiz do PWA
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('[Cron] Falha ao executar verificação de rotina:', error);
    }
  }

  private getTimesForToday(med: any, todayStr: string, medStartDateStr: string): string[] {
    const freq = med.frequency;

    if (freq === 'single') {
      return todayStr === medStartDateStr ? [med.startTime] : [];
    }

    if (freq === 'daily') {
      return todayStr >= medStartDateStr ? [med.startTime] : [];
    }

    if (freq === 'manual') {
      return todayStr >= medStartDateStr ? (med.times || []) : [];
    }

    // Intervalos (4h, 6h, 8h, 12h)
    if (freq.endsWith('h')) {
      if (todayStr < medStartDateStr) return [];
      
      const intervalHours = parseInt(freq.replace('h', ''));
      if (isNaN(intervalHours) || intervalHours <= 0) return [];

      const timesForToday: string[] = [];
      
      // Cria a data no fuso do Brasil forçando o offset (-03:00)
      const startDateTime = new Date(`${medStartDateStr}T${med.startTime}:00-03:00`);
      const currentDayStart = new Date(`${todayStr}T00:00:00-03:00`);
      const currentDayEnd = new Date(`${todayStr}T23:59:59-03:00`);

      // Se a data de início é depois de hoje (impossível se a checagem acima passou, mas por segurança)
      if (startDateTime > currentDayEnd) return [];

      // Acha a próxima dose a partir do começo do dia de hoje (ou da data de inicio se for hoje mesmo)
      let currentDose = new Date(startDateTime);
      while (currentDose < currentDayStart) {
        currentDose.setHours(currentDose.getHours() + intervalHours);
      }

      while (currentDose <= currentDayEnd) {
        const { timeStr } = this.getFortalezaTime(currentDose);
        timesForToday.push(timeStr);
        currentDose.setHours(currentDose.getHours() + intervalHours);
      }

      return timesForToday;
    }

    return [];
  }
}

export const cronService = new CronService();
