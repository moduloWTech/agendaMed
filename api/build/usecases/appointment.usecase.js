"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentUseCase = void 0;
const zod_1 = require("zod");
class AppointmentUseCase {
    appointmentRepository;
    constructor(appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }
    async createAppointment(data) {
        const schema = zod_1.z.object({
            specialty: zod_1.z.string().min(2, 'Especialidade é obrigatória'),
            doctorName: zod_1.z.string().optional(),
            date: zod_1.z.string().min(1, 'Data é obrigatória'),
            time: zod_1.z.string().min(1, 'Horário é obrigatório'),
            location: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional(),
            alertEnabled: zod_1.z.boolean().optional(),
            alertHoursBefore: zod_1.z.number().optional(),
            intensiveAlerts: zod_1.z.boolean().optional(),
            patientId: zod_1.z.string().uuid('ID do paciente inválido'),
        });
        const parsedData = schema.parse(data);
        return this.appointmentRepository.create(parsedData);
    }
    async getAppointmentsByPatient(patientId) {
        return this.appointmentRepository.findByPatientId(patientId);
    }
    async getAppointmentById(id) {
        return this.appointmentRepository.findById(id);
    }
    async updateAppointment(id, data) {
        const schema = zod_1.z.object({
            specialty: zod_1.z.string().min(2).optional(),
            doctorName: zod_1.z.string().optional(),
            date: zod_1.z.string().optional(),
            time: zod_1.z.string().optional(),
            location: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional(),
            alertEnabled: zod_1.z.boolean().optional(),
            alertHoursBefore: zod_1.z.number().optional(),
            intensiveAlerts: zod_1.z.boolean().optional(),
        });
        const parsedData = schema.parse(data);
        return this.appointmentRepository.update(id, parsedData);
    }
    async deleteAppointment(id) {
        return this.appointmentRepository.delete(id);
    }
}
exports.AppointmentUseCase = AppointmentUseCase;
