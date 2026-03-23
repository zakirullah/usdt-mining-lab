import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

async function fixTestUser() {
  // Delete old test user first
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✓ Old users deleted');
  
  // Create fresh test user
  const testWallet = '0xabcdef1234567890abcdef1234567890abcdef12';
  const loginPin = '111111';
  const withdrawPin = '222222';
  
  const user = await prisma.user.create({
    data: {
      email: 'test@usdtmining.io',
      password: hashPin(loginPin),
      walletAddress: testWallet.toLowerCase(),
      loginPin: hashPin(loginPin),
      withdrawPin: hashPin(withdrawPin),
      referralCode: 'TESTUSER',
      balance: 500,
      totalProfit: 50,
      deviceOs: 'Test'
    }
  });
  
  console.log('\n========================================');
  console.log('✅ FRESH TEST ACCOUNT CREATED!');
  console.log('========================================');
  console.log('Wallet Address:', testWallet);
  console.log('Login PIN:', loginPin);
  console.log('Withdraw PIN:', withdrawPin);
  console.log('Balance: 500 USDT');
  console.log('Referral Code:', user.referralCode);
  console.log('========================================');
  
  // Verify
  const verify = await prisma.user.findUnique({
    where: { walletAddress: testWallet.toLowerCase() }
  });
  console.log('\n✓ Verification: User exists =', !!verify);
  
  await prisma.$disconnect();
}

fixTestUser();
