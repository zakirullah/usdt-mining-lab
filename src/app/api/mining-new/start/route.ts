import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-supabase';

// Plan configurations
const PLANS = {
  starter: {
    name: 'Starter Plan',
    dailyPercent: 4,
    minInvest: 10,
    durationDays: 30
  },
  pro: {
    name: 'Pro Plan',
    dailyPercent: 4.5,
    minInvest: 100,
    durationDays: 30
  }
};

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { planType, amount } = body;

    // Validate plan type
    if (!planType || !['starter', 'pro'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    const plan = PLANS[planType as keyof typeof PLANS];

    // Validate amount
    const investment = parseFloat(amount);
    if (isNaN(investment) || investment < plan.minInvest) {
      return NextResponse.json(
        { error: `Minimum investment for ${plan.name} is ${plan.minInvest} USDT` },
        { status: 400 }
      );
    }

    // Check balance
    if (user.balance < investment) {
      return NextResponse.json(
        { error: 'Insufficient balance. Please deposit more funds.' },
        { status: 400 }
      );
    }

    // Calculate mining parameters
    const dailyProfit = investment * (plan.dailyPercent / 100);
    const startTime = new Date();
    const endTime = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

    // Start transaction: deduct balance and create mining session
    const { error: balanceError } = await supabaseAdmin
      .from('users')
      .update({ 
        balance: user.balance - investment,
        total_invested: user.total_invested + investment
      })
      .eq('id', user.id);

    if (balanceError) {
      console.error('Balance update error:', balanceError);
      return NextResponse.json(
        { error: 'Failed to start mining' },
        { status: 500 }
      );
    }

    // Create mining session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('mining_sessions')
      .insert({
        id: crypto.randomUUID(),
        user_wallet: user.wallet_address,
        plan_name: plan.name,
        plan_type: planType,
        investment: investment,
        daily_percent: plan.dailyPercent,
        daily_profit: dailyProfit,
        profit_earned: 0,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (sessionError) {
      // Refund balance if session creation fails
      await supabaseAdmin
        .from('users')
        .update({ 
          balance: user.balance,
          total_invested: user.total_invested
        })
        .eq('id', user.id);
      
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to start mining session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${plan.name} activated with ${investment} USDT!`,
      session: {
        id: session.id,
        planName: session.plan_name,
        investment: session.investment,
        dailyProfit: session.daily_profit,
        startTime: session.start_time,
        endTime: session.end_time,
        status: session.status
      }
    });
  } catch (error) {
    console.error('Mining start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
