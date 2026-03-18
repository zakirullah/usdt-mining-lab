import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get active mining sessions
    const { data: miningSessions } = await supabaseAdmin
      .from('mining_sessions')
      .select('*')
      .eq('user_wallet', user.wallet_address)
      .eq('status', 'active');

    // Calculate real-time profit for each session
    const now = new Date();
    const sessionsWithProfit = (miningSessions || []).map((session: {
      id: string;
      plan_name: string;
      plan_type: string;
      investment: number;
      daily_percent: number;
      daily_profit: number;
      profit_earned: number;
      start_time: string;
      end_time: string;
      status: string;
    }) => {
      const startTime = new Date(session.start_time);
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const profitPerSecond = session.daily_profit / 86400;
      const realTimeProfit = session.profit_earned + (elapsedSeconds * profitPerSecond);
      
      return {
        id: session.id,
        planType: session.plan_type,
        planName: session.plan_name,
        investment: session.investment,
        dailyPercent: session.daily_percent,
        dailyProfit: session.daily_profit,
        profitPerSecond: profitPerSecond,
        totalEarned: realTimeProfit,
        status: session.status,
        startedAt: session.start_time,
        expiresAt: session.end_time
      };
    });

    // Get deposits
    const { data: deposits } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('user_wallet', user.wallet_address)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get withdrawals
    const { data: withdrawals } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('user_wallet', user.wallet_address)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate stats
    const totalDeposits = (deposits || [])
      .filter((d: { status: string }) => d.status === 'approved')
      .reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);
    
    const totalWithdrawals = (withdrawals || [])
      .filter((w: { status: string }) => w.status === 'approved')
      .reduce((sum: number, w: { amount: number }) => sum + w.amount, 0);

    const activeMiningCount = sessionsWithProfit.length;
    const totalProfitPerSecond = sessionsWithProfit.reduce((sum: number, s: { profitPerSecond: number }) => sum + s.profitPerSecond, 0);

    return NextResponse.json({
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        balance: user.balance,
        totalProfit: user.total_profit,
        totalInvested: user.total_invested,
        totalWithdrawn: user.total_withdrawn,
        referralCode: user.referral_code,
        referralEarnings: user.referral_earnings,
        role: user.role
      },
      activeMiningSessions: sessionsWithProfit,
      deposits: deposits || [],
      withdrawals: withdrawals || [],
      stats: {
        totalDeposits,
        totalWithdrawals,
        depositCount: deposits?.length || 0,
        withdrawalCount: withdrawals?.length || 0,
        activeMiningCount,
        totalProfitPerSecond
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
