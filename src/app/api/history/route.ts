import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get recent deposits
    const recentDeposits = await db.deposit.findMany({
      where: { status: 'approved' },
      include: {
        user: { select: { walletAddress: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent withdrawals
    const recentWithdrawals = await db.withdrawal.findMany({
      where: { status: 'approved' },
      include: {
        user: { select: { walletAddress: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Format deposits
    const deposits = recentDeposits.map(d => {
      const wallet = d.user.walletAddress;
      const walletShort = wallet.slice(0, 6) + '...' + wallet.slice(-4);
      const date = new Date(d.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo = 'Just now';
      if (diffDays > 0) timeAgo = `${diffDays}d ago`;
      else if (diffHours > 0) timeAgo = `${diffHours}h ago`;
      else if (diffMins > 0) timeAgo = `${diffMins}m ago`;

      return {
        wallet: walletShort,
        amount: d.amount,
        status: d.status,
        date: timeAgo
      };
    });

    // Format withdrawals
    const withdrawals = recentWithdrawals.map(w => {
      const wallet = w.walletAddress;
      const walletShort = wallet.slice(0, 6) + '...' + wallet.slice(-4);
      const date = new Date(w.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo = 'Just now';
      if (diffDays > 0) timeAgo = `${diffDays}d ago`;
      else if (diffHours > 0) timeAgo = `${diffHours}h ago`;
      else if (diffMins > 0) timeAgo = `${diffMins}m ago`;

      return {
        wallet: walletShort,
        amount: w.amount,
        status: w.status,
        date: timeAgo
      };
    });

    return NextResponse.json({
      deposits,
      withdrawals,
      hasRealData: deposits.length > 0 || withdrawals.length > 0
    });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({
      deposits: [],
      withdrawals: [],
      hasRealData: false
    });
  }
}
