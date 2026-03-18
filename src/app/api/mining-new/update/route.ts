import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const now = new Date();

    // Get all active mining sessions for user
    const { data: sessions, error } = await supabaseAdmin
      .from('mining_sessions')
      .select('*')
      .eq('user_wallet', user.wallet_address)
      .eq('status', 'active');

    if (error) {
      console.error('Fetch sessions error:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ miningSessions: [] });
    }

    let totalNewProfit = 0;
    const updatedSessions = [];

    for (const session of sessions) {
      const startTime = new Date(session.start_time);
      const endTime = new Date(session.end_time);
      
      // Check if session has ended
      if (now >= endTime) {
        // Calculate final profit
        const totalDuration = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds
        const profitPerSecond = session.daily_profit / 86400;
        const finalProfit = totalDuration * profitPerSecond;
        
        // Update session to completed
        await supabaseAdmin
          .from('mining_sessions')
          .update({
            profit_earned: finalProfit,
            status: 'completed'
          })
          .eq('id', session.id);

        totalNewProfit += finalProfit;
        updatedSessions.push({
          ...session,
          profit_earned: finalProfit,
          status: 'completed'
        });
      } else {
        // Calculate current profit
        const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000;
        const profitPerSecond = session.daily_profit / 86400;
        const currentProfit = elapsedSeconds * profitPerSecond;

        // Update profit in database (every 10 seconds to reduce DB load)
        // For now, just return the calculated profit
        updatedSessions.push({
          ...session,
          profit_earned: currentProfit
        });
      }
    }

    // If any session completed, update user's total profit
    if (totalNewProfit > 0) {
      await supabaseAdmin
        .from('users')
        .update({
          total_profit: user.total_profit + totalNewProfit
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      miningSessions: updatedSessions.map(s => ({
        id: s.id,
        planType: s.plan_type,
        planName: s.plan_name,
        investment: s.investment,
        dailyPercent: s.daily_percent,
        dailyProfit: s.daily_profit,
        profitPerSecond: s.daily_profit / 86400,
        totalEarned: s.profit_earned,
        status: s.status,
        startedAt: s.start_time,
        expiresAt: s.end_time
      }))
    });
  } catch (error) {
    console.error('Mining update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
