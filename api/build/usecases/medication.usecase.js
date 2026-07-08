"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationUseCase = void 0;
const zod_1 = require("zod");
class MedicationUseCase {
    medicationRepository;
    patientRepository;
    constructor(medicationRepository, patientRepository) {
        this.medicationRepository = medicationRepository;
        this.patientRepository = patientRepository;
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
}
exports.MedicationUseCase = MedicationUseCase;
