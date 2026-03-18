import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
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
      where: { token }
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: session.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = session.userId;

    // Get ALL active mining sessions
    const activeMiningSessions = await db.userMining.findMany({
      where: {
        userId,
        status: 'active'
      },
      orderBy: { startedAt: 'desc' }
    });

    // Get all user mining history
    const allMining = await db.userMining.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Get total deposits (approved)
    const depositStats = await db.deposit.aggregate({
      where: { 
        userId,
        status: 'approved' 
      },
      _sum: { amount: true },
      _count: true
    });

    // Get pending deposits
    const pendingDeposits = await db.deposit.count({
      where: { 
        userId,
        status: 'pending' 
      }
    });

    // Get total withdrawals (approved)
    const withdrawalStats = await db.withdrawal.aggregate({
      where: { 
        userId,
        status: 'approved' 
      },
      _sum: { amount: true },
      _count: true
    });

    // Get pending withdrawals
    const pendingWithdrawals = await db.withdrawal.count({
      where: { 
        userId,
        status: 'pending' 
      }
    });

    // Get recent transactions
    const recentTransactions = await db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent deposits
    const recentDeposits = await db.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get recent withdrawals
    const recentWithdrawals = await db.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get referral stats
    const referralStats = await db.referral.count({
      where: { referrerId: userId }
    });

    const referralEarningsStats = await db.referral.aggregate({
      where: { referrerId: userId },
      _sum: { commission: true }
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

    return NextResponse.json({
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
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
