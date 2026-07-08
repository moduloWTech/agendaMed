"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRepository = void 0;
const prisma_config_1 = require("../DB/prisma.config");
class AppointmentRepository {
    async create(data) {
        return await prisma_config_1.prisma.appointment.create({
            data: {
                specialty: data.specialty,
                doctorName: data.doctorName,
                date: new Date(data.date),
                time: data.time,
                location: data.location,
                notes: data.notes,
                alertEnabled: data.alertEnabled ?? true,
                alertHoursBefore: data.alertHoursBefore ?? 24,
                intensiveAlerts: data.intensiveAlerts ?? false,
                patientId: data.patientId,
            },
        });
    }
    async findById(id) {
        return await prisma_config_1.prisma.appointment.findUnique({
            where: { id },
        });
    }
    async findByPatientId(patientId) {
        return await prisma_config_1.prisma.appointment.findMany({
            where: { patientId },
            orderBy: { date: 'asc' }
        });
    }
    async update(id, data) {
        const updateData = { ...data };
        if (data.date) {
            updateData.date = new Date(data.date);
        }
        return await prisma_config_1.prisma.appointment.update({
            where: { id },
            data: updateData,
        });
    }
    async delete(id) {
        await prisma_config_1.prisma.appointment.delete({
            where: { id },
        });
    }
}
exports.AppointmentRepository = AppointmentRepository;
