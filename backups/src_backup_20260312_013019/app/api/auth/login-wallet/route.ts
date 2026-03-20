import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHash, randomBytes } from 'crypto';

// Hash PIN
function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

// Generate session token
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, pin } = body;

    // Validate wallet address
    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Validate PIN
    if (!pin || pin.length !== 6) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Normalize wallet address
    const normalizedWallet = walletAddress.toLowerCase();

    // Find user by wallet address
    const user = await db.user.findUnique({
      where: { walletAddress: normalizedWallet }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Wallet address not registered' },
        { status: 400 }
      );
    }

    // Verify PIN
    if (user.securityPin !== hashPin(pin)) {
      return NextResponse.json(
        { error: 'Incorrect PIN' },
        { status: 400 }
      );
    }

    // Get active mining data
    const activeMining = await db.userMining.findFirst({
      where: {
        userId: user.id,
        status: 'active'
      }
    });

    // Get user stats
    const depositStats = await db.deposit.aggregate({
      where: { 
        userId: user.id,
        status: 'approved' 
      },
      _sum: { amount: true },
      _count: true
    });

    const withdrawalStats = await db.withdrawal.aggregate({
      where: { 
        userId: user.id,
        status: 'approved' 
      },
      _sum: { amount: true },
      _count: true
    });

    const referralStats = await db.referral.count({
      where: { referrerId: user.id }
    });

    // Get recent transactions
    const recentTransactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        balance: user.balance,
        totalProfit: user.totalProfit,
        referralEarnings: user.referralEarnings,
        referralCode: user.referralCode,
        role: user.role
      },
      mining: activeMining ? {
        id: activeMining.id,
        investment: activeMining.investment,
        dailyProfit: activeMining.dailyProfit,
        totalEarned: activeMining.totalEarned,
        status: activeMining.status,
        startedAt: activeMining.startedAt,
        expiresAt: activeMining.expiresAt,
        lastUpdateAt: activeMining.lastUpdateAt
      } : null,
      stats: {
        totalDeposits: depositStats._sum.amount || 0,
        depositCount: depositStats._count,
        totalWithdrawals: withdrawalStats._sum.amount || 0,
        withdrawalCount: withdrawalStats._count,
        referralCount: referralStats
      },
      transactions: recentTransactions
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt
    });

    return response;
  } catch (error) {
    console.error('Wallet login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
