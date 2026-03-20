import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const withdrawals = await prisma.withdrawal.findMany({
    include: { user: { select: { walletAddress: true } } },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('Total withdrawals:', withdrawals.length);
  console.log('Withdrawals:', withdrawals);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error:', e);
    prisma.$disconnect();
  });
