"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientUseCase = void 0;
const zod_1 = require("zod");
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
}
exports.PatientUseCase = PatientUseCase;
