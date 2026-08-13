"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientUseCase = void 0;
const zod_1 = require("zod");
const prisma_config_1 = require("../DB/prisma.config");
class PatientUseCase {
    patientRepository;
    userRepository;
    constructor(patientRepository, userRepository // Injetado para validar a existência do Cuidador
    ) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }
    async createPatient(data) {
        const schema = zod_1.z.object({
            name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
            birthDate: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
            userId: zod_1.z.string().uuid('ID do cuidador (userId) inválido'),
            tenantId: zod_1.z.string().uuid('TenantId inválido'),
        });
        const parsedData = schema.parse(data);
        // Validação de Regra de Negócio: O cuidador precisa existir
        const userExists = await this.userRepository.findById(parsedData.userId);
        if (!userExists) {
            throw new Error('Cuidador (User) associado não encontrado na plataforma.');
        }
        return await this.patientRepository.create(parsedData);
    }
    async getPatientById(id, tenantId) {
        const patient = await this.patientRepository.findById(id, tenantId);
        if (!patient) {
            throw new Error('Paciente não encontrado.');
        }
        return patient;
    }
    async getPatientsByTenantId(tenantId) {
        return await this.patientRepository.findByTenantId(tenantId);
    }
    async updatePatient(id, tenantId, data) {
        const schema = zod_1.z.object({
            name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').optional(),
            birthDate: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
        });
        const parsedData = schema.parse(data);
        const patient = await this.patientRepository.findById(id, tenantId);
        if (!patient) {
            throw new Error('Paciente não encontrado.');
        }
        return await this.patientRepository.update(id, tenantId, parsedData);
    }
    async deletePatient(id, tenantId) {
        const patient = await this.patientRepository.findById(id, tenantId);
        if (!patient) {
            throw new Error('Paciente não encontrado.');
        }
        await this.patientRepository.delete(id, tenantId);
    }
    async getReportData(id, tenantId, startDate, endDate) {
        const patient = await this.patientRepository.findById(id, tenantId);
        if (!patient) {
            throw new Error('Paciente não encontrado.');
        }
        const todayStr = new Date().toISOString().split('T')[0];
        const defaultStartStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const start = startDate || defaultStartStr;
        const end = endDate || todayStr;
        const dStart = new Date(start);
        const dEnd = new Date(end);
        const timeDiff = Math.max(0, dEnd.getTime() - dStart.getTime());
        const daysCount = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1);
        const medications = await prisma_config_1.prisma.medication.findMany({
            where: { patientId: id },
            orderBy: { createdAt: 'desc' }
        });
        const historyLogs = await prisma_config_1.prisma.medicationHistory.findMany({
            where: {
                patientId: id,
                date: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                medication: true,
                user: { select: { id: true, name: true, email: true } }
            },
            orderBy: [
                { date: 'desc' },
                { time: 'desc' }
            ]
        });
        const appointments = await prisma_config_1.prisma.appointment.findMany({
            where: { patientId: id },
            orderBy: { date: 'asc' }
        });
        const activeMedications = medications.filter(m => m.active);
        const scheduledDosesPerDay = activeMedications.reduce((sum, med) => sum + (med.times?.length || 1), 0);
        const totalScheduledDoses = scheduledDosesPerDay * daysCount;
        const takenDoses = historyLogs.length;
        const adherencePercentage = totalScheduledDoses > 0
            ? Math.min(100, Math.round((takenDoses / totalScheduledDoses) * 100))
            : 100;
        return {
            patient: {
                id: patient.id,
                name: patient.name,
                birthDate: patient.birthDate,
            },
            period: {
                startDate: start,
                endDate: end,
                daysCount,
            },
            metrics: {
                totalScheduledDoses,
                takenDoses,
                missedDoses: Math.max(0, totalScheduledDoses - takenDoses),
                adherencePercentage,
            },
            medications: medications.map(m => ({
                id: m.id,
                name: m.name,
                dosage: m.dosage,
                frequency: m.frequency,
                times: m.times,
                instructions: m.instructions,
                active: m.active,
                photoUrl: m.photoUrl,
            })),
            historyLogs: historyLogs.map(log => ({
                id: log.id,
                medicationId: log.medicationId,
                medicationName: log.medication?.name || 'Medicamento',
                dosage: log.medication?.dosage || '',
                date: log.date,
                time: log.time,
                takenAt: log.takenAt,
                registeredBy: log.user?.name || 'Cuidador',
            })),
            appointments: appointments.map(a => ({
                id: a.id,
                specialty: a.specialty,
                doctorName: a.doctorName,
                date: a.date,
                time: a.time,
                location: a.location,
                notes: a.notes,
            })),
        };
    }
}
exports.PatientUseCase = PatientUseCase;
