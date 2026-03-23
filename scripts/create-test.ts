import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

async function create() {
  // Delete all existing data
  await prisma.session.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.userMining.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Old data cleared');
  
  // Create test user
  const wallet = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const loginPin = '123456';
  const withdrawPin = '654321';
  
  const user = await prisma.user.create({
    data: {
      email: 'test@usdtmining.io',
      password: hashPin(loginPin),
      walletAddress: wallet.toLowerCase(),
      loginPin: hashPin(loginPin),
      withdrawPin: hashPin(withdrawPin),
      referralCode: randomBytes(4).toString('hex').toUpperCase(),
      balance: 1000,
      totalProfit: 100
    }
  });
  
  console.log('\n========================================');
  console.log('✅ TEST ACCOUNT READY!');
  console.log('========================================');
  console.log('Wallet Address:', wallet);
  console.log('Login PIN:', loginPin);
  console.log('Withdraw PIN:', withdrawPin);
  console.log('Balance: 1000 USDT');
  console.log('Referral Code:', user.referralCode);
  console.log('========================================');
  
  await prisma.$disconnect();
}

create();
