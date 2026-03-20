import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

async function createTestUser() {
  const testWallet = '0x1234567890123456789012345678901234567890';
  const loginPin = '123456';
  const withdrawPin = '654321';
  
  // Check if test user exists
  let user = await prisma.user.findUnique({
    where: { walletAddress: testWallet }
  });
  
  if (!user) {
    // Create test user with balance
    user = await prisma.user.create({
      data: {
        email: 'test@usdtmining.io',
        password: hashPin(loginPin),
        walletAddress: testWallet,
        loginPin: hashPin(loginPin),
        withdrawPin: hashPin(withdrawPin),
        referralCode: 'TEST1234',
        balance: 500, // 500 USDT test balance
        totalProfit: 50, // 50 USDT test profit
        deviceOs: 'Test'
      }
    });
    console.log('✅ Test user created!');
  } else {
    // Update balance
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: 500,
        totalProfit: 50
      }
    });
    console.log('✅ Test user balance updated!');
  }
  
  console.log('\n========================================');
  console.log('📝 TEST ACCOUNT DETAILS:');
  console.log('========================================');
  console.log('Wallet Address:', testWallet);
  console.log('Login PIN:', loginPin);
  console.log('Withdraw PIN:', withdrawPin);
  console.log('Balance: 500 USDT');
  console.log('Referral Code:', user.referralCode);
  console.log('========================================');
  console.log('\nUse these credentials to test the website!');
  
  await prisma.$disconnect();
}

createTestUser().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
