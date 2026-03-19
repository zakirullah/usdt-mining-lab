import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHash } from 'crypto';

// Admin endpoint to reset user PIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, adminKey } = body;

    // Simple admin key check (in production, use proper auth)
    if (adminKey !== 'usdt-mining-admin-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const normalizedWallet = walletAddress.toLowerCase();

    // Check if user exists
    const user = await db.user.findUnique({
      where: { walletAddress: normalizedWallet }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Reset PIN to 123456
    const newPin = '123456';
    const hashedPin = createHash('sha256').update(newPin).digest('hex');

    await db.user.update({
      where: { walletAddress: normalizedWallet },
      data: { 
        securityPin: hashedPin,
        password: hashedPin 
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'PIN reset successfully',
      newPin: newPin,
      walletAddress: normalizedWallet
    });
  } catch (error) {
    console.error('Reset PIN error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
