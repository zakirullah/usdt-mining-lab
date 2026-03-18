import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { token }
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // Get ALL active mining sessions
    const activeMinings = await db.userMining.findMany({
      where: { 
        userId: session.userId, 
        status: 'active' 
      }
    });

    if (activeMinings.length === 0) {
      return NextResponse.json({ miningSessions: [], totalProfitPerSecond: 0 });
    }

    const now = new Date();
    const updatedSessions = [];
    let totalProfitAdded = 0;

    for (const mining of activeMinings) {
      // Check if mining expired
      if (now >= new Date(mining.expiresAt)) {
        // Complete the mining
        await db.userMining.update({
          where: { id: mining.id },
          data: { status: 'completed' }
        });

        // Add total earned to user balance
        await db.user.update({
          where: { id: session.userId },
          data: {
            balance: { increment: mining.investment + mining.totalEarned },
            totalProfit: { increment: mining.totalEarned },
            miningBalance: { decrement: mining.investment }
          }
        });

        // Create transaction
        await db.transaction.create({
          data: {
            userId: session.userId,
            type: 'mining_completed',
            amount: mining.totalEarned,
            status: 'completed',
            description: `${mining.planName} completed - Investment returned with profit`
          }
        });

        updatedSessions.push({
          ...mining,
          status: 'completed'
        });
        continue;
      }

      // Calculate elapsed time since last update
      const lastUpdate = new Date(mining.lastUpdateAt);
      const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

      // Get profit per second
      const profitPerSecond = (mining.investment * mining.dailyPercent / 100) / 86400;
      const earnedThisUpdate = profitPerSecond * elapsedSeconds;

      // Update mining record
      const updatedMining = await db.userMining.update({
        where: { id: mining.id },
        data: {
          totalEarned: { increment: earnedThisUpdate },
          lastUpdateAt: now
        }
      });

      totalProfitAdded += earnedThisUpdate;

      // Calculate remaining time
      const remainingMs = new Date(mining.expiresAt).getTime() - now.getTime();
      const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      // Calculate progress
      const totalDuration = new Date(mining.expiresAt).getTime() - new Date(mining.startedAt).getTime();
      const elapsed = now.getTime() - new Date(mining.startedAt).getTime();
      const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);

      updatedSessions.push({
        id: updatedMining.id,
        planType: mining.planType,
        planName: mining.planName,
        investment: updatedMining.investment,
        dailyPercent: mining.dailyPercent,
        dailyProfit: updatedMining.dailyProfit,
        profitPerSecond: profitPerSecond,
        totalEarned: updatedMining.totalEarned,
        status: updatedMining.status,
        startedAt: updatedMining.startedAt,
        expiresAt: updatedMining.expiresAt,
        progressPercent: progressPercent,
        remainingTime: {
          days: remainingDays,
          hours: remainingHours,
          minutes: remainingMinutes,
          seconds: remainingSeconds
        }
      });
    }

    // Update user's total profit
    if (totalProfitAdded > 0) {
      await db.user.update({
        where: { id: session.userId },
        data: {
          totalProfit: { increment: totalProfitAdded }
        }
      });
    }

    // Calculate total profit per second for all active sessions
    const totalProfitPerSecond = updatedSessions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.profitPerSecond, 0);

    return NextResponse.json({
      miningSessions: updatedSessions,
      totalProfitPerSecond: totalProfitPerSecond,
      totalProfitAdded: totalProfitAdded
    });
  } catch (error) {
    console.error('Mining update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
