import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get recent notifications (activities) from database
    // Get deposits, withdrawals, and registrations from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get recent deposits
    const recentDeposits = await db.deposit.findMany({
      where: {
        createdAt: { gte: oneDayAgo }
      },
      include: {
        user: {
          select: { walletAddress: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent withdrawals
    const recentWithdrawals = await db.withdrawal.findMany({
      where: {
        createdAt: { gte: oneDayAgo }
      },
      include: {
        user: {
          select: { walletAddress: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent registrations
    const recentRegistrations = await db.user.findMany({
      where: {
        createdAt: { gte: oneDayAgo }
      },
      select: {
        walletAddress: true,
        email: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Format activities
    const activities: Array<{
      type: string;
      message: string;
      amount?: number;
      walletAddress: string;
      createdAt: Date;
    }> = [];

    // Add deposits
    recentDeposits.forEach(deposit => {
      const walletShort = deposit.user.walletAddress.slice(0, 8) + '...' + deposit.user.walletAddress.slice(-4);
      activities.push({
        type: 'deposit',
        message: `${walletShort} just deposited ${deposit.amount} USDT`,
        amount: deposit.amount,
        walletAddress: deposit.user.walletAddress,
        createdAt: deposit.createdAt
      });
    });

    // Add withdrawals
    recentWithdrawals.forEach(withdrawal => {
      const walletShort = withdrawal.user.walletAddress.slice(0, 8) + '...' + withdrawal.user.walletAddress.slice(-4);
      activities.push({
        type: 'withdraw',
        message: `${walletShort} just withdrew ${withdrawal.amount} USDT`,
        amount: withdrawal.amount,
        walletAddress: withdrawal.user.walletAddress,
        createdAt: withdrawal.createdAt
      });
    });

    // Add registrations
    recentRegistrations.forEach(user => {
      const walletShort = user.walletAddress.slice(0, 8) + '...' + user.walletAddress.slice(-4);
      activities.push({
        type: 'register',
        message: `${walletShort} just joined Usdt Mining Lab`,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt
      });
    });

    // Sort by most recent first
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // If no real activities, return empty (frontend will handle showing no data message or demo data)
    return NextResponse.json({
      activities: activities.slice(0, 20),
      hasRealData: activities.length > 0
    });
  } catch (error) {
    console.error('Activities error:', error);
    
    // Return empty activities on error
    return NextResponse.json({
      activities: [],
      hasRealData: false
    });
  }
}
