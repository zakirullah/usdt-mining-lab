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

    const body = await request.json();
    const { planType, amount } = body; // 'starter' or 'pro'

    // Plan configurations
    // Starter Plan: 4% daily, min 10 USDT, 30 days, 120% total return
    // Pro Plan: 4.5% daily, min 100 USDT, 30 days, 135% total return
    const plans = {
      starter: { 
        name: 'Starter Mining Plan',
        minInvest: 10, 
        dailyPercent: 4, 
        duration: 30, 
        totalReturn: 120 
      },
      pro: { 
        name: 'Pro Mining Plan',
        minInvest: 100, 
        dailyPercent: 4.5, 
        duration: 30, 
        totalReturn: 135 
      }
    };

    const plan = plans[planType as keyof typeof plans];
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Invalid plan type' }, { status: 400 });
    }

    // Use provided amount or user's full balance
    const investmentAmount = amount ? parseFloat(amount) : session.user.balance;

    // Validate investment amount
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid investment amount' 
      }, { status: 400 });
    }

    // Check minimum investment
    if (investmentAmount < plan.minInvest) {
      return NextResponse.json({ 
        success: false, 
        error: `Minimum investment for ${planType} plan is ${plan.minInvest} USDT` 
      }, { status: 400 });
    }

    // Check if user has enough balance
    if (investmentAmount > session.user.balance) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient balance for this investment' 
      }, { status: 400 });
    }

    // Check if user already has active mining
    const existingMining = await db.userMining.findFirst({
      where: { userId: session.userId, status: 'active' }
    });

    if (existingMining) {
      return NextResponse.json({ 
        success: false, 
        error: 'You already have an active mining plan. Wait for it to complete before starting a new one.' 
      }, { status: 400 });
    }

    // Get or create mining plan
    let miningPlan = await db.miningPlan.findFirst({
      where: { name: plan.name }
    });

    if (!miningPlan) {
      miningPlan = await db.miningPlan.create({
        data: {
          name: plan.name,
          dailyProfit: plan.dailyPercent,
          duration: plan.duration,
          minInvest: plan.minInvest,
          maxInvest: 100000
        }
      });
    }

    // Calculate profit per second: (investment * dailyPercent) / 86400
    const dailyProfitAmount = (investmentAmount * plan.dailyPercent) / 100;
    const profitPerSecond = dailyProfitAmount / 86400;

    // Calculate expiry time (30 days from now)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    // Create user mining record
    const userMining = await db.userMining.create({
      data: {
        userId: session.userId,
        planId: miningPlan.id,
        investment: investmentAmount,
        dailyProfit: dailyProfitAmount,
        totalEarned: 0,
        status: 'active',
        expiresAt: expiresAt,
        lastUpdateAt: now
      }
    });

    // Deduct balance from user
    await db.user.update({
      where: { id: session.userId },
      data: {
        balance: { decrement: investmentAmount }
      }
    });

    // Create transaction record
    await db.transaction.create({
      data: {
        userId: session.userId,
        type: 'plan_activation',
        amount: investmentAmount,
        status: 'completed',
        description: `${planType === 'starter' ? 'Starter' : 'Pro'} Plan activated - ${investmentAmount} USDT investment`
      }
    });

    // Create notification for activity feed
    await db.notification.create({
      data: {
        type: 'plan',
        message: `${session.user.walletAddress.slice(0, 8)}...${session.user.walletAddress.slice(-4)} activated ${planType === 'starter' ? 'Starter' : 'Pro'} Plan (${investmentAmount} USDT)`,
        amount: investmentAmount
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        mining: {
          id: userMining.id,
          investment: userMining.investment,
          dailyProfit: userMining.dailyProfit,
          profitPerSecond: profitPerSecond,
          totalEarned: userMining.totalEarned,
          status: userMining.status,
          startedAt: userMining.startedAt,
          expiresAt: userMining.expiresAt,
          planType: planType,
          planName: plan.name,
          dailyPercent: plan.dailyPercent,
          duration: plan.duration,
          totalReturn: plan.totalReturn
        }
      }
    });
  } catch (error) {
    console.error('Mining start error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
