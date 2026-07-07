const BASE_URL = 'http://127.0.0.1:3333/api';

async function runPatientTests() {
  console.log('🧪 Iniciando testes do módulo PACIENTES (Patients)...\n');

  try {
    // 1. Criar um Cuidador (User) MOCK para atrelar o paciente
    console.log('➡️ [1/6] Criando Cuidador (User) MOCK...');
    const mockUser = {
      phoneWhats: `5511888${Math.floor(100000 + Math.random() * 900000)}`,
      name: 'Cuidador Mock',
      email: `cuidador-${Date.now()}@mwt.com`,
      role: 'CARE_GIVER'
    };
    const userRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockUser)
    });
    const userData = await userRes.json();
    if (!userRes.ok) throw new Error(`Falha ao criar Cuidador: ${JSON.stringify(userData)}`);
    const userId = userData.id;
    console.log(`✅ Cuidador criado (ID: ${userId})`);

    // 2. Criar Paciente (POST)
    console.log('\n➡️ [2/6] Testando criação de Paciente (POST /patients)...');
    const newPatient = {
      name: 'Dona Maria Mock',
      birthDate: new Date('1950-05-15').toISOString(),
      userId: userId
    };
    
    const createRes = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPatient)
    });
    const createdData = await createRes.json();
    
    if (!createRes.ok) throw new Error(`Falha na criação do paciente: ${JSON.stringify(createdData)}`);
    console.log('✅ Paciente criado:', createdData.name);
    
    const patientId = createdData.id;

    // 3. Buscar Paciente por ID (GET)
    console.log(`\n➡️ [3/6] Testando busca de Paciente por ID (GET /patients/${patientId})...`);
    const getRes = await fetch(`${BASE_URL}/patients/${patientId}`);
    const getData = await getRes.json();
    
    if (!getRes.ok) throw new Error(`Falha na busca: ${JSON.stringify(getData)}`);
    console.log('✅ Paciente encontrado:', getData.name);

    // 4. Buscar Pacientes do Cuidador (GET)
    console.log(`\n➡️ [4/6] Testando listagem de Pacientes do Cuidador (GET /users/${userId}/patients)...`);
    const listRes = await fetch(`${BASE_URL}/users/${userId}/patients`);
    const listData = await listRes.json();
    
    if (!listRes.ok || listData.length === 0) throw new Error(`Falha na listagem: ${JSON.stringify(listData)}`);
    console.log(`✅ Pacientes listados com sucesso. Encontrados: ${listData.length}`);

    // 5. Atualizar Paciente (PUT)
    console.log(`\n➡️ [5/6] Testando edição de Paciente (PUT /patients/${patientId})...`);
    const updateRes = await fetch(`${BASE_URL}/patients/${patientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Dona Maria Editada' })
    });
    const updateData = await updateRes.json();
    
    if (!updateRes.ok) throw new Error(`Falha na edição: ${JSON.stringify(updateData)}`);
    console.log('✅ Paciente editado:', updateData.name);

    // 6. Deletar Paciente (DELETE)
    console.log(`\n➡️ [6/6] Testando exclusão de Paciente (DELETE /patients/${patientId})...`);
    const deleteRes = await fetch(`${BASE_URL}/patients/${patientId}`, {
      method: 'DELETE'
    });
    
    if (!deleteRes.ok) throw new Error('Falha na exclusão do Paciente');
    console.log('✅ Paciente deletado com sucesso (204 No Content)');

    console.log('\n🎉 TODOS OS TESTES DO MÓDULO PACIENTES PASSARAM COM SUCESSO!');

  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES DE PACIENTES:', error);
  }
}

runPatientTests();
