import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const walletAddress = '0x33cb374635ab51fc669c1849b21b589a17475fc3';
  
  const user = await prisma.user.findUnique({
    where: { walletAddress }
  });
  
  if (user) {
    console.log('User found:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Wallet:', user.walletAddress);
    console.log('Role:', user.role);
    console.log('Referral Code:', user.referralCode);
    console.log('Balance:', user.balance);
    console.log('Created:', user.createdAt);
    
    // Reset PIN to 123456
    const crypto = require('crypto');
    const newPin = '123456';
    const hashedPin = crypto.createHash('sha256').update(newPin).digest('hex');
    
    await prisma.user.update({
      where: { walletAddress },
      data: { 
        securityPin: hashedPin,
        password: hashedPin 
      }
    });
    
    console.log('\n✅ PIN reset to: 123456');
  } else {
    console.log('❌ User not found with wallet:', walletAddress);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
