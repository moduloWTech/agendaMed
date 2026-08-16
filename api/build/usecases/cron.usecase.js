"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronUseCase = void 0;
const push_service_1 = require("../services/push.service");
class CronUseCase {
    cronRepository;
    constructor(cronRepository) {
        this.cronRepository = cronRepository;
    }
    async execute(dto) {
        // 1. Regra de Negócio de Segurança (Validação do Segredo de Execução no UseCase)
        const expectedSecret = process.env.CRON_SECRET;
        if (expectedSecret && dto?.providedSecret !== expectedSecret) {
            throw new Error('Acesso não autorizado. Chave de segurança do Cron inválida.');
        }
        const now = new Date();
        const { dateStr: todayStr, timeStr: currentTimeStr } = this.getFortalezaTime(now);
        const report = {
            success: true,
            timestamp: now.toISOString(),
            fortalezaTime: {
                date: todayStr,
                time: currentTimeStr,
            },
            totalActiveMedications: 0,
            totalNotificationsSent: 0,
            details: [],
            message: 'Verificação de medicamentos concluída com sucesso.',
        };
        try {
            const medications = await this.cronRepository.findActiveMedicationsWithUsers();
            report.totalActiveMedications = medications.length;
            for (const med of medications) {
                const medStartDateStr = this.extractCalendarDate(med.startDate);
                const todayTimes = this.getTimesForToday(med, todayStr, medStartDateStr);
                for (const scheduledTime of todayTimes) {
                    const diffMinutes = this.getDiffMinutes(currentTimeStr, scheduledTime);
                    // Janela de insistência: até 30 minutos de atraso
                    // Dispara no minuto 0 (na hora), nos minutos 1 a 4, e depois a cada 5 min (5, 10, 15, 20, 25, 30)
                    const shouldTrigger = (diffMinutes >= 0 && diffMinutes <= 5) || (diffMinutes > 5 && diffMinutes <= 30 && diffMinutes % 5 === 0);
                    if (shouldTrigger) {
                        const alreadyTaken = await this.cronRepository.hasTakenMedication(med.id, todayStr, scheduledTime);
                        if (!alreadyTaken) {
                            const userIds = med.patient.users.map((u) => u.id);
                            if (userIds.length > 0) {
                                const { title, body } = this.buildNotificationContent(med.name, med.dosage, med.patient.name, diffMinutes);
                                await push_service_1.pushService.sendNotificationToUsers(userIds, {
                                    title,
                                    body,
                                    url: '/',
                                });
                                const detail = {
                                    medicationId: med.id,
                                    medicationName: med.name,
                                    patientName: med.patient.name,
                                    scheduledTime,
                                    delayMinutes: diffMinutes,
                                    usersNotifiedCount: userIds.length,
                                };
                                report.details.push(detail);
                                report.totalNotificationsSent += userIds.length;
                            }
                        }
                    }
                }
            }
            return report;
        }
        catch (error) {
            report.success = false;
            report.message = `Erro durante a verificação de cron: ${error.message || 'Erro desconhecido'}`;
            return report;
        }
    }
    buildNotificationContent(medName, dosage, patientName, diffMinutes) {
        if (diffMinutes === 0) {
            return {
                title: 'Hora do Medicamento ⏰',
                body: `Atenção: Hora de ministrar ${medName} (${dosage}) para ${patientName}.`,
            };
        }
        if (diffMinutes > 0 && diffMinutes < 5) {
            return {
                title: `Lembrete Pendente (${diffMinutes} min) ⚠️`,
                body: `A dose de ${medName} para ${patientName} ainda não foi confirmada.`,
            };
        }
        return {
            title: '🚨 ALERTA DE SEGURANÇA 🚨',
            body: `Você passou ${diffMinutes} minutos do horário de ministrar ${medName} para ${patientName}. Por favor, verifique com urgência!`,
        };
    }
    getFortalezaTime(date) {
        const formatter = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Fortaleza',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        const parts = formatter.formatToParts(date);
        const getPart = (type) => parts.find((p) => p.type === type)?.value;
        return {
            dateStr: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
            timeStr: `${getPart('hour')}:${getPart('minute')}`,
        };
    }
    extractCalendarDate(date) {
        const isoStr = date.toISOString();
        if (isoStr.endsWith('T00:00:00.000Z')) {
            return isoStr.split('T')[0];
        }
        return this.getFortalezaTime(date).dateStr;
    }
    getDiffMinutes(currentTime, scheduledTime) {
        const [cHours, cMinutes] = currentTime.split(':').map(Number);
        const [sHours, sMinutes] = scheduledTime.split(':').map(Number);
        const cTotal = cHours * 60 + cMinutes;
        const sTotal = sHours * 60 + sMinutes;
        return cTotal - sTotal;
    }
    normalizeFrequency(rawFrequency) {
        if (!rawFrequency)
            return 'daily';
        const clean = rawFrequency.trim().toLowerCase();
        if (clean === 'diário' || clean === 'diario' || clean === 'daily')
            return 'daily';
        if (clean === 'única' || clean === 'unica' || clean === 'dose única' || clean === 'dose unica' || clean === 'single')
            return 'single';
        if (clean === 'semanal' || clean === 'weekly')
            return 'weekly';
        if (clean === 'mensal' || clean === 'monthly')
            return 'monthly';
        if (clean === 'manual')
            return 'manual';
        const hourMatch = clean.match(/(\d+)\s*(?:em\s*\d+\s*horas?|horas?|h)/i);
        if (hourMatch && hourMatch[1]) {
            return `${hourMatch[1]}h`;
        }
        if (clean.endsWith('h')) {
            return clean;
        }
        return clean;
    }
    getTimesForToday(med, todayStr, medStartDateStr) {
        const normFreq = this.normalizeFrequency(med.frequency);
        if (todayStr < medStartDateStr) {
            return [];
        }
        if (normFreq === 'single') {
            return todayStr === medStartDateStr ? [med.startTime] : [];
        }
        if (normFreq === 'weekly') {
            const medStartDate = new Date(`${medStartDateStr}T12:00:00-03:00`);
            const todayDate = new Date(`${todayStr}T12:00:00-03:00`);
            if (todayDate.getDay() !== medStartDate.getDay())
                return [];
            return med.times && med.times.length > 0 ? med.times : [med.startTime];
        }
        if (normFreq === 'monthly') {
            const medStartDate = new Date(`${medStartDateStr}T12:00:00-03:00`);
            const todayDate = new Date(`${todayStr}T12:00:00-03:00`);
            if (todayDate.getDate() !== medStartDate.getDate())
                return [];
            return med.times && med.times.length > 0 ? med.times : [med.startTime];
        }
        if (med.times && Array.isArray(med.times) && med.times.length > 0) {
            return med.times;
        }
        if (normFreq === 'daily') {
            return [med.startTime];
        }
        if (normFreq.endsWith('h')) {
            const intervalHours = parseInt(normFreq.replace('h', ''), 10);
            if (isNaN(intervalHours) || intervalHours <= 0 || intervalHours > 24) {
                return [med.startTime];
            }
            const [startH, startM] = (med.startTime || '08:00').split(':').map(Number);
            const times = [];
            const count = Math.min(Math.floor(24 / intervalHours), 24);
            for (let i = 0; i < count; i++) {
                const h = ((startH || 0) + i * intervalHours) % 24;
                const m = startM || 0;
                times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            }
            return times.sort();
        }
        return [med.startTime];
    }
}
exports.CronUseCase = CronUseCase;
