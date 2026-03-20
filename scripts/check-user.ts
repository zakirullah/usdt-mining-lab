import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const testWallet = '0x1234567890123456789012345678901234567890';
  
  const user = await prisma.user.findUnique({
    where: { walletAddress: testWallet }
  });
  
  if (user) {
    console.log('User found:', {
      id: user.id,
      walletAddress: user.walletAddress,
      email: user.email,
      balance: user.balance,
      loginPin: user.loginPin,
      withdrawPin: user.withdrawPin
    });
  } else {
    console.log('User NOT found!');
  }
  
  // List all users
  const allUsers = await prisma.user.findMany({
    select: { walletAddress: true, email: true }
  });
  console.log('\nAll users:', allUsers);
  
  await prisma.$disconnect();
}

checkUser();
