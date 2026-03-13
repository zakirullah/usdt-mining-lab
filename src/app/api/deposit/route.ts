import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch user's deposit history
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

    // Get user's deposits
    const deposits = await db.deposit.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      data: deposits
    });
  } catch (error) {
    console.error('Get deposits error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new deposit
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
    const { amount, txHash, screenshotUrl } = body;

    // Validate amount
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const depositAmount = parseFloat(amount);
    if (depositAmount < 10) {
      return NextResponse.json(
        { success: false, error: 'Minimum deposit is 10 USDT' },
        { status: 400 }
      );
    }

    // Validate transaction hash (TXID must be provided)
    if (!txHash || typeof txHash !== 'string' || txHash.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction hash (TXID) is required' },
        { status: 400 }
      );
    }

    const trimmedTxHash = txHash.trim();

    // Check for duplicate transaction hash
    const existingDeposit = await db.deposit.findFirst({
      where: { txHash: trimmedTxHash }
    });

    if (existingDeposit) {
      return NextResponse.json(
        { success: false, error: 'Transaction hash already used' },
        { status: 400 }
      );
    }

    // Create deposit
    const deposit = await db.deposit.create({
      data: {
        userId: session.userId,
        amount: depositAmount,
        txHash: trimmedTxHash,
        screenshotUrl: screenshotUrl || null, // Can be base64 or URL
        status: 'pending'
      }
    });

    // Create notification
    const walletShort = session.user.walletAddress.slice(0, 8) + '...' + session.user.walletAddress.slice(-4);
    await db.notification.create({
      data: {
        type: 'deposit',
        message: `${walletShort} just deposited ${depositAmount} USDT`,
        amount: depositAmount
      }
    });

    return NextResponse.json({
      success: true,
      data: deposit,
      message: 'Deposit submitted successfully. Awaiting admin approval.'
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
