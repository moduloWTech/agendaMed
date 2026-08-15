"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronRepository = void 0;
const prisma_config_1 = require("../DB/prisma.config");
class CronRepository {
    async findActiveMedicationsWithUsers() {
        const medications = await prisma_config_1.prisma.medication.findMany({
            where: { active: true },
            include: {
                patient: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                name: true,
                                phoneWhats: true,
                            },
                        },
                    },
                },
            },
        });
        return medications;
    }
    async hasTakenMedication(medicationId, dateStr, timeStr) {
        const record = await prisma_config_1.prisma.medicationHistory.findFirst({
            where: {
                medicationId,
                date: dateStr,
                time: timeStr,
            },
        });
        return record !== null;
    }
}
exports.CronRepository = CronRepository;
