import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHash } from 'crypto';
import { getAuthUser } from '@/lib/auth';

// Withdrawal fee percentage (5%)
const WITHDRAWAL_FEE_PERCENT = 5;

// Hash PIN
function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's withdrawals
    const withdrawals = await db.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      data: withdrawals.map(w => ({
        id: w.id,
        amount: w.amount,
        walletAddress: w.walletAddress,
        status: w.status,
        createdAt: w.createdAt
      }))
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, walletAddress, pin } = body;

    // Validate input
    if (!amount || !walletAddress || !pin) {
      return NextResponse.json(
        { error: 'Amount, wallet address, and PIN are required' },
        { status: 400 }
      );
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 10) {
      return NextResponse.json(
        { error: 'Minimum withdrawal is 10 USDT' },
        { status: 400 }
      );
    }

    // Calculate 5% fee based on withdrawal amount
    const fee = withdrawAmount * (WITHDRAWAL_FEE_PERCENT / 100);
    const netAmount = withdrawAmount - fee;

    // Check balance (need full amount including fee)
    if (withdrawAmount > user.balance) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Validate wallet address (BEP20)
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid BEP20 wallet address format' },
        { status: 400 }
      );
    }

    // Validate PIN (6 digits)
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Verify PIN - check both hashed and plain for compatibility
    const hashedPin = hashPin(pin);
    if (user.securityPin !== hashedPin && user.securityPin !== pin) {
      return NextResponse.json(
        { error: 'Invalid security PIN' },
        { status: 400 }
      );
    }

    // Create withdrawal request with fee info
    const withdrawal = await db.withdrawal.create({
      data: {
        userId: user.id,
        amount: netAmount, // Net amount after fee
        walletAddress,
        status: 'pending'
      }
    });

    // Deduct full amount from balance (including fee)
    await db.user.update({
      where: { id: user.id },
      data: {
        balance: { decrement: withdrawAmount }
      }
    });

    // Create transaction with fee details
    await db.transaction.create({
      data: {
        userId: user.id,
        type: 'withdrawal_request',
        amount: netAmount,
        status: 'pending',
        description: `Withdrawal to ${walletAddress.slice(0, 8)}... | Fee: ${fee.toFixed(2)} USDT (5%) | Net: ${netAmount.toFixed(2)} USDT`
      }
    });

    // Create notification
    await db.notification.create({
      data: {
        type: 'withdraw',
        message: `${user.walletAddress.slice(0, 8)}... just withdrew ${netAmount.toFixed(2)} USDT`,
        amount: netAmount
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted! Awaiting admin approval.',
      data: {
        id: withdrawal.id,
        requestedAmount: withdrawAmount,
        fee: fee,
        feePercent: WITHDRAWAL_FEE_PERCENT,
        netAmount: netAmount,
        walletAddress: walletAddress,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt
      }
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
