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
      where: { userId: session.userId, status: 'active' }
    });

    if (!activeMining) {
      return NextResponse.json({ mining: null });
    }

    // Check if mining expired
    if (new Date() >= activeMining.expiresAt) {
      // Complete the mining
      await db.userMining.update({
        where: { id: activeMining.id },
        data: { status: 'completed' }
      });

      // Add total earned to user balance
      await db.user.update({
        where: { id: session.userId },
        data: {
          balance: { increment: activeMining.investment + activeMining.totalEarned },
          totalProfit: { increment: activeMining.totalEarned }
        }
      });

      return NextResponse.json({ 
        mining: { ...activeMining, status: 'completed' },
        completed: true
      });
    }

    // Calculate elapsed time since last update
    const now = new Date();
    const lastUpdate = new Date(activeMining.lastUpdateAt);
    const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

    // Get plan details
    const plan = await db.miningPlan.findUnique({
      where: { id: activeMining.planId }
    });

    const dailyProfitRate = plan?.dailyProfit || 4;
    const profitPerSecond = (activeMining.investment * dailyProfitRate / 100) / 86400;
    const earnedThisUpdate = profitPerSecond * elapsedSeconds;

    // Update mining record
    const updatedMining = await db.userMining.update({
      where: { id: activeMining.id },
      data: {
        totalEarned: { increment: earnedThisUpdate },
        lastUpdateAt: now
      }
    });

    // Calculate remaining time
    const remainingMs = new Date(activeMining.expiresAt).getTime() - now.getTime();
    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    // Calculate time elapsed
    const elapsedMs = now.getTime() - new Date(activeMining.startedAt).getTime();
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const elapsedHours = Math.floor((elapsedMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({
      mining: {
        id: updatedMining.id,
        investment: updatedMining.investment,
        dailyProfit: updatedMining.dailyProfit,
        profitPerSecond: profitPerSecond,
        totalEarned: updatedMining.totalEarned,
        status: updatedMining.status,
        startedAt: updatedMining.startedAt,
        expiresAt: updatedMining.expiresAt,
        remainingTime: {
          days: remainingDays,
          hours: remainingHours,
          minutes: remainingMinutes,
          seconds: remainingSeconds
        },
        elapsedTime: {
          days: elapsedDays,
          hours: elapsedHours,
          minutes: elapsedMinutes
        }
      }
    });
  } catch (error) {
    console.error('Mining update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
