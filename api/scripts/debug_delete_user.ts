import dotenv from 'dotenv';
import path from 'path';
import { prisma } from '../src/DB/prisma.config';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  const targetId = 'e4095c63-2024-43e0-948e-951cde51e4c5';
  console.log(`🔍 Investigando usuário alvo: ${targetId}`);

  const targetUser = await prisma.user.findUnique({
    where: { id: targetId },
    include: { tenant: true }
  });

  if (!targetUser) {
    console.log('❌ Usuário alvo NÃO encontrado no banco de dados!');
  } else {
    console.log('👤 Dados do Usuário Alvo:');
    console.log({
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      phoneWhats: targetUser.phoneWhats,
      role: targetUser.role,
      tenantId: targetUser.tenantId,
      isOwner: targetUser.tenant?.ownerId === targetUser.id
    });
  }

  console.log('\n👥 Listando todos os usuários no banco de dados:');
  const allUsers = await prisma.user.findMany({
    include: { tenant: true }
  });

  for (const u of allUsers) {
    console.log(`- [${u.role}] ID: ${u.id} | Nome: ${u.name} | Email: ${u.email} | Tenant: ${u.tenantId} | Owner: ${u.tenant?.ownerId === u.id}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
