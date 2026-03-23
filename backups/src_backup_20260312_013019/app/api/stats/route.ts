import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get total users (Happy Miners)
    const totalUsers = await db.user.count({
      where: { role: 'user' }
    });

    // Get total deposits amount
    const deposits = await db.deposit.aggregate({
      where: { status: 'approved' },
      _sum: { amount: true }
    });
    const totalDeposits = deposits._sum.amount || 0;

    // Get total withdrawals count
    const totalWithdrawals = await db.withdrawal.count({
      where: { status: 'approved' }
    });

    // Get active mining users
    const activeMining = await db.userMining.count({
      where: { status: 'active' }
    });

    // Get total profit distributed
    const profitAggregate = await db.userMining.aggregate({
      _sum: { totalEarned: true }
    });
    const totalProfitDistributed = profitAggregate._sum.totalEarned || 0;

    // Get online users (users with active sessions in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await db.session.count({
      where: {
        expiresAt: { gt: new Date() },
        createdAt: { gte: fiveMinutesAgo }
      }
    });

    // Get new registrations today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await db.user.count({
      where: {
        createdAt: { gte: today }
      }
    });

    // Get total referral earnings
    const referralEarnings = await db.user.aggregate({
      _sum: { referralEarnings: true }
    });
    const totalReferralEarnings = referralEarnings._sum.referralEarnings || 0;

    // Return real data from database
    return NextResponse.json({
      totalUsers,
      totalDeposits,
      totalWithdrawals,
      activeMining,
      totalProfitDistributed,
      onlineUsers: onlineUsers || 1, // At least show the current user
      newUsersToday,
      totalReferralEarnings,
      isRealData: true
    });
  } catch (error) {
    console.error('Stats error:', error);
    
    // Return zeros if database not available
    return NextResponse.json({
      totalUsers: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      activeMining: 0,
      totalProfitDistributed: 0,
      onlineUsers: 1,
      newUsersToday: 0,
      totalReferralEarnings: 0,
      isRealData: false
    });
  }
}
