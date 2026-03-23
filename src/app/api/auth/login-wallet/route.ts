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

    // Get ALL active mining sessions
    const activeMiningSessions = await db.userMining.findMany({
      where: {
        userId: user.id,
        status: 'active'
      },
      orderBy: { startedAt: 'desc' }
    });

    // Get all user mining history
    const allMining = await db.userMining.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
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

    // Get pending deposits
    const pendingDeposits = await db.deposit.count({
      where: {
        userId: user.id,
        status: 'pending'
      }
    });

    const withdrawalStats = await db.withdrawal.aggregate({
      where: {
        userId: user.id,
        status: 'approved'
      },
      _sum: { amount: true },
      _count: true
    });

    // Get pending withdrawals
    const pendingWithdrawals = await db.withdrawal.count({
      where: {
        userId: user.id,
        status: 'pending'
      }
    });

    const referralStats = await db.referral.count({
      where: { referrerId: user.id }
    });

    const referralEarningsStats = await db.referral.aggregate({
      where: { referrerId: user.id },
      _sum: { commission: true }
    });

    // Get recent transactions
    const recentTransactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent deposits
    const recentDeposits = await db.deposit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get recent withdrawals
    const recentWithdrawals = await db.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Calculate totals
    const totalInvestment = allMining
      .filter(m => m.status === 'active' || m.status === 'completed')
      .reduce((sum, m) => sum + m.investment, 0);

    const totalEarned = allMining.reduce((sum, m) => sum + m.totalEarned, 0);

    // Calculate total profit per second from active sessions
    const totalProfitPerSecond = activeMiningSessions.reduce((sum, session) => {
      const pps = (session.investment * session.dailyPercent / 100) / 86400;
      return sum + pps;
    }, 0);

    // Process active mining sessions with progress
    const processedSessions = activeMiningSessions.map(mining => {
      const now = new Date();
      const remainingMs = new Date(mining.expiresAt).getTime() - now.getTime();
      const totalDuration = new Date(mining.expiresAt).getTime() - new Date(mining.startedAt).getTime();
      const elapsed = now.getTime() - new Date(mining.startedAt).getTime();
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

      return {
        id: mining.id,
        planType: mining.planType,
        planName: mining.planName,
        investment: mining.investment,
        dailyPercent: mining.dailyPercent,
        dailyProfit: mining.dailyProfit,
        profitPerSecond: (mining.investment * mining.dailyPercent / 100) / 86400,
        totalEarned: mining.totalEarned,
        status: mining.status,
        startedAt: mining.startedAt,
        expiresAt: mining.expiresAt,
        progressPercent: progressPercent,
        remainingTime: {
          days: Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60 * 24))),
          hours: Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
          minutes: Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))),
          seconds: Math.max(0, Math.floor((remainingMs % (1000 * 60)) / 1000))
        }
      };
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
        depositBalance: user.depositBalance,
        miningBalance: user.miningBalance,
        totalProfit: user.totalProfit,
        totalWithdrawn: user.totalWithdrawn,
        totalInvested: user.totalInvested,
        referralEarnings: user.referralEarnings,
        referralCode: user.referralCode,
        role: user.role,
        createdAt: user.createdAt
      },
      activeMiningSessions: processedSessions,
      stats: {
        totalDeposits: depositStats._sum.amount || 0,
        depositCount: depositStats._count,
        pendingDeposits,
        totalWithdrawals: withdrawalStats._sum.amount || 0,
        withdrawalCount: withdrawalStats._count,
        pendingWithdrawals,
        totalInvestment,
        totalEarned,
        referralCount: referralStats,
        referralEarnings: referralEarningsStats._sum.commission || 0,
        activeMiningCount: activeMiningSessions.length,
        totalProfitPerSecond
      },
      transactions: recentTransactions,
      deposits: recentDeposits,
      withdrawals: recentWithdrawals
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
