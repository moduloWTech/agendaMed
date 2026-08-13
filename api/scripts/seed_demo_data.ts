import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { prisma } from '../src/DB/prisma.config';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  console.log('🧹 Limpando o banco de dados completamente...');

  // Desconecta a relação bidirecional entre Tenant e User para evitar erro de chave estrangeira
  await prisma.user.updateMany({ data: { tenantId: null } });

  // Deleta dados existentes em ordem limpa
  await prisma.medicationHistory.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.pushSubscription.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Banco de dados zerado com sucesso!');
  console.log('🌱 Cadastrando dados reais de teste e demonstração...');

  // 1. Criar o Usuário Principal (Cuidadora / Familiar Responsável)
  const passwordHash = await bcrypt.hash('AgendaMed2026!', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo.cuidador@agendamed.com.br',
      name: 'Dra. Maria Fernanda (Cuidadora)',
      phoneWhats: '5585999998888',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // 2. Criar o Tenant (Conta da Família)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Família Silva - Cuidados',
      subscriptionStatus: 'PRO', // Status PRO liberado para testes e gravação do vídeo
      ownerId: user.id,
    },
  });

  // Atualiza o tenantId do usuário
  await prisma.user.update({
    where: { id: user.id },
    data: { tenantId: tenant.id },
  });

  // 3. Criar a Paciente Real (Dona Maria Francisca - 82 anos)
  const patient = await prisma.patient.create({
    data: {
      name: 'Dona Maria Francisca',
      birthDate: new Date('1944-05-15T00:00:00Z'),
      tenantId: tenant.id,
      users: {
        connect: [{ id: user.id }],
      },
    },
  });

  console.log(`👵 Paciente criada: ${patient.name} (82 anos)`);

  // 4. Cadastrar os Medicamentos Reais de Uso Contínuo
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - 14);

  const losartana = await prisma.medication.create({
    data: {
      name: 'Losartana Potássica',
      dosage: '50mg',
      frequency: '12 em 12 horas',
      startDate: startDate,
      startTime: '08:00',
      times: ['08:00', '20:00'],
      active: true,
      instructions: 'Tomar 1 comprimido com água após o café da manhã e após o jantar.',
      patientId: patient.id,
    },
  });

  const metformina = await prisma.medication.create({
    data: {
      name: 'Metformina',
      dosage: '850mg',
      frequency: 'Diário',
      startDate: startDate,
      startTime: '12:00',
      times: ['12:00'],
      active: true,
      instructions: 'Tomar junto com a refeição do almoço.',
      patientId: patient.id,
    },
  });

  const sinvastatina = await prisma.medication.create({
    data: {
      name: 'Sinvastatina',
      dosage: '20mg',
      frequency: 'Diário',
      startDate: startDate,
      startTime: '21:30',
      times: ['21:30'],
      active: true,
      instructions: 'Tomar à noite antes de dormir.',
      patientId: patient.id,
    },
  });

  const omeprazol = await prisma.medication.create({
    data: {
      name: 'Omeprazol',
      dosage: '20mg',
      frequency: 'Diário',
      startDate: startDate,
      startTime: '07:00',
      times: ['07:00'],
      active: true,
      instructions: 'Em jejum, 30 minutos antes do café da manhã.',
      patientId: patient.id,
    },
  });

  console.log('💊 4 Medicamentos reais cadastrados para a rotina diária!');

  // 5. Gerar Histórico de Check-ins (Últimos 14 Dias) com ~95% de Taxa de Adesão
  console.log('📊 Gerando histórico real de check-ins dos últimos 14 dias...');

  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Losartana 08:00
    await prisma.medicationHistory.create({
      data: {
        medicationId: losartana.id,
        patientId: patient.id,
        userId: user.id,
        date: dateStr,
        time: '08:00',
        takenAt: new Date(`${dateStr}T08:05:00Z`),
      },
    });

    // Omeprazol 07:00
    await prisma.medicationHistory.create({
      data: {
        medicationId: omeprazol.id,
        patientId: patient.id,
        userId: user.id,
        date: dateStr,
        time: '07:00',
        takenAt: new Date(`${dateStr}T07:02:00Z`),
      },
    });

    // Metformina 12:00
    await prisma.medicationHistory.create({
      data: {
        medicationId: metformina.id,
        patientId: patient.id,
        userId: user.id,
        date: dateStr,
        time: '12:00',
        takenAt: new Date(`${dateStr}T12:15:00Z`),
      },
    });

    // Losartana 20:00 (Simula 1 falha no dia 5 para ficar 100% realista)
    if (i !== 5) {
      await prisma.medicationHistory.create({
        data: {
          medicationId: losartana.id,
          patientId: patient.id,
          userId: user.id,
          date: dateStr,
          time: '20:00',
          takenAt: new Date(`${dateStr}T20:10:00Z`),
        },
      });
    }

    // Sinvastatina 21:30
    await prisma.medicationHistory.create({
      data: {
        medicationId: sinvastatina.id,
        patientId: patient.id,
        userId: user.id,
        date: dateStr,
        time: '21:30',
        takenAt: new Date(`${dateStr}T21:32:00Z`),
      },
    });
  }

  // 6. Cadastrar Documentos Reais no Cofre (Vault)
  await prisma.document.create({
    data: {
      title: 'Receita Médica - Losartana e Metformina (Dr. Roberto Santos)',
      category: 'RECEITA',
      date: new Date('2026-07-15T00:00:00Z'),
      fileUrl: 'https://agendamed.moduloweb.com.br/assets/login-bg-itVKTsK2.png',
      patientId: patient.id,
    },
  });

  await prisma.document.create({
    data: {
      title: 'Exame de Sangue - Hemograma & Glicemia em Jejum',
      category: 'EXAME',
      date: new Date('2026-08-01T00:00:00Z'),
      fileUrl: 'https://agendamed.moduloweb.com.br/assets/login-bg-itVKTsK2.png',
      patientId: patient.id,
    },
  });

  // 7. Cadastrar Consultas na Agenda
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 5);

  const nextMonth = new Date();
  nextMonth.setDate(now.getDate() + 12);

  await prisma.appointment.create({
    data: {
      specialty: 'Cardiologia',
      doctorName: 'Dr. Roberto Santos',
      location: 'Clínica CardioVida - Sala 402',
      date: nextWeek,
      time: '14:30',
      patientId: patient.id,
      notes: 'Levar os exames de sangue recentes e o Relatório Médico em PDF de adesão.',
    },
  });

  await prisma.appointment.create({
    data: {
      specialty: 'Endocrinologia',
      doctorName: 'Dra. Ana Pires',
      location: 'Centro Médico São Lucas',
      date: nextMonth,
      time: '10:00',
      patientId: patient.id,
      notes: 'Avaliação da dosagem da Metformina.',
    },
  });

  console.log('----------------------------------------------------');
  console.log('🎉 BANCO DE DADOS POPULADO COM DADOS REAIS DE TESTE!');
  console.log('----------------------------------------------------');
  console.log('🔑 CREDENCIAIS DE LOGIN NO APP:');
  console.log('  E-mail:   demo.cuidador@agendamed.com.br');
  console.log('  Senha:    AgendaMed2026!');
  console.log('  Paciente: Dona Maria Francisca (82 anos)');
  console.log('  Status:   Família PRO (Relatórios & Histórico Ilimitado)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular banco de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
