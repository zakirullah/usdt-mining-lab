import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHash } from 'crypto';

// Hash PIN
function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

// Validate BEP20 wallet address (0x + 40 hex characters)
function isValidBEP20Address(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// GET - Fetch user's withdrawal history
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find session
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    // Get user's withdrawals
    const withdrawals = await db.withdrawal.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      data: withdrawals
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new withdrawal request
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find session
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, walletAddress, pin } = body;

    // Validate input - all fields required
    if (!amount || !walletAddress || !pin) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate amount
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (withdrawAmount < 10) {
      return NextResponse.json(
        { success: false, error: 'Minimum withdrawal is 10 USDT' },
        { status: 400 }
      );
    }

    // Check balance
    if (withdrawAmount > session.user.balance) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Validate wallet address (BEP20 format: 0x + 40 chars)
    if (!isValidBEP20Address(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid BEP20 wallet address format' },
        { status: 400 }
      );
    }

    // Validate PIN (must be 6 digits)
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Verify Withdraw PIN (Security PIN)
    if (session.user.withdrawPin !== hashPin(pin)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Security PIN' },
        { status: 400 }
      );
    }

    // Create withdrawal
    const withdrawal = await db.withdrawal.create({
      data: {
        userId: session.userId,
        amount: withdrawAmount,
        walletAddress,
        status: 'pending'
      }
    });

    // Deduct from balance temporarily (will be reversed if rejected)
    await db.user.update({
      where: { id: session.userId },
      data: {
        balance: { decrement: withdrawAmount }
      }
    });

    // Create notification
    const walletShort = session.user.walletAddress.slice(0, 8) + '...' + session.user.walletAddress.slice(-4);
    await db.notification.create({
      data: {
        type: 'withdraw',
        message: `${walletShort} just withdrew ${withdrawAmount} USDT`,
        amount: withdrawAmount
      }
    });

    return NextResponse.json({
      success: true,
      data: withdrawal,
      message: 'Withdrawal request submitted. Awaiting admin approval.'
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
