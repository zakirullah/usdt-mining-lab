import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WALLET_ADDRESS = '0x33cb374635ab51fc669c1849b21b589a17475fc3';
const BALANCE = 1000;

async function main() {
  const user = await prisma.user.update({
    where: { walletAddress: WALLET_ADDRESS },
    data: { 
      balance: BALANCE,
      depositBalance: BALANCE
    }
  });
  
  console.log('✅ Balance updated!');
  console.log('   Main Balance: $' + user.balance);
  console.log('   Deposit Balance: $' + user.depositBalance);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error:', e);
    prisma.$disconnect();
  });
