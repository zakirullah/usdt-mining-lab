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

    const body = await request.json();
    const { planType, amount } = body; // 'starter' or 'pro'

    // Plan configurations
    const plans = {
      starter: { minInvest: 10, dailyProfit: 4, duration: 30, totalReturn: 120 },
      pro: { minInvest: 100, dailyProfit: 4.5, duration: 30, totalReturn: 135 }
    };

    const plan = plans[planType as keyof typeof plans];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const investmentAmount = amount || session.user.balance;

    // Check if user has enough balance
    if (session.user.balance < plan.minInvest) {
      return NextResponse.json({ 
        error: `Insufficient Balance. Minimum deposit required: ${plan.minInvest} USDT` 
      }, { status: 400 });
    }

    if (investmentAmount > session.user.balance) {
      return NextResponse.json({ error: 'Insufficient balance for this investment' }, { status: 400 });
    }

    // Check if user already has active mining
    const existingMining = await db.userMining.findFirst({
      where: { userId: session.userId, status: 'active' }
    });

    if (existingMining) {
      return NextResponse.json({ error: 'You already have an active mining plan' }, { status: 400 });
    }

    // Get or create mining plan
    let miningPlan = await db.miningPlan.findFirst({
      where: { name: planType === 'starter' ? 'Starter Mining Plan' : 'Pro Mining Plan' }
    });

    if (!miningPlan) {
      miningPlan = await db.miningPlan.create({
        data: {
          name: planType === 'starter' ? 'Starter Mining Plan' : 'Pro Mining Plan',
          dailyProfit: plan.dailyProfit,
          duration: plan.duration,
          minInvest: plan.minInvest,
          maxInvest: 100000
        }
      });
    }

    // Calculate profit per second
    const dailyProfitAmount = (investmentAmount * plan.dailyProfit) / 100;
    const profitPerSecond = dailyProfitAmount / 86400;

    // Create user mining record
    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    const userMining = await db.userMining.create({
      data: {
        userId: session.userId,
        planId: miningPlan.id,
        investment: investmentAmount,
        dailyProfit: dailyProfitAmount,
        totalEarned: 0,
        status: 'active',
        expiresAt: expiresAt
      }
    });

    // Deduct balance
    await db.user.update({
      where: { id: session.userId },
      data: {
        balance: { decrement: investmentAmount }
      }
    });

    // Create transaction
    await db.transaction.create({
      data: {
        userId: session.userId,
        type: 'plan_activation',
        amount: investmentAmount,
        status: 'completed',
        description: `${planType === 'starter' ? 'Starter' : 'Pro'} Plan activated`
      }
    });

    // Create notification
    await db.notification.create({
      data: {
        type: 'plan',
        message: `${session.user.walletAddress.slice(0, 8)}... activated ${planType === 'starter' ? 'Starter' : 'Pro'} Plan`,
        amount: investmentAmount
      }
    });

    return NextResponse.json({
      success: true,
      mining: {
        id: userMining.id,
        investment: userMining.investment,
        dailyProfit: userMining.dailyProfit,
        profitPerSecond: profitPerSecond,
        totalEarned: userMining.totalEarned,
        status: userMining.status,
        startedAt: userMining.startedAt,
        expiresAt: userMining.expiresAt,
        planType: planType
      }
    });
  } catch (error) {
    console.error('Mining start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
