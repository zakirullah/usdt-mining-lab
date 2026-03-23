import { db } from '../src/lib/db';
import { createHash } from 'crypto';

async function createTestAccount() {
  const walletAddress = '0x33cb374635ab51fc669c1849b21b589a17475fc3';
  const pin = '123456';
  const hashedPin = createHash('sha256').update(pin).digest('hex');

  // Find or create mining plan
  let plan = await db.miningPlan.findFirst();
  if (!plan) {
    plan = await db.miningPlan.create({
      data: {
        name: 'Starter Mining Plan',
        dailyProfit: 4,
        duration: 30,
        minInvest: 10,
        maxInvest: 100000,
        isActive: true
      }
    });
    console.log('Mining plan created:', plan.id);
  }

  // Find existing user or create new
  let user = await db.user.findUnique({
    where: { walletAddress }
  });

  if (!user) {
    const referralCode = 'TEST' + Math.random().toString(36).substring(2, 8).toUpperCase();
    user = await db.user.create({
      data: {
        email: 'test@usdtmining.com',
        password: createHash('sha256').update('test123').digest('hex'),
        walletAddress,
        securityPin: hashedPin,
        referralCode,
        balance: 500,
        depositBalance: 500,
        totalProfit: 100,
        role: 'user'
      }
    });
    console.log('User created:', user.walletAddress);
  } else {
    // Update user balance
    user = await db.user.update({
      where: { id: user.id },
      data: {
        balance: 500,
        depositBalance: 500,
        totalProfit: 100
      }
    });
    console.log('User updated:', user.walletAddress);
  }

  console.log('PIN: 123456');
  console.log('Balance: $500');

  // Check existing mining sessions
  const existingMining = await db.userMining.findMany({
    where: { userId: user.id, status: 'active' }
  });

  if (existingMining.length > 0) {
    console.log('User already has', existingMining.length, 'active mining sessions');
    await db.$disconnect();
    return;
  }

  // Create active mining sessions
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Pro Plan
  const mining = await db.userMining.create({
    data: {
      userId: user.id,
      planId: plan.id,
      planType: 'pro',
      planName: 'Pro Plan',
      investment: 300,
      dailyPercent: 4.5,
      dailyProfit: 13.5,
      profitPerSecond: 13.5 / 86400,
      totalEarned: 50,
      status: 'active',
      startedAt: now,
      expiresAt,
      lastUpdateAt: now
    }
  });
  console.log('\nMining 1 - Pro Plan: $300 investment, $13.5/day');

  // Starter Plan
  const mining2 = await db.userMining.create({
    data: {
      userId: user.id,
      planId: plan.id,
      planType: 'starter',
      planName: 'Starter Plan',
      investment: 100,
      dailyPercent: 4,
      dailyProfit: 4,
      profitPerSecond: 4 / 86400,
      totalEarned: 20,
      status: 'active',
      startedAt: now,
      expiresAt,
      lastUpdateAt: now
    }
  });
  console.log('Mining 2 - Starter Plan: $100 investment, $4/day');
  console.log('\n✅ Total Daily Profit: $17.5');
  console.log('✅ Profit per second: $' + (17.5 / 86400).toFixed(6));

  await db.$disconnect();
}

createTestAccount().catch(console.error);
