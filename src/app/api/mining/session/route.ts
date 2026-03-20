import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get user's mining session
export async function GET(request: NextRequest) {
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

    // Get active mining session
    const miningSession = await db.miningSession.findFirst({
      where: { 
        userId: session.userId,
        status: 'active'
      },
      include: { plan: true }
    });

    if (!miningSession) {
      return NextResponse.json({ mining: null });
    }

    // Calculate current profit
    const now = new Date();
    const lastUpdate = new Date(miningSession.lastUpdateAt);
    const secondsSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    // Calculate profit per second: (investment * daily% / 100) / 86400
    const profitPerSecond = (miningSession.investment * miningSession.dailyProfit / 100) / 86400;
    const additionalProfit = secondsSinceUpdate * profitPerSecond;
    
    // Update mining session with new profit
    const updatedSession = await db.miningSession.update({
      where: { id: miningSession.id },
      data: {
        totalEarned: { increment: additionalProfit },
        lastUpdateAt: now
      }
    });

    // Check if expired
    if (now >= new Date(miningSession.expiresAt)) {
      await db.miningSession.update({
        where: { id: miningSession.id },
        data: { status: 'expired' }
      });

      // Add remaining profit to user balance
      await db.user.update({
        where: { id: session.userId },
        data: {
          balance: { increment: updatedSession.totalEarned },
          totalProfit: { increment: updatedSession.totalEarned }
        }
      });

      return NextResponse.json({ 
        mining: { ...miningSession, status: 'expired', totalEarned: updatedSession.totalEarned }
      });
    }

    // Calculate elapsed and remaining time
    const startedAt = new Date(miningSession.startedAt);
    const expiresAt = new Date(miningSession.expiresAt);
    const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
    const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    return NextResponse.json({
      mining: {
        ...miningSession,
        totalEarned: updatedSession.totalEarned,
        profitPerSecond,
        elapsed,
        remaining
      }
    });
  } catch (error) {
    console.error('Get mining session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
