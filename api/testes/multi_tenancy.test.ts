import assert from 'node:assert';

const API_URL = 'http://localhost:3333/api';

async function runTests() {
  console.log('🧪 Iniciando testes de Multi-Tenancy (Isolamento de Dados)...');

  try {
    // Limpa o banco antes de testar (só porque é dev local)
    // omitido para testar na raça

    // 1. Cadastra Usuário A (Tenant A)
    const resA = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Usuário A',
        email: 'a@teste.com',
        phoneWhats: '11999999991',
        password: 'password123'
      })
    });
    const textA = await resA.text();
    assert(resA.status === 201, 'Falha ao registrar Usuário A: ' + textA);
    const dataA = JSON.parse(textA);
    const tokenA = dataA.accessToken;
    console.log('✅ Usuário A e Tenant A criados.');

    // 2. Cadastra Usuário B (Tenant B)
    const resB = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Usuário B',
        email: 'b@teste.com',
        phoneWhats: '11999999992',
        password: 'password123'
      })
    });
    const textB = await resB.text();
    assert(resB.status === 201, 'Falha ao registrar Usuário B: ' + textB);
    const dataB = JSON.parse(textB);
    const tokenB = dataB.accessToken;
    console.log('✅ Usuário B e Tenant B criados.');

    // 3. Usuário A cria um Paciente
    const resPatA = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: 'Paciente do A',
        userId: dataA.user.id
      })
    });
    const textPatA = await resPatA.text();
    assert(resPatA.status === 201, 'Falha ao criar Paciente para A: ' + textPatA);
    const patA = JSON.parse(textPatA);
    console.log('✅ Paciente A criado no Tenant A.');

    // 4. Usuário B lista pacientes e NÃO deve ver o Paciente do A
    const resListB = await fetch(`${API_URL}/patients`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenB}`
      }
    });
    assert(resListB.status === 200, 'Falha ao listar pacientes de B');
    const listB = await resListB.json();
    assert(listB.length === 0, 'ISOLAMENTO FALHOU: Usuário B viu o paciente do Usuário A');
    console.log('✅ Isolamento B2C bem-sucedido: Usuário B não vê dados do A.');

    // 5. Usuário B tenta deletar diretamente o Paciente do A passando o ID (Tentativa de IDOR)
    const resDeleteIdor = await fetch(`${API_URL}/patients/${patA.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenB}`
      }
    });
    // Como o deletePatient valida o tenantId, ele não encontrará o paciente e retornará 404 (Not Found).
    assert(resDeleteIdor.status === 404, `ISOLAMENTO FALHOU: Usuário B conseguiu afetar o paciente do A! Status retornado: ${resDeleteIdor.status}`);
    console.log('✅ Isolamento de IDOR (Insecure Direct Object Reference) bem-sucedido: Usuário B não consegue deletar dados do A.');

    console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
  } catch (error: any) {
    console.error('❌ FALHA NO TESTE: ', error.message);
    process.exit(1);
  }
}

runTests();
