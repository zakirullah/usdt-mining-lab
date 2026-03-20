import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHash } from 'crypto';

// Hash PIN
function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
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
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, walletAddress, pin } = body;

    // Validate input
    if (!amount || !walletAddress || !pin) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 10) {
      return NextResponse.json(
        { error: 'Minimum withdrawal is $10 USDT' },
        { status: 400 }
      );
    }

    // Check balance
    if (withdrawAmount > session.user.balance) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Validate wallet address
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Verify PIN
    if (session.user.securityPin !== hashPin(pin)) {
      return NextResponse.json(
        { error: 'Invalid security PIN' },
        { status: 400 }
      );
    }

    // Create withdrawal
    await db.withdrawal.create({
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
    await db.notification.create({
      data: {
        type: 'withdraw',
        message: `${session.user.email.split('@')[0]} just withdrew ${withdrawAmount} USDT`,
        amount: withdrawAmount
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted. Awaiting admin approval.'
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
