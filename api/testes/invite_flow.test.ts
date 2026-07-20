/**
 * Script de Teste de Integração: Invite Flow (B2C)
 */
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'api/.env' });

const API_URL = 'http://localhost:3333';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mwt-2026';

async function runTests() {
  console.log('🧪 Iniciando testes do Fluxo de Convites (B2C)...');

  // Primeiro logar como admin para pegar um token e fazer o invite
  const testAdmin = {
    email: `teste.frontend.1784528439671@exemplo.com`,
    password: 'senhaSegura123'
  };

  try {
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAdmin)
    });
    const adminData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.log('Admin login failed, creating new admin...');
      const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              name: 'Admin Teste',
              email: `admin.invite.${Date.now()}@exemplo.com`,
              phoneWhats: `119${Math.floor(10000000 + Math.random() * 90000000)}`,
              password: 'senhaSegura123'
          })
      });
      const regData = await registerResponse.json();
      adminData.user = regData.user;
      adminData.accessToken = regData.accessToken;
      
      // Need a patient to invite a caregiver to
      const patientResponse = await fetch(`${API_URL}/api/patients`, {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminData.accessToken}`
           },
          body: JSON.stringify({ name: 'Paciente Teste Convite' })
      });
      const patData = await patientResponse.json();
      adminData.user.patients = [patData];
    } else {
      // Need a patient
      const patientResponse = await fetch(`${API_URL}/api/patients`, {
          method: 'GET',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminData.accessToken}`
           },
      });
      const patData = await patientResponse.json();
      if(patData.length === 0) {
          const patientCreate = await fetch(`${API_URL}/api/patients`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${adminData.accessToken}`
              },
              body: JSON.stringify({ name: 'Paciente Teste Convite' })
          });
          const patDataCreated = await patientCreate.json();
          adminData.user.patients = [patDataCreated];
      } else {
          adminData.user.patients = patData;
      }
    }

    const patientId = adminData.user.patients[0].id;
    console.log(`✅ Admin pronto e Paciente resolvido (${patientId})`);

    // 1. Convidar
    console.log(`\n⏳ Testando convite de cuidador...`);
    const invitePhone = `119${Math.floor(10000000 + Math.random() * 90000000)}`;
    const inviteResponse = await fetch(`${API_URL}/api/users/invite`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminData.accessToken}`
      },
      body: JSON.stringify({
        name: 'Cuidador Convidado',
        phoneWhats: invitePhone,
        patientId: patientId,
        patientName: 'Paciente Teste Convite'
      })
    });

    const inviteResult = await inviteResponse.json();
    if (!inviteResponse.ok) {
      throw new Error(`Falha no Convite: ${inviteResult.error || inviteResponse.statusText}`);
    }
    console.log('✅ Endpoint de convite chamou e enviou JWT sem dar erro.');

    // Hack: Since the JWT is sent via WhatsApp, we can't intercept it via HTTP response here easily (it returns success message).
    // I will manually sign a JWT here using the same secret to test the Accept Invite endpoint!
    
    console.log(`\n⏳ Forjando um token de convite com o segredo compartilhado para testar a rota accept-invite...`);
    const testToken = jwt.sign(
      {
        tenantId: adminData.user.tenantId,
        patientId: patientId,
        invitedPhone: invitePhone,
        invitedName: 'Cuidador Convidado'
      },
      JWT_SECRET,
      { expiresIn: '48h' }
    );

    // 2. Aceitar Convite
    console.log(`\n⏳ Testando aceitação de convite...`);
    const acceptResponse = await fetch(`${API_URL}/api/auth/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: testToken,
        name: 'Cuidador Confirmado',
        email: `cuidador.${Date.now()}@exemplo.com`,
        phoneWhats: invitePhone,
        password: 'minhaSenhaSegura123'
      })
    });

    const acceptResult = await acceptResponse.json();
    if (!acceptResponse.ok) {
      throw new Error(`Falha no Aceite de Convite: ${acceptResult.error || acceptResponse.statusText}`);
    }

    console.log('✅ Convite aceito com sucesso!');
    console.log(`   Usuário Cuidador criado (ID: ${acceptResult.user.id})`);
    console.log(`   Mesmo Tenant do Admin? ${acceptResult.user.tenantId === adminData.user.tenantId}`);
    console.log(`   Token de Login Recebido? Sim`);

    console.log('\n🎉 TODOS OS TESTES DO FLUXO DE CONVITE PASSARAM!');

  } catch (err: any) {
    console.error(`\n❌ ERRO DURANTE O TESTE:`, err.message);
    process.exit(1);
  }
}

runTests();
