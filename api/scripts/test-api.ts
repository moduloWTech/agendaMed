const BASE_URL = 'http://127.0.0.1:3333/api';

async function runTests() {
  console.log('🧪 Iniciando testes de conexão com o Backend...\n');

  try {
    // 1. Teste de Health-Check
    console.log('➡️ [1/5] Testando rota de Health-Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    if (healthRes.ok) {
      console.log('✅ Health-Check passou:', healthData);
    } else {
      throw new Error('Falha no Health-Check');
    }

    // 2. Teste de Criação de Usuário (POST)
    console.log('\n➡️ [2/5] Testando criação de usuário (POST /users)...');
    const newUser = {
      name: 'Tester da Silva',
      email: `tester-${Date.now()}@mwt.com`,
      role: 'CARE_GIVER'
    };
    
    const createRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    const createdData = await createRes.json();
    
    if (!createRes.ok) throw new Error(`Falha na criação: ${JSON.stringify(createdData)}`);
    console.log('✅ Usuário criado:', createdData);
    
    const userId = createdData.id;

    // 3. Teste de Leitura de Usuário (GET)
    console.log(`\n➡️ [3/5] Testando busca de usuário (GET /users/${userId})...`);
    const getRes = await fetch(`${BASE_URL}/users/${userId}`);
    const getData = await getRes.json();
    
    if (!getRes.ok) throw new Error(`Falha na busca: ${JSON.stringify(getData)}`);
    console.log('✅ Usuário encontrado:', getData.name);

    // 4. Teste de Atualização (PUT)
    console.log(`\n➡️ [4/5] Testando edição de usuário (PUT /users/${userId})...`);
    const updateRes = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester da Silva Editado' })
    });
    const updateData = await updateRes.json();
    
    if (!updateRes.ok) throw new Error(`Falha na edição: ${JSON.stringify(updateData)}`);
    console.log('✅ Usuário editado:', updateData.name);

    // 5. Teste de Exclusão (DELETE)
    console.log(`\n➡️ [5/5] Testando exclusão de usuário (DELETE /users/${userId})...`);
    const deleteRes = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'DELETE'
    });
    
    if (!deleteRes.ok) throw new Error('Falha na exclusão');
    console.log('✅ Usuário deletado com sucesso (204 No Content)');

    console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO! O Banco de Dados e a Arquitetura estão 100% integrados.');

  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES:', error);
  }
}

runTests();
