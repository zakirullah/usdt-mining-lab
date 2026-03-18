import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        walletAddress: true,
        securityPin: true,
        role: true,
        isActive: true
      }
    });

    console.log('Total users:', users.length);
    console.log('─────────────────────────────────────');
    
    users.forEach((user, i) => {
      console.log(`User ${i + 1}:`);
      console.log('  Wallet:', user.walletAddress);
      console.log('  PIN:', user.securityPin);
      console.log('  Role:', user.role);
      console.log('  Active:', user.isActive);
      console.log('─────────────────────────────────────');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
