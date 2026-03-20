import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check admin settings
  const settings = await prisma.adminSettings.findFirst();
  console.log('Admin Settings:', settings);
  
  // Check all settings
  const allSettings = await prisma.adminSettings.findMany();
  console.log('All Admin Settings:', allSettings);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error:', e);
    prisma.$disconnect();
  });
