import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Hash password
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@shibamining.com' }
  });

  if (!adminExists) {
    const admin = await prisma.user.create({
      data: {
        email: 'admin@shibamining.com',
        password: hashPassword('admin123456'),
        walletAddress: '0x' + randomBytes(20).toString('hex'),
        securityPin: hashPassword('1234'),
        referralCode: 'ADMIN001',
        role: 'admin',
        deviceOs: 'Server'
      }
    });
    console.log('✅ Admin user created:', admin.email);
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // Create mining plan
  const planExists = await prisma.miningPlan.findFirst();

  if (!planExists) {
    const plan = await prisma.miningPlan.create({
      data: {
        name: 'Starter Mining Plan',
        dailyProfit: 4,
        duration: 30,
        minInvest: 10,
        maxInvest: 100000,
        isActive: true
      }
    });
    console.log('✅ Mining plan created:', plan.name);
  } else {
    console.log('ℹ️ Mining plan already exists');
  }

  // Create admin settings
  const settingsExists = await prisma.adminSettings.findFirst();

  if (!settingsExists) {
    const settings = await prisma.adminSettings.create({
      data: {
        siteName: 'Shiba Mining Lab',
        depositWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f5aE31',
        minDeposit: 10,
        minWithdraw: 10,
        maintenanceMode: false
      }
    });
    console.log('✅ Admin settings created');
  } else {
    console.log('ℹ️ Admin settings already exist');
  }

  console.log('🌱 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
