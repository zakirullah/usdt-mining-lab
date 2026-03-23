import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  const users = await prisma.user.findMany();
  console.log('Users in DB:', users.length);
  
  for (const u of users) {
    console.log('- Wallet:', u.walletAddress);
  }
  
  await prisma.$disconnect();
}

check();
