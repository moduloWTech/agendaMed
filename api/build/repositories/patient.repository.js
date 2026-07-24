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
                tenantId: data.tenantId,
                users: {
                    connect: { id: data.userId }
                }
            },
        });
    }
    async findById(id, tenantId) {
        return await prisma_config_1.prisma.patient.findUnique({
            where: { id, tenantId },
            include: {
                users: true
            }
        });
    }
    async findByTenantId(tenantId) {
        return await prisma_config_1.prisma.patient.findMany({
            where: {
                tenantId: tenantId
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async update(id, tenantId, data) {
        return await prisma_config_1.prisma.patient.update({
            where: { id, tenantId },
            data: {
                ...data,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined
            },
        });
    }
    async delete(id, tenantId) {
        await prisma_config_1.prisma.patient.delete({
            where: { id, tenantId },
        });
    }
}
exports.PatientRepository = PatientRepository;
