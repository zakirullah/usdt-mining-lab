import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get recent approved deposits (last 20)
    const deposits = await db.deposit.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: { walletAddress: true }
        }
      }
    });

    // Get recent approved withdrawals (last 20)
    const withdrawals = await db.withdrawal.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        amount: true,
        walletAddress: true,
        createdAt: true,
        status: true
      }
    });

    // Format deposits
    const formattedDeposits = deposits.map(d => ({
      wallet: d.user.walletAddress.slice(0, 6) + '...' + d.user.walletAddress.slice(-4),
      amount: d.amount,
      status: d.status,
      date: getTimeAgo(d.createdAt)
    }));

    // Format withdrawals
    const formattedWithdrawals = withdrawals.map(w => ({
      wallet: w.walletAddress.slice(0, 6) + '...' + w.walletAddress.slice(-4),
      amount: w.amount,
      status: w.status,
      date: getTimeAgo(w.createdAt)
    }));

    return NextResponse.json({
      deposits: formattedDeposits,
      withdrawals: formattedWithdrawals,
      isRealData: true
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({
      deposits: [],
      withdrawals: [],
      isRealData: false
    });
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
