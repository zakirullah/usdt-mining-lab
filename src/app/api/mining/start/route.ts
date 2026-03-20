import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { planType, amount } = body; // 'starter' or 'pro'

    // Plan configurations
    const plans = {
      starter: { minInvest: 10, dailyPercent: 4, duration: 30, name: 'Starter Plan' },
      pro: { minInvest: 100, dailyPercent: 4.5, duration: 30, name: 'Pro Plan' }
    };

    const plan = plans[planType as keyof typeof plans];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const investmentAmount = parseFloat(amount);

    // Validate investment amount
    if (!investmentAmount || isNaN(investmentAmount)) {
      return NextResponse.json({ error: 'Please enter a valid investment amount' }, { status: 400 });
    }

    if (investmentAmount < plan.minInvest) {
      return NextResponse.json({ 
        error: `Minimum investment for ${plan.name} is ${plan.minInvest} USDT` 
      }, { status: 400 });
    }

    // Check if user has enough balance
    if (user.balance < investmentAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
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

    // Calculate profit per second
    const dailyProfitAmount = (investmentAmount * plan.dailyPercent) / 100;
    const profitPerSecond = dailyProfitAmount / 86400;

    // Create user mining record (multiple sessions allowed)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    const userMining = await db.userMining.create({
      data: {
        userId: user.id,
        planId: miningPlan.id,
        planType: planType,
        planName: plan.name,
        investment: investmentAmount,
        dailyPercent: plan.dailyPercent,
        dailyProfit: dailyProfitAmount,
        profitPerSecond: profitPerSecond,
        totalEarned: 0,
        status: 'active',
        expiresAt: expiresAt
      }
    });

    // Deduct balance and update stats
    await db.user.update({
      where: { id: user.id },
      data: {
        balance: { decrement: investmentAmount },
        miningBalance: { increment: investmentAmount },
        totalInvested: { increment: investmentAmount }
      }
    });

    // Create transaction
    await db.transaction.create({
      data: {
        userId: user.id,
        type: 'plan_activation',
        amount: investmentAmount,
        status: 'completed',
        description: `${plan.name} activated with ${investmentAmount} USDT`
      }
    });

    // Process 7% referral commission
    if (user.referredBy) {
      const referrer = await db.user.findUnique({
        where: { referralCode: user.referredBy }
      });

      if (referrer) {
        const commissionAmount = investmentAmount * 0.07; // 7% commission
        
        // Add commission to referrer's balance
        await db.user.update({
          where: { id: referrer.id },
          data: {
            balance: { increment: commissionAmount },
            referralEarnings: { increment: commissionAmount }
          }
        });

        // Create referral record
        await db.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: user.id,
            commission: commissionAmount,
            commissionPercent: 7,
            miningSessionId: userMining.id
          }
        });

        // Create transaction for referrer
        await db.transaction.create({
          data: {
            userId: referrer.id,
            type: 'referral_bonus',
            amount: commissionAmount,
            status: 'completed',
            description: `7% commission from referral investment`
          }
        });
      }
    }

    // Create notification
    await db.notification.create({
      data: {
        type: 'plan',
        message: `${user.walletAddress.slice(0, 8)}... activated ${plan.name} with ${investmentAmount} USDT`,
        amount: investmentAmount
      }
    });

    return NextResponse.json({
      success: true,
      mining: {
        id: userMining.id,
        planType: planType,
        planName: plan.name,
        investment: userMining.investment,
        dailyPercent: userMining.dailyPercent,
        dailyProfit: userMining.dailyProfit,
        profitPerSecond: profitPerSecond,
        totalEarned: userMining.totalEarned,
        status: userMining.status,
        startedAt: userMining.startedAt,
        expiresAt: userMining.expiresAt
      }
    });
  } catch (error) {
    console.error('Mining start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
