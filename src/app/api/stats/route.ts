import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log('Stats API: Starting to fetch data...');
    console.log('Stats API: Environment =', process.env.NODE_ENV);
    
    // Test database connection with a simple query
    const testResult = await db.$queryRaw`SELECT 1 as test`;
    console.log('Stats API: Database connection test =', testResult);
    
    // Get total users
    const totalUsers = await db.user.count({
      where: { role: 'user' }
    });
    console.log('Stats API: totalUsers =', totalUsers);

    // Get total deposits amount
    const deposits = await db.deposit.aggregate({
      where: { status: 'approved' },
      _sum: { amount: true }
    });
    const totalDeposits = deposits._sum.amount || 0;

    // Get total withdrawals amount
    const withdrawals = await db.withdrawal.aggregate({
      where: { status: 'approved' },
      _sum: { amount: true }
    });
    const totalWithdrawals = withdrawals._sum.amount || 0;

    // Get active miners
    const activeMiners = await db.userMining.count({
      where: { status: 'active' }
    });

    // Get total profit distributed (sum of all mining totalEarned)
    const profitAggregate = await db.userMining.aggregate({
      _sum: { totalEarned: true }
    });
    const totalProfitDistributed = profitAggregate._sum.totalEarned || 0;

    // Get online users (sessions in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await db.session.count({
      where: {
        createdAt: { gte: fiveMinutesAgo }
      }
    });

    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await db.user.count({
      where: {
        createdAt: { gte: today }
      }
    });

    // Today deposits
    const todayDeposits = await db.deposit.aggregate({
      where: {
        status: 'approved',
        createdAt: { gte: today }
      },
      _sum: { amount: true }
    });

    // Today withdrawals
    const todayWithdrawals = await db.withdrawal.aggregate({
      where: {
        status: 'approved',
        createdAt: { gte: today }
      },
      _sum: { amount: true }
    });

    // Today profit
    const todayProfitResult = await db.transaction.aggregate({
      where: {
        type: 'mining_profit',
        createdAt: { gte: today }
      },
      _sum: { amount: true }
    });

    const elapsedMs = Date.now() - startTime;
    console.log('Stats API: Successfully fetched all data in', elapsedMs, 'ms');
    
    return NextResponse.json({
      totalUsers,
      totalDeposits,
      totalWithdrawals,
      activeMiners,
      totalProfitDistributed,
      onlineUsers: Math.max(onlineUsers, 1),
      newUsersToday,
      todayDeposits: todayDeposits._sum.amount || 0,
      todayWithdrawals: todayWithdrawals._sum.amount || 0,
      todayProfit: todayProfitResult._sum.amount || 0,
      isRealData: true,
      responseTimeMs: elapsedMs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error('Stats error:', error);
    
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    };
    
    return NextResponse.json({
      totalUsers: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      activeMiners: 0,
      totalProfitDistributed: 0,
      onlineUsers: 1,
      newUsersToday: 0,
      todayDeposits: 0,
      todayWithdrawals: 0,
      todayProfit: 0,
      isRealData: false,
      error: errorDetails,
      responseTimeMs: elapsedMs,
      timestamp: new Date().toISOString()
    });
  }
}
