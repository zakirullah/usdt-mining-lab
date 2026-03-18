import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get 5 minutes ago for online users
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Run all queries in parallel for better performance
    const [
      totalUsers,
      depositsAggregate,
      withdrawalsAggregate,
      activeMiners,
      profitAggregate,
      activeSessions,
      newUsersToday,
      todayDepositsAggregate,
      todayWithdrawalsAggregate,
      todayProfitAggregate,
      todayVisitors,
      onlineVisitors
    ] = await Promise.all([
      // Total users
      db.user.count({ where: { role: 'user' } }),
      
      // Total deposits
      db.deposit.aggregate({
        where: { status: 'approved' },
        _sum: { amount: true }
      }),
      
      // Total withdrawals
      db.withdrawal.aggregate({
        where: { status: 'approved' },
        _sum: { amount: true }
      }),
      
      // Active miners
      db.userMining.count({ where: { status: 'active' } }),
      
      // Total profit distributed
      db.userMining.aggregate({
        _sum: { totalEarned: true }
      }),
      
      // Active sessions (logged in users)
      db.session.count({
        where: {
          createdAt: { gte: fiveMinutesAgo }
        }
      }),
      
      // New users today
      db.user.count({
        where: { createdAt: { gte: today } }
      }),
      
      // Today deposits
      db.deposit.aggregate({
        where: { status: 'approved', createdAt: { gte: today } },
        _sum: { amount: true }
      }),
      
      // Today withdrawals
      db.withdrawal.aggregate({
        where: { status: 'approved', createdAt: { gte: today } },
        _sum: { amount: true }
      }),
      
      // Today profit
      db.transaction.aggregate({
        where: { type: 'mining_profit', createdAt: { gte: today } },
        _sum: { amount: true }
      }),
      
      // Today visitors
      db.visitor.count({
        where: { createdAt: { gte: today } }
      }),
      
      // Online visitors (visited in last 5 minutes)
      db.visitor.count({
        where: { lastVisit: { gte: fiveMinutesAgo } }
      })
    ]);
    
    const totalDeposits = depositsAggregate._sum.amount || 0;
    const totalWithdrawals = withdrawalsAggregate._sum.amount || 0;
    const totalProfitDistributed = profitAggregate._sum.totalEarned || 0;
    const todayDeposits = todayDepositsAggregate._sum.amount || 0;
    const todayWithdrawals = todayWithdrawalsAggregate._sum.amount || 0;
    const todayProfit = todayProfitAggregate._sum.amount || 0;
    
    // Online users = active sessions + online visitors
    const onlineUsers = Math.max(activeSessions + onlineVisitors, 1);
    
    const elapsedMs = Date.now() - startTime;
    
    return NextResponse.json({
      // Platform Statistics
      totalUsers,
      totalDeposits,
      totalWithdrawals,
      activeMiners,
      totalProfitDistributed,
      onlineUsers,
      
      // Today Statistics
      newUsersToday,
      todayDeposits,
      todayWithdrawals,
      todayProfit,
      todayVisitors,
      
      // Meta
      isRealData: true,
      responseTimeMs: elapsedMs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
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
      todayVisitors: 0,
      isRealData: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTimeMs: elapsedMs,
      timestamp: new Date().toISOString()
    });
  }
}
