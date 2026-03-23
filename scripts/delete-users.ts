import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllUsers() {
  console.log('Deleting all users and related data...');
  
  // Delete in order due to foreign key constraints
  await prisma.session.deleteMany({});
  console.log('✓ Sessions deleted');
  
  await prisma.notification.deleteMany({});
  console.log('✓ Notifications deleted');
  
  await prisma.transaction.deleteMany({});
  console.log('✓ Transactions deleted');
  
  await prisma.referral.deleteMany({});
  console.log('✓ Referrals deleted');
  
  await prisma.userMining.deleteMany({});
  console.log('✓ User Mining deleted');
  
  await prisma.withdrawal.deleteMany({});
  console.log('✓ Withdrawals deleted');
  
  await prisma.deposit.deleteMany({});
  console.log('✓ Deposits deleted');
  
  await prisma.user.deleteMany({});
  console.log('✓ Users deleted');
  
  console.log('\n✅ All users and related data deleted successfully!');
  
  await prisma.$disconnect();
}

deleteAllUsers().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
