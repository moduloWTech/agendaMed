import { IAppointmentRepository, IAppointmentCreate, IAppointmentUpdate } from '../interfaces/appointment.interface';
import type { Appointment } from '../generated/prisma/client';
import { prisma } from '../DB/prisma.config';

export class AppointmentRepository implements IAppointmentRepository {
  async create(data: IAppointmentCreate): Promise<Appointment> {
    return await prisma.appointment.create({
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

  async findById(id: string): Promise<Appointment | null> {
    return await prisma.appointment.findUnique({
      where: { id },
    });
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    return await prisma.appointment.findMany({
      where: { patientId },
      orderBy: { date: 'asc' }
    });
  }

  async update(id: string, data: IAppointmentUpdate): Promise<Appointment> {
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return await prisma.appointment.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.appointment.delete({
      where: { id },
    });
  }
}
