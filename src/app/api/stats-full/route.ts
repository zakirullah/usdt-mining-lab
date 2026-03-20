import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User stats
    const totalUsers = await db.user.count();
    const adminCount = await db.user.count({ where: { role: 'admin' } });
    const regularUsers = totalUsers - adminCount;
    
    const todayUsers = await db.user.count({
      where: { createdAt: { gte: today } }
    });
    
    const yesterdayUsers = await db.user.count({
      where: { 
        createdAt: { 
          gte: yesterday,
          lt: today
        } 
      }
    });
    
    const weeklyUsers = await db.user.count({
      where: { createdAt: { gte: weekAgo } }
    });
    
    const monthlyUsers = await db.user.count({
      where: { createdAt: { gte: monthAgo } }
    });

    // Deposit stats
    const totalDeposits = await db.deposit.aggregate({
      _sum: { amount: true },
      _count: true
    });
    
    const approvedDeposits = await db.deposit.aggregate({
      where: { status: 'approved' },
      _sum: { amount: true }
    });
    
    const pendingDeposits = await db.deposit.count({
      where: { status: 'pending' }
    });
    
    const todayDeposits = await db.deposit.aggregate({
      where: { 
        createdAt: { gte: today },
        status: 'approved'
      },
      _sum: { amount: true }
    });

    // Withdrawal stats
    const totalWithdrawals = await db.withdrawal.aggregate({
      _sum: { amount: true },
      _count: true
    });
    
    const approvedWithdrawals = await db.withdrawal.aggregate({
      where: { status: 'approved' },
      _sum: { amount: true }
    });
    
    const pendingWithdrawals = await db.withdrawal.count({
      where: { status: 'pending' }
    });
    
    const todayWithdrawals = await db.withdrawal.aggregate({
      where: { 
        createdAt: { gte: today },
        status: 'approved'
      },
      _sum: { amount: true }
    });

    // Mining stats
    const activeMining = await db.userMining.count({
      where: { status: 'active' }
    });
    
    const miningInvestment = await db.userMining.aggregate({
      where: { status: 'active' },
      _sum: { investment: true, totalEarned: true }
    });

    // Transaction stats
    const totalTransactions = await db.transaction.count();
    const totalProfitPaid = await db.transaction.aggregate({
      where: { type: 'mining_profit' },
      _sum: { amount: true }
    });

    return NextResponse.json({
      users: {
        total: totalUsers,
        admin: adminCount,
        regular: regularUsers,
        today: todayUsers,
        yesterday: yesterdayUsers,
        weekly: weeklyUsers,
        monthly: monthlyUsers
      },
      deposits: {
        total: totalDeposits._count || 0,
        totalAmount: totalDeposits._sum.amount || 0,
        approved: approvedDeposits._sum.amount || 0,
        pending: pendingDeposits,
        todayAmount: todayDeposits._sum.amount || 0
      },
      withdrawals: {
        total: totalWithdrawals._count || 0,
        totalAmount: totalWithdrawals._sum.amount || 0,
        approved: approvedWithdrawals._sum.amount || 0,
        pending: pendingWithdrawals,
        todayAmount: todayWithdrawals._sum.amount || 0
      },
      mining: {
        activeSessions: activeMining,
        totalInvested: miningInvestment._sum.investment || 0,
        totalEarned: miningInvestment._sum.totalEarned || 0
      },
      transactions: {
        total: totalTransactions,
        profitPaid: totalProfitPaid._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
