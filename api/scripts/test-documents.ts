const BASE_URL = 'http://127.0.0.1:3333/api';

async function runDocumentTests() {
  console.log('🧪 Iniciando testes do módulo DOCUMENTOS (Documents)...\n');

  try {
    // 1. Setup Mock User
    console.log('➡️ [1/8] Setup: Criando Cuidador MOCK...');
    const mockUser = {
      phoneWhats: `5511666${Math.floor(100000 + Math.random() * 900000)}`,
      name: 'Cuidador Documentos',
      email: `cuidador-doc-${Date.now()}@mwt.com`,
      role: 'CARE_GIVER'
    };
    const userRes = await fetch(`${BASE_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mockUser) });
    const userData = await userRes.json();
    const userId = userData.id;

    // 2. Setup Mock Patient
    console.log(`➡️ [2/8] Setup: Criando Paciente MOCK para Cuidador ${userId}...`);
    const mockPatient = {
      name: 'Paciente Documentos',
      birthDate: new Date('1950-01-01').toISOString(),
      userId: userId
    };
    const patientRes = await fetch(`${BASE_URL}/patients`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mockPatient) });
    const patientData = await patientRes.json();
    const patientId = patientData.id;
    console.log(`✅ Paciente criado com ID: ${patientId}`);

    // 3. Criar Documento (POST)
    console.log('\n➡️ [3/8] Testando criação de Documento (POST /documents)...');
    const newDocument = {
      title: 'Receita de Losartana',
      category: 'recipe', // Validação Zod: 'recipe', 'exam', 'report', 'other'
      date: new Date().toISOString(),
      fileUrl: 'https://s3.aws.com/minha-receita.pdf',
      patientId: patientId
    };
    
    const createRes = await fetch(`${BASE_URL}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDocument)
    });
    const createdData = await createRes.json();
    
    if (!createRes.ok) throw new Error(`Falha na criação do documento: ${JSON.stringify(createdData)}`);
    console.log(`✅ Documento criado: ${createdData.title} (${createdData.category})`);
    
    const documentId = createdData.id;

    // 4. Buscar Documento por ID (GET)
    console.log(`\n➡️ [4/8] Testando busca de Documento por ID (GET /documents/${documentId})...`);
    const getRes = await fetch(`${BASE_URL}/documents/${documentId}`);
    const getData = await getRes.json();
    
    if (!getRes.ok) throw new Error(`Falha na busca: ${JSON.stringify(getData)}`);
    console.log(`✅ Documento encontrado: ${getData.title}`);

    // 5. Buscar Documentos do Paciente (GET)
    console.log(`\n➡️ [5/8] Testando listagem de Documentos do Paciente (GET /patients/${patientId}/documents)...`);
    const listRes = await fetch(`${BASE_URL}/patients/${patientId}/documents`);
    const listData = await listRes.json();
    
    if (!listRes.ok || listData.length === 0) throw new Error(`Falha na listagem: ${JSON.stringify(listData)}`);
    console.log(`✅ Documentos listados com sucesso. Encontrados: ${listData.length}`);

    // 6. Atualizar Documento (PUT)
    console.log(`\n➡️ [6/8] Testando edição de Documento (PUT /documents/${documentId})...`);
    const updateRes = await fetch(`${BASE_URL}/documents/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'exam', title: 'Exame de Sangue' })
    });
    const updateData = await updateRes.json();
    
    if (!updateRes.ok) throw new Error(`Falha na edição: ${JSON.stringify(updateData)}`);
    console.log(`✅ Documento editado: Novo título -> ${updateData.title}, Nova Categ -> ${updateData.category}`);

    // 7. Testar Falha de Regra de Negócio (Paciente Inexistente)
    console.log(`\n➡️ [7/8] Testando Regra de Negócio: Criar documento para Paciente Falso...`);
    const badCreateRes = await fetch(`${BASE_URL}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newDocument, patientId: '11111111-1111-4111-a111-111111111111' })
    });
    if (badCreateRes.status !== 404) throw new Error(`Deveria ter bloqueado a criação! Recebeu status ${badCreateRes.status}`);
    console.log(`✅ Regra validada com sucesso! Erro 404 retornado corretamente.`);

    // 8. Deletar Documento (DELETE)
    console.log(`\n➡️ [8/8] Testando exclusão de Documento (DELETE /documents/${documentId})...`);
    const deleteRes = await fetch(`${BASE_URL}/documents/${documentId}`, { method: 'DELETE' });
    
    if (!deleteRes.ok) throw new Error('Falha na exclusão do Documento');
    console.log('✅ Documento deletado com sucesso (204 No Content)');

    console.log('\n🎉 TODOS OS TESTES DO MÓDULO DOCUMENTOS PASSARAM COM SUCESSO!');

  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES DE DOCUMENTOS:', error);
  }
}

runDocumentTests();
