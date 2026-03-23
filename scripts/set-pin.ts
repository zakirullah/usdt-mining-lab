import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WALLET_ADDRESS = '0x33cb374635ab51fc669c1849b21b589a17475fc3';
const NEW_PIN = '123456';

async function main() {
  await prisma.user.update({
    where: { walletAddress: WALLET_ADDRESS },
    data: { securityPin: NEW_PIN }
  });
  
  console.log('✅ PIN updated to:', NEW_PIN);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error:', e);
    prisma.$disconnect();
  });
