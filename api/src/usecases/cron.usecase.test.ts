import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CronUseCase } from './cron.usecase';
import { ICronRepository, ScheduledMedicationWithPatient } from '../interfaces/cron.interface';

class MockCronRepository implements ICronRepository {
  public medications: ScheduledMedicationWithPatient[] = [];
  public takenRecords: Set<string> = new Set();

  async findActiveMedicationsWithUsers(): Promise<ScheduledMedicationWithPatient[]> {
    return this.medications;
  }

  async hasTakenMedication(medicationId: string, dateStr: string, timeStr: string): Promise<boolean> {
    return this.takenRecords.has(`${medicationId}_${dateStr}_${timeStr}`);
  }
}

describe('CronUseCase - Diretrizes Rigorosas de Testes (MW Technology)', () => {
  const basePatient = {
    id: 'patient-123',
    name: 'Dona Maria Francisca',
    users: [
      { id: 'user-admin-1', name: 'Dra. Maria Fernanda', phoneWhats: '5585999998888' },
      { id: 'user-care-1', name: 'Cláudio Soares', phoneWhats: '5598985042318' }
    ]
  };

  it('deve normalizar frequências em português e inglês para o padrão oficial em inglês', () => {
    const repo = new MockCronRepository();
    const useCase = new CronUseCase(repo);
    const normalize = (useCase as any).normalizeFrequency.bind(useCase);

    assert.equal(normalize('diário'), 'daily');
    assert.equal(normalize('Diário'), 'daily');
    assert.equal(normalize('daily'), 'daily');
    assert.equal(normalize('dose única'), 'single');
    assert.equal(normalize('single'), 'single');
    assert.equal(normalize('semanal'), 'weekly');
    assert.equal(normalize('weekly'), 'weekly');
    assert.equal(normalize('mensal'), 'monthly');
    assert.equal(normalize('monthly'), 'monthly');
    assert.equal(normalize('manual'), 'manual');
    assert.equal(normalize('12 em 12 horas'), '12h');
    assert.equal(normalize('8 em 8 horas'), '8h');
    assert.equal(normalize('a cada 6 horas'), '6h');
    assert.equal(normalize('4h'), '4h');
  });

  it('deve calcular corretamente os horários do dia para medicamentos diários e intervalados', () => {
    const repo = new MockCronRepository();
    const useCase = new CronUseCase(repo);
    const getTimes = (useCase as any).getTimesForToday.bind(useCase);

    const todayStr = '2026-08-16';

    // Diário iniciado no passado
    const medDiario = {
      frequency: 'Diário',
      startTime: '12:00',
      times: ['12:00'],
      startDate: new Date('2026-07-30')
    };
    assert.deepEqual(getTimes(medDiario, todayStr, '2026-07-30'), ['12:00']);

    // Diário com início no futuro não deve retornar doses
    assert.deepEqual(getTimes(medDiario, todayStr, '2026-08-20'), []);

    // 12 em 12 horas (com array times pré-definido)
    const med12h = {
      frequency: '12 em 12 horas',
      startTime: '08:00',
      times: ['08:00', '20:00'],
      startDate: new Date('2026-07-30')
    };
    assert.deepEqual(getTimes(med12h, todayStr, '2026-07-30'), ['08:00', '20:00']);

    // 8 em 8 horas sem array times (deve calcular 3 doses a partir de 06:00)
    const med8h = {
      frequency: '8 em 8 horas',
      startTime: '06:00',
      times: [],
      startDate: new Date('2026-07-30')
    };
    assert.deepEqual(getTimes(med8h, todayStr, '2026-07-30'), ['06:00', '14:00', '22:00']);

    // Dose única (apenas no dia exato de início)
    const medSingle = {
      frequency: 'single',
      startTime: '09:15',
      times: [],
      startDate: new Date('2026-08-16')
    };
    assert.deepEqual(getTimes(medSingle, '2026-08-16', '2026-08-16'), ['09:15']);
    assert.deepEqual(getTimes(medSingle, '2026-08-17', '2026-08-16'), []);
  });

  it('deve disparar notificação quando o horário atual coincidir com a dose (minuto 0)', async () => {
    const repo = new MockCronRepository();
    repo.medications = [
      {
        id: 'med-1',
        name: 'Metformina',
        dosage: '850mg',
        frequency: 'Diário',
        startDate: new Date('2026-07-30T00:00:00.000Z'),
        startTime: '12:00',
        times: ['12:00'],
        active: true,
        patientId: 'patient-123',
        instructions: 'Tomar com água',
        photoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: basePatient
      } as any
    ];

    const useCase = new CronUseCase(repo);
    // Simula horário exato 12:00
    (useCase as any).getFortalezaTime = () => ({ dateStr: '2026-08-16', timeStr: '12:00' });

    const report = await useCase.execute();

    assert.equal(report.success, true);
    assert.equal(report.totalActiveMedications, 1);
    assert.equal(report.totalNotificationsSent, 2); // 2 usuários vinculados ao paciente
    assert.equal(report.details.length, 1);
    assert.equal(report.details[0].medicationName, 'Metformina');
    assert.equal(report.details[0].delayMinutes, 0);
  });

  it('deve disparar na janela de atraso/insistência (ex: 2 min de atraso)', async () => {
    const repo = new MockCronRepository();
    repo.medications = [
      {
        id: 'med-1',
        name: 'Metformina',
        dosage: '850mg',
        frequency: 'daily',
        startDate: new Date('2026-07-30T00:00:00.000Z'),
        startTime: '12:00',
        times: ['12:00'],
        active: true,
        patientId: 'patient-123',
        instructions: '',
        photoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: basePatient
      } as any
    ];

    const useCase = new CronUseCase(repo);
    // Simula 12:02 (2 min após o horário)
    (useCase as any).getFortalezaTime = () => ({ dateStr: '2026-08-16', timeStr: '12:02' });

    const report = await useCase.execute();

    assert.equal(report.success, true);
    assert.equal(report.totalNotificationsSent, 2);
    assert.equal(report.details[0].delayMinutes, 2);
  });

  it('NÃO deve disparar notificação se a dose já foi registrada como tomada no histórico', async () => {
    const repo = new MockCronRepository();
    repo.medications = [
      {
        id: 'med-1',
        name: 'Metformina',
        dosage: '850mg',
        frequency: 'daily',
        startDate: new Date('2026-07-30T00:00:00.000Z'),
        startTime: '12:00',
        times: ['12:00'],
        active: true,
        patientId: 'patient-123',
        instructions: '',
        photoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: basePatient
      } as any
    ];

    // Registra que a dose de 12:00 de hoje já foi tomada
    repo.takenRecords.add('med-1_2026-08-16_12:00');

    const useCase = new CronUseCase(repo);
    (useCase as any).getFortalezaTime = () => ({ dateStr: '2026-08-16', timeStr: '12:00' });

    const report = await useCase.execute();

    assert.equal(report.success, true);
    assert.equal(report.totalNotificationsSent, 0);
    assert.equal(report.details.length, 0);
  });

  it('deve validar o segredo CRON_SECRET quando configurado nas variáveis de ambiente', async () => {
    const repo = new MockCronRepository();
    const useCase = new CronUseCase(repo);

    process.env.CRON_SECRET = 'segredo_forte_mwt_2026';

    try {
      // Sem fornecer a chave
      await assert.rejects(
        async () => useCase.execute({ providedSecret: undefined }),
        /Acesso não autorizado/
      );

      // Com chave inválida
      await assert.rejects(
        async () => useCase.execute({ providedSecret: 'chave_errada' }),
        /Acesso não autorizado/
      );

      // Com chave correta
      const report = await useCase.execute({ providedSecret: 'segredo_forte_mwt_2026' });
      assert.equal(report.success, true);
    } finally {
      delete process.env.CRON_SECRET;
    }
  });
});
