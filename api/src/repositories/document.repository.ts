import { PrismaClient } from '@prisma/client';
import { IDocumentRepository, IDocumentCreate, IDocumentUpdate } from '../interfaces/document.interface';
import type { Document } from '@prisma/client';

const prisma = new PrismaClient();

export class DocumentRepository implements IDocumentRepository {
  async create(data: IDocumentCreate): Promise<Document> {
    return await prisma.document.create({
      data: {
        title: data.title,
        category: data.category,
        date: new Date(data.date),
        fileUrl: data.fileUrl,
        patientId: data.patientId,
      },
    });
  }

  async findById(id: string): Promise<Document | null> {
    return await prisma.document.findUnique({
      where: { id },
    });
  }

  async findByPatientId(patientId: string): Promise<Document[]> {
    return await prisma.document.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, data: IDocumentUpdate): Promise<Document> {
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return await prisma.document.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.document.delete({
      where: { id },
    });
  }
}
