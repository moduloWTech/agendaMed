const BASE_URL = 'http://127.0.0.1:3333/api';

async function runMedicationTests() {
  console.log('🧪 Iniciando testes do módulo MEDICAMENTOS (Medications)...\n');

  try {
    // 1. Setup Mock User
    console.log('➡️ [1/8] Setup: Criando Cuidador MOCK...');
    const mockUser = {
      name: 'Cuidador Remédios',
      email: `cuidador-med-${Date.now()}@mwt.com`,
      role: 'CARE_GIVER'
    };
    const userRes = await fetch(`${BASE_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mockUser) });
    const userData = await userRes.json();
    const userId = userData.id;

    // 2. Setup Mock Patient
    console.log(`➡️ [2/8] Setup: Criando Paciente MOCK para Cuidador ${userId}...`);
    const mockPatient = {
      name: 'Paciente Remédios',
      birthDate: new Date('1940-01-01').toISOString(),
      userId: userId
    };
    const patientRes = await fetch(`${BASE_URL}/patients`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mockPatient) });
    const patientData = await patientRes.json();
    const patientId = patientData.id;
    console.log(`✅ Paciente criado com ID: ${patientId}`);

    // 3. Criar Medicamento (POST)
    console.log('\n➡️ [3/8] Testando criação de Medicamento (POST /medications)...');
    const newMedication = {
      name: 'Losartana 50mg',
      dosage: '1 comprimido',
      frequency: '12h',
      startDate: new Date().toISOString(),
      startTime: '08:00',
      patientId: patientId
    };
    
    const createRes = await fetch(`${BASE_URL}/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMedication)
    });
    const createdData = await createRes.json();
    
    if (!createRes.ok) throw new Error(`Falha na criação do medicamento: ${JSON.stringify(createdData)}`);
    console.log(`✅ Medicamento criado: ${createdData.name} (${createdData.dosage})`);
    
    const medicationId = createdData.id;

    // 4. Buscar Medicamento por ID (GET)
    console.log(`\n➡️ [4/8] Testando busca de Medicamento por ID (GET /medications/${medicationId})...`);
    const getRes = await fetch(`${BASE_URL}/medications/${medicationId}`);
    const getData = await getRes.json();
    
    if (!getRes.ok) throw new Error(`Falha na busca: ${JSON.stringify(getData)}`);
    console.log(`✅ Medicamento encontrado: ${getData.name}`);

    // 5. Buscar Medicamentos do Paciente (GET)
    console.log(`\n➡️ [5/8] Testando listagem de Medicamentos do Paciente (GET /patients/${patientId}/medications)...`);
    const listRes = await fetch(`${BASE_URL}/patients/${patientId}/medications`);
    const listData = await listRes.json();
    
    if (!listRes.ok || listData.length === 0) throw new Error(`Falha na listagem: ${JSON.stringify(listData)}`);
    console.log(`✅ Medicamentos listados com sucesso. Encontrados: ${listData.length}`);

    // 6. Atualizar Medicamento (PUT)
    console.log(`\n➡️ [6/8] Testando edição de Medicamento (PUT /medications/${medicationId})...`);
    const updateRes = await fetch(`${BASE_URL}/medications/${medicationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dosage: '2 comprimidos', frequency: '8h' })
    });
    const updateData = await updateRes.json();
    
    if (!updateRes.ok) throw new Error(`Falha na edição: ${JSON.stringify(updateData)}`);
    console.log(`✅ Medicamento editado: Nova dosagem -> ${updateData.dosage}, Nova Freq -> ${updateData.frequency}`);

    // 7. Testar Falha de Regra de Negócio (Paciente Inexistente)
    console.log(`\n➡️ [7/8] Testando Regra de Negócio: Criar medicamento para Paciente Falso...`);
    const badCreateRes = await fetch(`${BASE_URL}/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newMedication, patientId: '11111111-1111-4111-a111-111111111111' })
    });
    if (badCreateRes.status !== 404) throw new Error(`Deveria ter bloqueado a criação! Recebeu ${badCreateRes.status}: ${JSON.stringify(await badCreateRes.json())}`);
    console.log(`✅ Regra validada com sucesso! Erro 404 retornado corretamente.`);

    // 8. Deletar Medicamento (DELETE)
    console.log(`\n➡️ [8/8] Testando exclusão de Medicamento (DELETE /medications/${medicationId})...`);
    const deleteRes = await fetch(`${BASE_URL}/medications/${medicationId}`, { method: 'DELETE' });
    
    if (!deleteRes.ok) throw new Error('Falha na exclusão do Medicamento');
    console.log('✅ Medicamento deletado com sucesso (204 No Content)');

    console.log('\n🎉 TODOS OS TESTES DO MÓDULO MEDICAMENTOS PASSARAM COM SUCESSO!');

  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES DE MEDICAMENTOS:', error);
  }
}

runMedicationTests();
