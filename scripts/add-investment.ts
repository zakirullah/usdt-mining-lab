import { db } from '../src/lib/db';

const WALLET_ADDRESS = '0x33cb374635ab51fc669c1849b21b589a17475fc3';
const INVESTMENT_AMOUNT = 1000; // $1000

async function main() {
  console.log('🔍 Checking user account...');
  console.log('Wallet:', WALLET_ADDRESS);
  
  // Check if user exists
  let user = await db.user.findUnique({
    where: { walletAddress: WALLET_ADDRESS }
  });
  
  if (!user) {
    console.log('👤 User not found. Creating new account...');
    
    // Generate referral code
    const referralCode = 'USR' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create user with default PIN 123456
    user = await db.user.create({
      data: {
        walletAddress: WALLET_ADDRESS,
        securityPin: '123456', // Default PIN
        referralCode: referralCode,
        role: 'user',
        balance: 0,
        depositBalance: INVESTMENT_AMOUNT,
        miningBalance: INVESTMENT_AMOUNT,
        totalInvested: INVESTMENT_AMOUNT,
        isActive: true
      }
    });
    console.log('✅ User created with ID:', user.id);
  } else {
    console.log('✅ User found:', user.id);
    console.log('   Current balance:', user.balance);
    console.log('   Current depositBalance:', user.depositBalance);
    console.log('   Current miningBalance:', user.miningBalance);
  }
  
  // Get or create mining plan
  let plan = await db.miningPlan.findFirst();
  
  if (!plan) {
    console.log('📦 Creating mining plan...');
    plan = await db.miningPlan.create({
      data: {
        name: 'Starter Mining Plan',
        dailyProfit: 4, // 4% daily
        duration: 30, // 30 days
        minInvest: 10,
        maxInvest: 100000,
        isActive: true
      }
    });
  }
  console.log('✅ Mining plan:', plan.name);
  
  // Create deposit record (approved)
  const deposit = await db.deposit.create({
    data: {
      userId: user.id,
      amount: INVESTMENT_AMOUNT,
      txHash: 'ADMIN_DEPOSIT_' + Date.now(),
      status: 'approved',
      approvedAt: new Date()
    }
  });
  console.log('💰 Deposit created:', deposit.id);
  
  // Create transaction record
  await db.transaction.create({
    data: {
      userId: user.id,
      type: 'deposit',
      amount: INVESTMENT_AMOUNT,
      status: 'completed',
      description: 'Admin deposit - $1000 investment'
    }
  });
  console.log('📝 Transaction recorded');
  
  // Calculate mining details
  const dailyPercent = 4; // 4% daily
  const dailyProfit = INVESTMENT_AMOUNT * (dailyPercent / 100); // $40 per day
  const profitPerSecond = dailyProfit / 86400; // Profit per second
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
  // Create mining session
  const mining = await db.userMining.create({
    data: {
      userId: user.id,
      planId: plan.id,
      planType: 'starter',
      planName: 'Starter Plan',
      investment: INVESTMENT_AMOUNT,
      dailyPercent: dailyPercent,
      dailyProfit: dailyProfit,
      profitPerSecond: profitPerSecond,
      totalEarned: 0,
      status: 'active',
      expiresAt: expiresAt
    }
  });
  console.log('⛏️ Mining session created:', mining.id);
  console.log('   Daily profit: $' + dailyProfit.toFixed(2));
  console.log('   Profit per second:', profitPerSecond.toFixed(6));
  console.log('   Expires at:', expiresAt.toISOString());
  
  // Update user balances
  await db.user.update({
    where: { id: user.id },
    data: {
      depositBalance: { increment: INVESTMENT_AMOUNT },
      miningBalance: { increment: INVESTMENT_AMOUNT },
      totalInvested: { increment: INVESTMENT_AMOUNT }
    }
  });
  console.log('📊 User balances updated');
  
  // Fetch updated user
  const updatedUser = await db.user.findUnique({
    where: { id: user.id }
  });
  
  console.log('\n========== FINAL ACCOUNT STATUS ==========');
  console.log('Wallet Address:', WALLET_ADDRESS);
  console.log('PIN: 123456');
  console.log('Deposit Balance: $' + updatedUser?.depositBalance);
  console.log('Mining Balance: $' + updatedUser?.miningBalance);
  console.log('Total Invested: $' + updatedUser?.totalInvested);
  console.log('Daily Profit: $' + dailyProfit.toFixed(2));
  console.log('==========================================\n');
}

main()
  .then(async () => {
    await db.$disconnect();
    console.log('✅ Investment added successfully!');
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await db.$disconnect();
    process.exit(1);
  });
