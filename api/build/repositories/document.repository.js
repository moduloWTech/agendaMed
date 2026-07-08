"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRepository = void 0;
const prisma_config_1 = require("../DB/prisma.config");
class DocumentRepository {
    async create(data) {
        return await prisma_config_1.prisma.document.create({
            data: {
                title: data.title,
                category: data.category,
                date: new Date(data.date),
                fileUrl: data.fileUrl,
                patientId: data.patientId,
            },
        });
    }
    async findById(id) {
        return await prisma_config_1.prisma.document.findUnique({
            where: { id },
        });
    }
    async findByPatientId(patientId) {
        return await prisma_config_1.prisma.document.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async update(id, data) {
        const updateData = { ...data };
        if (data.date) {
            updateData.date = new Date(data.date);
        }
        return await prisma_config_1.prisma.document.update({
            where: { id },
            data: updateData,
        });
    }
    async delete(id) {
        await prisma_config_1.prisma.document.delete({
            where: { id },
        });
    }
}
exports.DocumentRepository = DocumentRepository;
