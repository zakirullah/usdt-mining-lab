import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin settings with your deposit wallet
  const settings = await prisma.adminSettings.create({
    data: {
      siteName: 'USDT Mining Lab',
      depositWallet: '0x33cb374635ab51fc669c1849b21b589a17475fc3',
      minDeposit: 10,
      minWithdraw: 10,
    },
  });
  console.log('✅ Admin settings created');
  console.log('   💰 Deposit Wallet:', settings.depositWallet);

  // Create mining plan
  const plan = await prisma.miningPlan.create({
    data: {
      name: 'Starter Mining Plan',
      dailyProfit: 4, // 4% daily
      duration: 30, // 30 days
      minInvest: 10,
      maxInvest: 100000,
      isActive: true,
    },
  });
  console.log('✅ Mining plan created');
  console.log('   📊 Name:', plan.name);
  console.log('   📈 Daily Profit:', plan.dailyProfit + '%');
  console.log('   ⏱️ Duration:', plan.duration, 'days');

  // Create admin user with your wallet
  const adminWallet = '0x33cb374635ab51fc669c1849b21b589a17475fc3';
  
  const admin = await prisma.user.create({
    data: {
      walletAddress: adminWallet,
      securityPin: '123456',
      referralCode: 'ADMIN01',
      role: 'admin',
      balance: 0,
      depositBalance: 0,
      miningBalance: 0,
      totalProfit: 0,
      totalWithdrawn: 0,
      totalInvested: 0,
      referralEarnings: 0,
      isActive: true,
    },
  });

  console.log('✅ Admin user created');
  console.log('   👤 Wallet:', admin.walletAddress);
  console.log('   🔐 PIN: 123456');
  console.log('   🎖️ Role:', admin.role);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login Details:');
  console.log('   Wallet: 0x33cb374635ab51fc669c1849b21b589a17475fc3');
  console.log('   PIN: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
