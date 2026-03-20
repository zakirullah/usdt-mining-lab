import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // Get active mining
    const activeMining = await db.userMining.findFirst({
      where: {
        userId: session.userId,
        status: 'active',
        expiresAt: { gt: new Date() }
      }
    });

    if (!activeMining) {
      return NextResponse.json({ mining: null, message: 'No active mining' });
    }

    // Calculate earnings per second
    // Daily profit / seconds in a day
    const earningsPerSecond = activeMining.dailyProfit / 86400;

    // Calculate time elapsed since last update
    const now = new Date();
    const lastUpdate = new Date(activeMining.lastUpdateAt);
    const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

    // Only update if at least 1 second has passed
    if (elapsedSeconds < 1) {
      return NextResponse.json({
        mining: {
          id: activeMining.id,
          investment: activeMining.investment,
          dailyProfit: activeMining.dailyProfit,
          totalEarned: activeMining.totalEarned,
          earningsPerSecond,
          status: activeMining.status,
          expiresAt: activeMining.expiresAt,
          remainingDays: Math.ceil((new Date(activeMining.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }
      });
    }

    // Calculate earned amount
    const earnedAmount = earningsPerSecond * elapsedSeconds;

    // Update mining and user balance
    const updatedMining = await db.$transaction(async (tx) => {
      // Update mining record
      const mining = await tx.userMining.update({
        where: { id: activeMining.id },
        data: {
          totalEarned: { increment: earnedAmount },
          lastUpdateAt: now
        }
      });

      // Check if expired
      if (new Date(mining.expiresAt) <= now) {
        await tx.userMining.update({
          where: { id: mining.id },
          data: { status: 'expired' }
        });
        return { ...mining, status: 'expired' };
      }

      // Update user balance and total profit
      await tx.user.update({
        where: { id: session.userId },
        data: {
          balance: { increment: earnedAmount },
          totalProfit: { increment: earnedAmount }
        }
      });

      // Create transaction record for earnings (every 60 seconds)
      const lastProfitTx = await tx.transaction.findFirst({
        where: {
          userId: session.userId,
          type: 'mining_profit'
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!lastProfitTx || (now.getTime() - new Date(lastProfitTx.createdAt).getTime()) > 60000) {
        await tx.transaction.create({
          data: {
            userId: session.userId,
            type: 'mining_profit',
            amount: earnedAmount,
            description: 'Mining profit'
          }
        });
      }

      return mining;
    });

    return NextResponse.json({
      mining: {
        id: updatedMining.id,
        investment: updatedMining.investment,
        dailyProfit: updatedMining.dailyProfit,
        totalEarned: updatedMining.totalEarned,
        earningsPerSecond,
        earnedThisUpdate: earnedAmount,
        status: updatedMining.status,
        expiresAt: updatedMining.expiresAt,
        remainingDays: Math.ceil((new Date(updatedMining.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('Mining update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
