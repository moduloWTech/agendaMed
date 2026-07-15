"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronService = exports.CronService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_config_1 = require("../DB/prisma.config");
const push_service_1 = require("./push.service");
class CronService {
    start() {
        // Roda a cada 1 minuto
        node_cron_1.default.schedule('* * * * *', async () => {
            console.log('[Cron] Verificando medicamentos agendados...');
            await this.checkMedications();
        });
        console.log('[Cron] Serviço de agendamento iniciado.');
    }
    async checkMedications() {
        const now = new Date();
        // Ajusta para o fuso local do servidor para pegar a data correta
        const offset = now.getTimezoneOffset();
        const localNow = new Date(now.getTime() - (offset * 60 * 1000));
        const todayStr = localNow.toISOString().split('T')[0];
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHour}:${currentMinute}`;
        try {
            // 1. Busca medicamentos ativos e com patient.users
            const medications = await prisma_config_1.prisma.medication.findMany({
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
                // Verifica se é hoje ou depois de hoje
                const medStartDateStr = med.startDate.toISOString().split('T')[0];
                // 2. Calcula os horários do medicamento para HOJE
                const todayTimes = this.getTimesForToday(med, todayStr, medStartDateStr);
                // 3. Se a hora atual está no array de horários de hoje
                if (todayTimes.includes(currentTimeStr)) {
                    // 4. Checar se JÁ EXISTE checkin
                    const alreadyTaken = await prisma_config_1.prisma.medicationHistory.findFirst({
                        where: {
                            medicationId: med.id,
                            date: todayStr,
                            time: currentTimeStr
                        }
                    });
                    if (!alreadyTaken) {
                        // 5. Enviar Notificações para todos os usuários do paciente
                        const userIds = med.patient.users.map((u) => u.id);
                        if (userIds.length > 0) {
                            console.log(`[Cron] Disparando Push para ${med.name} (${currentTimeStr}) - Paciente: ${med.patient.name}`);
                            await push_service_1.pushService.sendNotificationToUsers(userIds, {
                                title: 'AgendaMed Lembrete ⏰',
                                body: `Hora de tomar ${med.name} (${med.dosage})\nPaciente: ${med.patient.name}`,
                                url: '/', // Abre a raiz do PWA
                            });
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('[Cron] Falha ao executar verificação de rotina:', error);
        }
    }
    getTimesForToday(med, todayStr, medStartDateStr) {
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
            if (todayStr < medStartDateStr)
                return [];
            const intervalHours = parseInt(freq.replace('h', ''));
            if (isNaN(intervalHours) || intervalHours <= 0)
                return [];
            const timesForToday = [];
            const [startH, startM] = med.startTime.split(':').map(Number);
            const startDateTime = new Date(`${medStartDateStr}T${med.startTime}:00`);
            const currentDayStart = new Date(`${todayStr}T00:00:00`);
            const currentDayEnd = new Date(`${todayStr}T23:59:59`);
            // Se a data de início é depois de hoje, nem gera
            if (startDateTime > currentDayEnd)
                return [];
            // Acha a próxima dose a partir do começo do dia de hoje (ou da data de inicio se for hoje mesmo)
            let currentDose = new Date(startDateTime);
            while (currentDose < currentDayStart) {
                currentDose.setHours(currentDose.getHours() + intervalHours);
            }
            while (currentDose <= currentDayEnd) {
                const h = String(currentDose.getHours()).padStart(2, '0');
                const m = String(currentDose.getMinutes()).padStart(2, '0');
                timesForToday.push(`${h}:${m}`);
                currentDose.setHours(currentDose.getHours() + intervalHours);
            }
            return timesForToday;
        }
        return [];
    }
}
exports.CronService = CronService;
exports.cronService = new CronService();
