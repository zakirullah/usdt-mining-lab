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
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const userId = session.userId;

    // Get active mining data
    const activeMining = await db.userMining.findFirst({
      where: {
        userId,
        status: 'active'
      }
    });

    // Get all user mining history
    const allMining = await db.userMining.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
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

    // Calculate total investment
    const totalInvestment = allMining.reduce((sum, m) => sum + m.investment, 0);
    const totalEarned = allMining.reduce((sum, m) => sum + m.totalEarned, 0);

    return NextResponse.json({
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
        totalEarned: activeMining.totalEarned,
        status: activeMining.status,
        startedAt: activeMining.startedAt,
        expiresAt: activeMining.expiresAt,
        lastUpdateAt: activeMining.lastUpdateAt
      } : null,
      stats: {
        totalDeposits: depositStats._sum.amount || 0,
        depositCount: depositStats._count,
        pendingDeposits,
        totalWithdrawals: withdrawalStats._sum.amount || 0,
        withdrawalCount: withdrawalStats._count,
        pendingWithdrawals,
        totalInvestment,
        totalEarned,
        referralCount: referralStats
      },
      transactions: recentTransactions,
      recentDeposits,
      recentWithdrawals
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
