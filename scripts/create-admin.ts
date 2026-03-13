import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'zakirullah1579@gmail.com';
  
  // Generate unique values
  const timestamp = Date.now();
  const randomHex = Math.random().toString(16).substring(2, 10);
  const walletAddress = `0x${randomHex.padEnd(40, '0').slice(0, 40)}`;
  const referralCode = `ADM${timestamp.toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });
    console.log('✅ User updated to admin:', updated.email, updated.walletAddress);
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        password: 'temp_' + timestamp,
        walletAddress,
        securityPin: '123456',
        referralCode,
        role: 'admin'
      }
    });
    console.log('✅ Admin user created:');
    console.log('   Email:', user.email);
    console.log('   Wallet:', user.walletAddress);
    console.log('   PIN: 123456');
    console.log('   Referral Code:', user.referralCode);
  }
  
  // Create mining plan
  const plan = await prisma.miningPlan.upsert({
    where: { id: 'default-plan' },
    create: {
      id: 'default-plan',
      name: 'Starter Mining Plan',
      dailyProfit: 4,
      duration: 30,
      minInvest: 10,
      maxInvest: 100000
    },
    update: {}
  });
  console.log('✅ Mining plan ready:', plan.name);
  
  // Create admin settings
  const settings = await prisma.adminSettings.upsert({
    where: { id: 'default-settings' },
    create: {
      id: 'default-settings',
      siteName: 'USDT Mining Lab',
      depositWallet: '0x0000000000000000000000000000000000000000',
      minDeposit: 10,
      minWithdraw: 10
    },
    update: {}
  });
  console.log('✅ Admin settings ready');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
