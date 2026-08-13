import dotenv from 'dotenv';
import path from 'path';
import { prisma } from '../src/DB/prisma.config';
import { UserUseCase } from '../src/usecases/user.usecase';
import { UserRepository } from '../src/repositories/user.repository';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  const adminId = 'daa7ab32-7f54-42d3-a937-b81aeeaee637'; // Dra. Maria Fernanda
  const targetId = 'e4095c63-2024-43e0-948e-951cde51e4c5'; // Módulo web
  const tenantId = '570f14bd-8f02-4eec-a314-0fde4cf6b740';

  console.log(`🧪 Testando deleteUser como Admin (${adminId}) para remover Target (${targetId})...`);

  const repo = new UserRepository();
  const useCase = new UserUseCase(repo);

  try {
    await useCase.deleteUser(adminId, targetId, tenantId);
    console.log('✅ deleteUser executado COM SUCESSO sem nenhum erro!');
  } catch (err: any) {
    console.error('❌ EXCEÇÃO CAPTURADA NO TESTE:', err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
