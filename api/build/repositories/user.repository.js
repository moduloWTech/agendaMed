"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_config_1 = require("../DB/prisma.config");
class UserRepository {
    async create(data) {
        const payload = {
            phoneWhats: data.phoneWhats,
            name: data.name || null,
            email: data.email || null,
            role: data.role || 'CARE_GIVER',
        };
        if (data.patientId) {
            payload.patients = {
                connect: { id: data.patientId }
            };
        }
        return await prisma_config_1.prisma.user.create({
            data: payload,
        });
    }
    async findByEmail(email) {
        return await prisma_config_1.prisma.user.findUnique({
            where: { email },
        });
    }
    async findByPhoneWhats(phoneWhats) {
        return await prisma_config_1.prisma.user.findUnique({
            where: { phoneWhats },
        });
    }
    async findById(id) {
        return await prisma_config_1.prisma.user.findUnique({
            where: { id },
        });
    }
    async findByPatientId(patientId) {
        return await prisma_config_1.prisma.user.findMany({
            where: {
                patients: {
                    some: { id: patientId }
                }
            }
        });
    }
    async update(id, data) {
        return await prisma_config_1.prisma.user.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        await prisma_config_1.prisma.user.delete({
            where: { id },
        });
    }
}
exports.UserRepository = UserRepository;
