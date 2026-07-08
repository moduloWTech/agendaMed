import { IDocumentRepository } from '../interfaces/document.interface';
import { IPatientRepository } from '../interfaces/patient.interface';
import { z } from 'zod';
import type { Document } from '../generated/prisma/client';

export class DocumentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private patientRepository: IPatientRepository
  ) {}

  async createDocument(data: any): Promise<Document> {
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

    // Regra de Negócio: O paciente precisa existir
    const patientExists = await this.patientRepository.findById(parsedData.patientId);
    if (!patientExists) {
      throw new Error('Paciente associado não encontrado na plataforma.');
    }

    return await this.documentRepository.create(parsedData);
  }

  async getDocumentById(id: string): Promise<Document> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new Error('Documento não encontrado.');
    }
    return document;
  }

  async getDocumentsByPatientId(patientId: string): Promise<Document[]> {
    return await this.documentRepository.findByPatientId(patientId);
  }

  async updateDocument(id: string, data: any): Promise<Document> {
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

    return await this.documentRepository.update(id, parsedData);
  }

  async deleteDocument(id: string): Promise<void> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new Error('Documento não encontrado.');
    }

    await this.documentRepository.delete(id);
  }
}
