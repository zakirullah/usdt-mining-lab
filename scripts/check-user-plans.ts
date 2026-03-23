import { db } from '../src/lib/db';

async function checkUser() {
  const wallet = '0x33cb374635ab51fc669c1849b21b589a17475fc3';
  
  // Find user
  const user = await db.user.findUnique({
    where: { walletAddress: wallet },
    include: {
      miningPlans: {
        where: { status: 'active' }
      },
      deposits: {
        where: { status: 'approved' },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('\n=== USER INFO ===');
  console.log('Wallet:', user.walletAddress);
  console.log('Balance:', user.balance);
  console.log('Deposit Balance:', user.depositBalance);
  console.log('Mining Balance:', user.miningBalance);
  console.log('Total Profit:', user.totalProfit);
  console.log('Total Invested:', user.totalInvested);
  
  console.log('\n=== ACTIVE MINING SESSIONS ===');
  if (user.miningPlans.length === 0) {
    console.log('No active mining sessions');
  } else {
    user.miningPlans.forEach((s, i) => {
      console.log(`\nSession ${i + 1}:`);
      console.log('  Plan:', s.planName);
      console.log('  Investment:', s.investment);
      console.log('  Daily %:', s.dailyPercent);
      console.log('  Daily Profit:', s.dailyProfit);
      console.log('  Total Earned:', s.totalEarned);
      console.log('  Started:', s.startedAt);
      console.log('  Expires:', s.expiresAt);
      console.log('  Status:', s.status);
    });
  }
  
  console.log('\n=== RECENT APPROVED DEPOSITS ===');
  if (user.deposits.length === 0) {
    console.log('No approved deposits');
  } else {
    user.deposits.forEach((d, i) => {
      console.log(`${i + 1}. $${d.amount} - ${d.createdAt}`);
    });
  }
}

checkUser().catch(console.error).finally(() => process.exit(0));
