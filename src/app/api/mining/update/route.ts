import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 });
    }

    // Get active mining
    const activeMining = await db.userMining.findFirst({
      where: { userId: session.userId, status: 'active' }
    });

    if (!activeMining) {
      return NextResponse.json({ 
        success: true, 
        data: { mining: null } 
      });
    }

    const now = new Date();

    // Check if mining expired
    if (now >= activeMining.expiresAt) {
      // Complete the mining - add total earned + original investment to user balance
      const totalAmount = activeMining.investment + activeMining.totalEarned;
      
      await db.$transaction([
        db.userMining.update({
          where: { id: activeMining.id },
          data: { 
            status: 'completed',
            lastUpdateAt: now
          }
        }),
        db.user.update({
          where: { id: session.userId },
          data: {
            balance: { increment: totalAmount },
            totalProfit: { increment: activeMining.totalEarned }
          }
        }),
        db.transaction.create({
          data: {
            userId: session.userId,
            type: 'mining_profit',
            amount: activeMining.totalEarned,
            status: 'completed',
            description: `Mining completed - Total profit: ${activeMining.totalEarned.toFixed(2)} USDT`
          }
        })
      ]);

      return NextResponse.json({ 
        success: true,
        data: { 
          mining: { ...activeMining, status: 'completed' },
          completed: true,
          totalProfit: activeMining.totalEarned,
          totalReturned: totalAmount
        }
      });
    }

    // Calculate elapsed time since last update
    const lastUpdate = new Date(activeMining.lastUpdateAt);
    const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

    // Skip if less than 1 second elapsed (prevent too frequent updates)
    if (elapsedSeconds < 1) {
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
        success: true,
        data: {
          mining: {
            id: activeMining.id,
            investment: activeMining.investment,
            dailyProfit: activeMining.dailyProfit,
            profitPerSecond: activeMining.dailyProfit / 86400,
            totalEarned: activeMining.totalEarned,
            status: activeMining.status,
            startedAt: activeMining.startedAt,
            expiresAt: activeMining.expiresAt,
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
        }
      });
    }

    // Get plan details for daily profit rate
    const plan = await db.miningPlan.findUnique({
      where: { id: activeMining.planId }
    });

    const dailyProfitRate = plan?.dailyProfit || 4;
    
    // Calculate profit per second: (investment * dailyPercent) / 86400
    const profitPerSecond = (activeMining.investment * dailyProfitRate / 100) / 86400;
    const earnedThisUpdate = profitPerSecond * elapsedSeconds;

    // Update mining record and user balance/totalProfit in transaction
    const updatedMining = await db.$transaction(async (tx) => {
      // Update mining record
      const mining = await tx.userMining.update({
        where: { id: activeMining.id },
        data: {
          totalEarned: { increment: earnedThisUpdate },
          lastUpdateAt: now
        }
      });

      // Add profit to user's balance and totalProfit
      await tx.user.update({
        where: { id: session.userId },
        data: {
          balance: { increment: earnedThisUpdate },
          totalProfit: { increment: earnedThisUpdate }
        }
      });

      return mining;
    });

    // Calculate remaining time
    const remainingMs = new Date(activeMining.expiresAt).getTime() - now.getTime();
    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const remainingSecondsVal = Math.floor((remainingMs % (1000 * 60)) / 1000);

    // Calculate time elapsed
    const elapsedMs = now.getTime() - new Date(activeMining.startedAt).getTime();
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const elapsedHours = Math.floor((elapsedMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

    // Calculate progress percentage
    const totalDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const progressPercent = Math.min(100, (elapsedMs / totalDuration) * 100);

    return NextResponse.json({
      success: true,
      data: {
        mining: {
          id: updatedMining.id,
          investment: updatedMining.investment,
          dailyProfit: updatedMining.dailyProfit,
          profitPerSecond: profitPerSecond,
          totalEarned: updatedMining.totalEarned,
          earnedThisUpdate: earnedThisUpdate,
          status: updatedMining.status,
          startedAt: updatedMining.startedAt,
          expiresAt: updatedMining.expiresAt,
          remainingTime: {
            days: remainingDays,
            hours: remainingHours,
            minutes: remainingMinutes,
            seconds: remainingSecondsVal
          },
          elapsedTime: {
            days: elapsedDays,
            hours: elapsedHours,
            minutes: elapsedMinutes
          },
          progressPercent: progressPercent
        }
      }
    });
  } catch (error) {
    console.error('Mining update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
