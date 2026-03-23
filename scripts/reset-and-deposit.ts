import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WALLET_ADDRESS = '0x33cb374635ab51fc669c1849b21b589a17475fc3';
const DEPOSIT_AMOUNT = 1000; // $1000

async function main() {
  console.log('🔍 Finding user account...');
  
  const user = await prisma.user.findUnique({
    where: { walletAddress: WALLET_ADDRESS },
    include: {
      deposits: true,
      miningPlans: true,
      transactions: true
    }
  });
  
  if (!user) {
    console.log('❌ User not found!');
    return;
  }
  
  console.log('✅ User found:', user.id);
  console.log('   Current depositBalance:', user.depositBalance);
  console.log('   Current miningBalance:', user.miningBalance);
  console.log('   Current totalInvested:', user.totalInvested);
  
  // Step 1: Delete all mining sessions
  console.log('\n🗑️ Removing mining sessions...');
  const deletedMining = await prisma.userMining.deleteMany({
    where: { userId: user.id }
  });
  console.log('   Deleted', deletedMining.count, 'mining sessions');
  
  // Step 2: Delete all deposits
  console.log('\n🗑️ Removing deposits...');
  const deletedDeposits = await prisma.deposit.deleteMany({
    where: { userId: user.id }
  });
  console.log('   Deleted', deletedDeposits.count, 'deposits');
  
  // Step 3: Delete all transactions
  console.log('\n🗑️ Removing transactions...');
  const deletedTx = await prisma.transaction.deleteMany({
    where: { userId: user.id }
  });
  console.log('   Deleted', deletedTx.count, 'transactions');
  
  // Step 4: Reset user balances
  console.log('\n🔄 Resetting user balances...');
  await prisma.user.update({
    where: { id: user.id },
    data: {
      balance: 0,
      depositBalance: 0,
      miningBalance: 0,
      totalInvested: 0,
      totalProfit: 0,
      totalWithdrawn: 0,
      referralEarnings: 0
    }
  });
  console.log('   Balances reset to 0');
  
  // Step 5: Create fresh deposit (approved)
  console.log('\n💰 Creating fresh deposit of $' + DEPOSIT_AMOUNT + '...');
  const deposit = await prisma.deposit.create({
    data: {
      userId: user.id,
      amount: DEPOSIT_AMOUNT,
      txHash: 'DEPOSIT_' + Date.now(),
      status: 'approved',
      approvedAt: new Date()
    }
  });
  console.log('   Deposit created:', deposit.id);
  
  // Step 6: Create transaction record
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'deposit',
      amount: DEPOSIT_AMOUNT,
      status: 'completed',
      description: 'Deposit - $' + DEPOSIT_AMOUNT
    }
  });
  console.log('   Transaction recorded');
  
  // Step 7: Update user deposit balance only
  await prisma.user.update({
    where: { id: user.id },
    data: {
      depositBalance: DEPOSIT_AMOUNT
    }
  });
  console.log('   Deposit balance updated');
  
  // Fetch final user state
  const finalUser = await prisma.user.findUnique({
    where: { id: user.id }
  });
  
  console.log('\n========== FINAL ACCOUNT STATUS ==========');
  console.log('Wallet Address:', WALLET_ADDRESS);
  console.log('PIN:', user.securityPin);
  console.log('Balance: $' + finalUser?.balance);
  console.log('Deposit Balance: $' + finalUser?.depositBalance);
  console.log('Mining Balance: $' + finalUser?.miningBalance);
  console.log('Total Invested: $' + finalUser?.totalInvested);
  console.log('Status: Deposit only (No active mining)');
  console.log('==========================================\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Done!');
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
