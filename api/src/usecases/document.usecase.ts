import { IDocumentRepository } from '../interfaces/document.interface';
import { IPatientRepository } from '../interfaces/patient.interface';
import { z } from 'zod';
import type { Document } from '../generated/prisma/client';

export class DocumentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private patientRepository: IPatientRepository
  ) {}

  async createDocument(tenantId: string, data: any): Promise<Document> {
    const schema = z.object({
      title: z.string().min(2, 'O título do documento é obrigatório'),
      category: z.enum(['recipe', 'exam', 'report', 'other'], {
        message: 'Categoria inválida. Use: recipe, exam, report, other'
      }),
      date: z.string().datetime().or(z.date()),
      fileUrl: z.string().url('A URL do arquivo deve ser válida'),
      patientId: z.string().uuid('ID do paciente (patientId) inválido'),
    });

    const parsedData = schema.parse(data);

    // Regra de Negócio: O paciente precisa existir e ser da família
    const patientExists = await this.patientRepository.findById(parsedData.patientId, tenantId);
    if (!patientExists) {
      throw new Error('Paciente associado não encontrado ou sem acesso.');
    }

    return await this.documentRepository.create(parsedData);
  }

  async getDocumentById(id: string, tenantId: string): Promise<Document> {
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

  async getDocumentsByPatientId(patientId: string, tenantId: string): Promise<Document[]> {
    const patientExists = await this.patientRepository.findById(patientId, tenantId);
    if (!patientExists) {
      throw new Error('Paciente associado não encontrado ou sem acesso.');
    }
    return await this.documentRepository.findByPatientId(patientId);
  }

  async updateDocument(id: string, tenantId: string, data: any): Promise<Document> {
    const schema = z.object({
      title: z.string().min(2).optional(),
      category: z.enum(['recipe', 'exam', 'report', 'other']).optional(),
      date: z.string().datetime().or(z.date()).optional(),
      fileUrl: z.string().url().optional(),
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

  async deleteDocument(id: string, tenantId: string): Promise<void> {
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
