export interface ScheduledMedicationWithPatient {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  startTime: string;
  times: string[];
  active: boolean;
  patient: {
    id: string;
    name: string;
    users: Array<{
      id: string;
      name: string | null;
      phoneWhats: string;
    }>;
  };
}

export interface CronExecutionDetail {
  medicationId: string;
  medicationName: string;
  patientName: string;
  scheduledTime: string;
  delayMinutes: number;
  usersNotifiedCount: number;
}

export interface CronExecutionReport {
  success: boolean;
  timestamp: string;
  fortalezaTime: {
    date: string;
    time: string;
  };
  totalActiveMedications: number;
  totalNotificationsSent: number;
  details: CronExecutionDetail[];
  message: string;
}

export interface ICronRepository {
  findActiveMedicationsWithUsers(): Promise<ScheduledMedicationWithPatient[]>;
  hasTakenMedication(medicationId: string, dateStr: string, timeStr: string): Promise<boolean>;
}

export interface CronExecuteDTO {
  providedSecret?: string;
}

export interface ICronUseCase {
  execute(dto?: CronExecuteDTO): Promise<CronExecutionReport>;
}
