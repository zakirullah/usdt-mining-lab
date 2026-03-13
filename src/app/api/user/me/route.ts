import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    const userId = session.userId;

    // Get active mining data
    const activeMining = await db.userMining.findFirst({
      where: {
        userId,
        status: 'active'
      },
      include: {
        plan: true
      }
    });

    // Get all user mining sessions (history)
    const miningSessions = await db.userMining.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: true
      }
    });

    // Get deposits
    const deposits = await db.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Get withdrawals
    const withdrawals = await db.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
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

    // Get pending deposits count
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

    // Get pending withdrawals count
    const pendingWithdrawals = await db.withdrawal.count({
      where: { 
        userId,
        status: 'pending' 
      }
    });

    // Get recent transactions
    const transactions = await db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Get referral stats
    const referralStats = await db.referral.count({
      where: { referrerId: userId }
    });

    // Get total referral earnings
    const referralEarningsStats = await db.referral.aggregate({
      where: { referrerId: userId },
      _sum: { commission: true }
    });

    // Calculate total investment and total earned from mining
    const totalInvestment = miningSessions.reduce((sum, m) => sum + m.investment, 0);
    const totalEarned = miningSessions.reduce((sum, m) => sum + m.totalEarned, 0);

    // Calculate profit per second for active mining
    let profitPerSecond = 0;
    if (activeMining && activeMining.plan) {
      profitPerSecond = (activeMining.investment * activeMining.plan.dailyProfit / 100) / 86400;
    }

    // Calculate remaining and elapsed time for active mining
    let miningTimer = null;
    if (activeMining) {
      const now = Date.now();
      const started = new Date(activeMining.startedAt).getTime();
      const expires = new Date(activeMining.expiresAt).getTime();
      const elapsed = Math.floor((now - started) / 1000);
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      
      const totalDuration = 30 * 24 * 60 * 60; // 30 days in seconds
      const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);
      
      miningTimer = {
        elapsed,
        remaining,
        progressPercent
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: session.user.id,
          email: session.user.email,
          walletAddress: session.user.walletAddress,
          balance: session.user.balance,
          totalProfit: session.user.totalProfit,
          referralEarnings: session.user.referralEarnings,
          referralCode: session.user.referralCode,
          role: session.user.role,
          createdAt: session.user.createdAt
        },
        mining: activeMining ? {
          id: activeMining.id,
          investment: activeMining.investment,
          dailyProfit: activeMining.dailyProfit,
          profitPerSecond: profitPerSecond,
          totalEarned: activeMining.totalEarned,
          status: activeMining.status,
          startedAt: activeMining.startedAt,
          expiresAt: activeMining.expiresAt,
          lastUpdateAt: activeMining.lastUpdateAt,
          plan: activeMining.plan,
          timer: miningTimer
        } : null,
        miningSessions: miningSessions,
        deposits: deposits,
        withdrawals: withdrawals,
        transactions: transactions,
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
          totalReferralEarnings: referralEarningsStats._sum.commission || 0
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
