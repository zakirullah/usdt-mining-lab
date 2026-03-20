import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

async function verify() {
  const testWallet = '0xabcdef1234567890abcdef1234567890abcdef12';
  
  const user = await prisma.user.findUnique({
    where: { walletAddress: testWallet.toLowerCase() }
  });
  
  if (!user) {
    console.log('❌ User not found!');
    return;
  }
  
  console.log('User found!');
  console.log('Wallet in DB:', user.walletAddress);
  console.log('Login PIN hash in DB:', user.loginPin);
  console.log('Expected hash for "111111":', hashPin('111111'));
  console.log('Match:', user.loginPin === hashPin('111111'));
  
  await prisma.$disconnect();
}

verify();
