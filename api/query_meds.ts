import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const meds = await prisma.medication.findMany();
  console.log(JSON.stringify(meds, null, 2));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
