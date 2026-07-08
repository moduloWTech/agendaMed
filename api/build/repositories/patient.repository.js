"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientRepository = void 0;
const prisma_config_1 = require("../DB/prisma.config");
class PatientRepository {
    async create(data) {
        return await prisma_config_1.prisma.patient.create({
            data: {
                name: data.name,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                userId: data.userId,
            },
        });
    }
    async findById(id) {
        return await prisma_config_1.prisma.patient.findUnique({
            where: { id },
        });
    }
    async findByUserId(userId) {
        return await prisma_config_1.prisma.patient.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async update(id, data) {
        return await prisma_config_1.prisma.patient.update({
            where: { id },
            data: {
                ...data,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined
            },
        });
    }
    async delete(id) {
        await prisma_config_1.prisma.patient.delete({
            where: { id },
        });
    }
}
exports.PatientRepository = PatientRepository;
