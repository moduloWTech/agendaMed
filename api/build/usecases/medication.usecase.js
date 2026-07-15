"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationUseCase = void 0;
const zod_1 = require("zod");
const push_service_1 = require("../services/push.service");
class MedicationUseCase {
    medicationRepository;
    patientRepository;
    userRepository;
    constructor(medicationRepository, patientRepository, userRepository) {
        this.medicationRepository = medicationRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }
    async createMedication(data) {
        const schema = zod_1.z.object({
            name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
            dosage: zod_1.z.string().min(1, 'A dosagem é obrigatória'),
            instructions: zod_1.z.string().min(1, 'As instruções são obrigatórias'),
            frequency: zod_1.z.string(),
            startDate: zod_1.z.string(),
            startTime: zod_1.z.string().min(4, 'O horário inicial é obrigatório'),
            times: zod_1.z.array(zod_1.z.string()).optional(),
            active: zod_1.z.boolean().optional(),
            patientId: zod_1.z.string().uuid('ID do paciente inválido'),
        });
        const parsed = schema.parse(data);
        // Regra de Negócio: O paciente precisa existir
        const patientExists = await this.patientRepository.findById(parsed.patientId);
        if (!patientExists) {
            throw new Error('Paciente associado não encontrado na plataforma.');
        }
        return await this.medicationRepository.create({
            name: parsed.name,
            dosage: parsed.dosage,
            instructions: parsed.instructions,
            frequency: parsed.frequency,
            startDate: new Date(parsed.startDate),
            startTime: parsed.startTime,
            times: parsed.times || [],
            patientId: parsed.patientId
        });
    }
    async getMedicationById(id) {
        const medication = await this.medicationRepository.findById(id);
        if (!medication) {
            throw new Error('Medicamento não encontrado.');
        }
        return medication;
    }
    async getMedicationsByPatientId(patientId) {
        return await this.medicationRepository.findByPatientId(patientId);
    }
    async updateMedication(id, data) {
        const schema = zod_1.z.object({
            name: zod_1.z.string().min(2).optional(),
            dosage: zod_1.z.string().min(1).optional(),
            instructions: zod_1.z.string().min(1).optional(),
            frequency: zod_1.z.string().min(1).optional(),
            startDate: zod_1.z.string().datetime().or(zod_1.z.date()).optional(),
            startTime: zod_1.z.string().min(4).optional(),
            times: zod_1.z.array(zod_1.z.string()).optional(),
            active: zod_1.z.boolean().optional(),
        });
        const parsedData = schema.parse(data);
        const medication = await this.medicationRepository.findById(id);
        if (!medication) {
            throw new Error('Medicamento não encontrado.');
        }
        return await this.medicationRepository.update(id, parsedData);
    }
    async deleteMedication(id) {
        const medication = await this.medicationRepository.findById(id);
        if (!medication) {
            throw new Error('Medicamento não encontrado.');
        }
        await this.medicationRepository.delete(id);
    }
    async getHistory(patientId, date) {
        return await this.medicationRepository.getHistory(patientId, date);
    }
    async toggleCheckin(userId, data) {
        const schema = zod_1.z.object({
            medicationId: zod_1.z.string().uuid(),
            patientId: zod_1.z.string().uuid(),
            date: zod_1.z.string(),
            time: zod_1.z.string()
        });
        const parsed = schema.parse(data);
        const wasCreated = await this.medicationRepository.toggleHistory(userId, parsed);
        if (wasCreated) {
            try {
                const medication = await this.medicationRepository.findById(parsed.medicationId);
                const patient = await this.patientRepository.findById(parsed.patientId);
                const userWhoDidIt = await this.userRepository.findById(userId);
                const userName = userWhoDidIt?.name || 'Um cuidador';
                if (patient && medication) {
                    // Extrair a lista de todos os usuários atrelados ao paciente
                    const allUserIds = (patient.users || []).map((u) => u.id);
                    if (allUserIds.length > 0) {
                        push_service_1.pushService.sendNotificationToUsers(allUserIds, {
                            title: '✅ Remédio Administrado!',
                            body: `${userName} registrou que ${patient.name} tomou ${medication.name}.`,
                            url: '/'
                        }).catch(console.error);
                    }
                }
            }
            catch (err) {
                console.error('[WebPush] Falha ao enviar notificação de check-in:', err);
            }
        }
    }
}
exports.MedicationUseCase = MedicationUseCase;
