import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Admin details with VALID hex wallet address (42 chars, hex only)
    const adminWallet = '0x0000000000000000000000000000000000000001';
    const adminPin = '123456'; // 6-digit PIN
    const referralCode = 'ADMIN-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { walletAddress: adminWallet }
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists!');
      console.log('─────────────────────────────────────');
      console.log('🔐 ADMIN LOGIN DETAILS:');
      console.log('─────────────────────────────────────');
      console.log('Wallet Address:', adminWallet);
      console.log('PIN:', adminPin);
      console.log('─────────────────────────────────────');
      return;
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        walletAddress: adminWallet,
        securityPin: adminPin,
        referralCode: referralCode,
        role: 'admin',
        balance: 0,
        isActive: true,
      }
    });

    console.log('✅ Admin created successfully!');
    console.log('─────────────────────────────────────');
    console.log('🔐 ADMIN LOGIN DETAILS:');
    console.log('─────────────────────────────────────');
    console.log('Wallet Address:', adminWallet);
    console.log('PIN:', adminPin);
    console.log('─────────────────────────────────────');
    console.log('Go to: /admin to login');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
