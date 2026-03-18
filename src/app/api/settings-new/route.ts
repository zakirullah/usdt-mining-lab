import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Get platform settings
    const { data: settings } = await supabaseAdmin
      .from('platform_settings')
      .select('*')
      .single();

    // Get active broadcast message
    const { data: broadcast } = await supabaseAdmin
      .from('broadcast_messages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      depositWallet: settings?.deposit_wallet || '0x33cb374635ab51fc669c1849b21b589a17475fc3',
      minDeposit: settings?.min_deposit || 10,
      minWithdraw: settings?.min_withdraw || 10,
      starterDailyPercent: settings?.starter_daily_percent || 4,
      proDailyPercent: settings?.pro_daily_percent || 4.5,
      planDurationDays: settings?.plan_duration_days || 30,
      broadcastMessage: broadcast?.message || null
    });
  } catch (error) {
    console.error('Get settings error:', error);
    // Return default values on error
    return NextResponse.json({
      depositWallet: '0x33cb374635ab51fc669c1849b21b589a17475fc3',
      minDeposit: 10,
      minWithdraw: 10,
      starterDailyPercent: 4,
      proDailyPercent: 4.5,
      planDurationDays: 30,
      broadcastMessage: null
    });
  }
}
