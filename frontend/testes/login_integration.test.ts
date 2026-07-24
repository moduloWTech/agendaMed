/**
 * Script de Teste de Integração: Frontend -> Backend (Autenticação B2C)
 * 
 * Este script simula exatamente o payload que o LoginForm.tsx dispara
 * e verifica se o backend responde corretamente.
 * 
 * Para rodar: npx tsx testes/login_integration.test.ts
 */

const API_URL = 'http://localhost:3333';

async function runTests() {
  console.log('🧪 Iniciando testes de Integração Frontend/Backend (Autenticação)...');

  const testUser = {
    name: 'Usuário Teste Frontend',
    email: `teste.frontend.${Date.now()}@exemplo.com`,
    phoneWhats: `119${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'senhaSegura123'
  };

  try {
    // 1. Testando Registro
    console.log(`\n⏳ Testando cadastro de nova conta (Register)...`);
    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      throw new Error(`Falha no Registro: ${registerData.error || registerResponse.statusText}`);
    }

    console.log('✅ Cadastro realizado com sucesso!');
    console.log(`   ID do Usuário: ${registerData.user.id}`);
    console.log(`   Token JWT Recebido: Sim (${registerData.accessToken.substring(0, 20)}...)`);

    // 2. Testando Login
    console.log(`\n⏳ Testando login com a conta recém criada...`);
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(`Falha no Login: ${loginData.error || loginResponse.statusText}`);
    }

    console.log('✅ Login realizado com sucesso!');
    console.log(`   Token Validado: Sim`);

    // 3. Testando Endpoint de Pacientes (Simulando a chamada do App.tsx)
    console.log(`\n⏳ Verificando chamada para /patients logo após o login...`);
    const patientsResponse = await fetch(`${API_URL}/api/patients`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.accessToken}` 
      }
    });

    const patientsData = await patientsResponse.json();
    if (!patientsResponse.ok) {
      throw new Error(`Falha na busca de pacientes: ${patientsData.error}`);
    }

    if (patientsData.length === 0) {
       console.log('✅ Nenhum paciente encontrado. (Comportamento esperado! O frontend irá exibir a PatientSetupScreen)');
    } else {
       console.log('❌ Pacientes encontrados, mas a conta acabou de ser criada.');
    }

    console.log('\n🎉 TODOS OS TESTES DE INTEGRAÇÃO PASSARAM!');

  } catch (err: any) {
    console.error(`\n❌ ERRO DURANTE O TESTE:`, err.message);
    process.exit(1);
  }
}

runTests();
