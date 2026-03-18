import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('Stats API: Starting to fetch data...');
    
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
    console.log('Stats API: totalDeposits =', totalDeposits);

    // Get total withdrawals amount
    const withdrawals = await db.withdrawal.aggregate({
      where: { status: 'approved' },
      _sum: { amount: true }
    });
    const totalWithdrawals = withdrawals._sum.amount || 0;
    console.log('Stats API: totalWithdrawals =', totalWithdrawals);

    // Get active miners
    const activeMiners = await db.userMining.count({
      where: { status: 'active' }
    });
    console.log('Stats API: activeMiners =', activeMiners);

    // Get total profit distributed (sum of all mining totalEarned)
    const profitAggregate = await db.userMining.aggregate({
      _sum: { totalEarned: true }
    });
    const totalProfitDistributed = profitAggregate._sum.totalEarned || 0;
    console.log('Stats API: totalProfitDistributed =', totalProfitDistributed);

    // Get online users (sessions in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await db.session.count({
      where: {
        createdAt: { gte: fiveMinutesAgo }
      }
    });
    console.log('Stats API: onlineUsers =', onlineUsers);

    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await db.user.count({
      where: {
        createdAt: { gte: today }
      }
    });
    console.log('Stats API: newUsersToday =', newUsersToday);

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

    console.log('Stats API: Successfully fetched all data');
    
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
      isRealData: true
    });
  } catch (error) {
    console.error('Stats error:', error);
    
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
