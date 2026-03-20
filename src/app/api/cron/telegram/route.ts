import { NextRequest, NextResponse } from 'next/server';
import { TelegramAutoUpdates } from '@/lib/telegram-auto-updates';

export const dynamic = 'force-dynamic';

// Cron job endpoint - call this from external cron service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'all';
    const secret = searchParams.get('secret');
    
    // Simple auth check
    if (secret !== 'usdt-mining-lab-cron-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const results: Record<string, boolean> = {};
    
    switch (action) {
      case 'stats':
        results.hourlyStats = await TelegramAutoUpdates.sendHourlyStats();
        break;
      case 'tip':
        results.miningTip = await TelegramAutoUpdates.sendMiningTip();
        break;
      case 'price':
        results.priceUpdate = await TelegramAutoUpdates.sendPriceUpdate();
        break;
      case 'greeting':
        results.greeting = await TelegramAutoUpdates.sendGreeting();
        break;
      case 'topminer':
        results.topMiner = await TelegramAutoUpdates.sendTopMiner();
        break;
      case 'all':
      default:
        results.hourlyStats = await TelegramAutoUpdates.sendHourlyStats();
        results.miningTip = await TelegramAutoUpdates.sendMiningTip();
        break;
    }
    
    return NextResponse.json({
      success: true,
      action,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
