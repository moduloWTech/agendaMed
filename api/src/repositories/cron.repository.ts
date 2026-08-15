import { prisma } from '../DB/prisma.config';
import { ICronRepository, ScheduledMedicationWithPatient } from '../interfaces/cron.interface';

export class CronRepository implements ICronRepository {
  async findActiveMedicationsWithUsers(): Promise<ScheduledMedicationWithPatient[]> {
    const medications = await prisma.medication.findMany({
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

    return medications as ScheduledMedicationWithPatient[];
  }

  async hasTakenMedication(medicationId: string, dateStr: string, timeStr: string): Promise<boolean> {
    const record = await prisma.medicationHistory.findFirst({
      where: {
        medicationId,
        date: dateStr,
        time: timeStr,
      },
    });

    return record !== null;
  }
}
