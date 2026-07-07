import type { Document } from '@prisma/client';

export interface IDocumentCreate {
  title: string;
  category: string;
  date: Date | string;
  fileUrl: string;
  patientId: string;
}

export interface IDocumentUpdate {
  title?: string;
  category?: string;
  date?: Date | string;
  fileUrl?: string;
}

export interface IDocumentRepository {
  create(data: IDocumentCreate): Promise<Document>;
  findById(id: string): Promise<Document | null>;
  findByPatientId(patientId: string): Promise<Document[]>;
  update(id: string, data: IDocumentUpdate): Promise<Document>;
  delete(id: string): Promise<void>;
}
