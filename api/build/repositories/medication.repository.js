"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationRepository = void 0;
const prisma_config_1 = require("../DB/prisma.config");
class MedicationRepository {
    async create(data) {
        return await prisma_config_1.prisma.medication.create({
            data: {
                name: data.name,
                dosage: data.dosage,
                instructions: data.instructions,
                frequency: data.frequency,
                startDate: new Date(data.startDate),
                startTime: data.startTime,
                times: data.times || [],
                active: data.active ?? true,
                photoUrl: data.photoUrl || null,
                patientId: data.patientId,
            },
        });
    }
    async findById(id) {
        return await prisma_config_1.prisma.medication.findUnique({
            where: { id },
        });
    }
    async findByPatientId(patientId) {
        return await prisma_config_1.prisma.medication.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async update(id, data) {
        const updateData = { ...data };
        if (data.startDate) {
            updateData.startDate = new Date(data.startDate);
        }
        return await prisma_config_1.prisma.medication.update({
            where: { id },
            data: updateData,
        });
    }
    async delete(id) {
        await prisma_config_1.prisma.medication.delete({
            where: { id },
        });
    }
}
exports.MedicationRepository = MedicationRepository;
