"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentUseCase = void 0;
const zod_1 = require("zod");
class DocumentUseCase {
    documentRepository;
    patientRepository;
    constructor(documentRepository, patientRepository) {
        this.documentRepository = documentRepository;
        this.patientRepository = patientRepository;
    }
    async createDocument(tenantId, data) {
        const schema = zod_1.z.object({
            title: zod_1.z.string().min(2, 'O título do documento é obrigatório'),
            category: zod_1.z.enum(['recipe', 'exam', 'report', 'other'], {
                message: 'Categoria inválida. Use: recipe, exam, report, other'
            }),
            date: zod_1.z.string().datetime().or(zod_1.z.date()),
            fileUrl: zod_1.z.string().url('A URL do arquivo deve ser válida'),
            patientId: zod_1.z.string().uuid('ID do paciente (patientId) inválido'),
        });
        const parsedData = schema.parse(data);
        // Regra de Negócio: O paciente precisa existir e ser da família
        const patientExists = await this.patientRepository.findById(parsedData.patientId, tenantId);
        if (!patientExists) {
            throw new Error('Paciente associado não encontrado ou sem acesso.');
        }
        return await this.documentRepository.create(parsedData);
    }
    async getDocumentById(id, tenantId) {
        const document = await this.documentRepository.findById(id);
        if (!document) {
            throw new Error('Documento não encontrado.');
        }
        const patientExists = await this.patientRepository.findById(document.patientId, tenantId);
        if (!patientExists) {
            throw new Error('Documento não encontrado ou sem acesso.');
        }
        return document;
    }
    async getDocumentsByPatientId(patientId, tenantId) {
        const patientExists = await this.patientRepository.findById(patientId, tenantId);
        if (!patientExists) {
            throw new Error('Paciente associado não encontrado ou sem acesso.');
        }
        return await this.documentRepository.findByPatientId(patientId);
    }
    async updateDocument(id, tenantId, data) {
        const schema = zod_1.z.object({
            title: zod_1.z.string().min(2).optional(),
            category: zod_1.z.enum(['recipe', 'exam', 'report', 'other']).optional(),
            date: zod_1.z.string().datetime().or(zod_1.z.date()).optional(),
            fileUrl: zod_1.z.string().url().optional(),
        });
        const parsedData = schema.parse(data);
        const document = await this.documentRepository.findById(id);
        if (!document) {
            throw new Error('Documento não encontrado.');
        }
        const patientExists = await this.patientRepository.findById(document.patientId, tenantId);
        if (!patientExists) {
            throw new Error('Documento não encontrado ou sem acesso.');
        }
        return await this.documentRepository.update(id, parsedData);
    }
    async deleteDocument(id, tenantId) {
        const document = await this.documentRepository.findById(id);
        if (!document) {
            throw new Error('Documento não encontrado.');
        }
        const patientExists = await this.patientRepository.findById(document.patientId, tenantId);
        if (!patientExists) {
            throw new Error('Documento não encontrado ou sem acesso.');
        }
        await this.documentRepository.delete(id);
    }
}
exports.DocumentUseCase = DocumentUseCase;
