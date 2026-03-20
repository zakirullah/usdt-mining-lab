import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { notifyNewDeposit } from '@/lib/telegram';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's deposits
    const deposits = await db.deposit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      data: deposits.map(d => ({
        id: d.id,
        amount: d.amount,
        txHash: d.txHash,
        screenshotUrl: d.screenshotUrl,
        status: d.status,
        createdAt: d.createdAt
      }))
    });
  } catch (error) {
    console.error('Get deposits error:', error);
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
    const { amount, txHash, screenshotUrl } = body;

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
        { error: 'Minimum deposit is 10 USDT' },
        { status: 400 }
      );
    }

    // No strict validation on txHash - admin will verify manually

    // Check for duplicate transaction hash
    const existingDeposit = await db.deposit.findFirst({
      where: { txHash }
    });

    if (existingDeposit) {
      return NextResponse.json(
        { error: 'This transaction hash has already been used' },
        { status: 400 }
      );
    }

    // Create deposit with screenshot
    const deposit = await db.deposit.create({
      data: {
        userId: user.id,
        amount: depositAmount,
        txHash,
        screenshotUrl: screenshotUrl || null,
        status: 'pending'
      }
    });

    // Create notification
    await db.notification.create({
      data: {
        type: 'deposit',
        message: `${user.walletAddress.slice(0, 8)}... just deposited ${depositAmount} USDT`,
        amount: depositAmount
      }
    });

    // Send Telegram notification
    await notifyNewDeposit(user.walletAddress, depositAmount, txHash, 'Pending');

    return NextResponse.json({
      success: true,
      message: 'Deposit submitted successfully! Awaiting admin approval.',
      data: {
        id: deposit.id,
        amount: deposit.amount,
        status: deposit.status,
        createdAt: deposit.createdAt
      }
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
