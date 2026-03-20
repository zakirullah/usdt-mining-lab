import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const { amount, txHash } = body;

    // Validate input
    if (!amount || !txHash) {
      return NextResponse.json(
        { error: 'Amount and transaction hash are required' },
        { status: 400 }
      );
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < 10) {
      return NextResponse.json(
        { error: 'Minimum deposit is $10 USDT' },
        { status: 400 }
      );
    }

    // Validate transaction hash format
    if (!txHash.startsWith('0x') || txHash.length !== 66) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format' },
        { status: 400 }
      );
    }

    // Check for duplicate transaction hash
    const existingDeposit = await db.deposit.findFirst({
      where: { txHash }
    });

    if (existingDeposit) {
      return NextResponse.json(
        { error: 'Transaction hash already used' },
        { status: 400 }
      );
    }

    // Create deposit
    await db.deposit.create({
      data: {
        userId: session.userId,
        amount: depositAmount,
        txHash,
        status: 'pending'
      }
    });

    // Create notification
    await db.notification.create({
      data: {
        type: 'deposit',
        message: `${session.user.email.split('@')[0]} just deposited ${depositAmount} USDT`,
        amount: depositAmount
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit submitted successfully. Awaiting admin approval.'
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
