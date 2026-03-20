import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get admin settings
    const settings = await db.adminSettings.findFirst();

    // Return deposit wallet - use default if not set
    return NextResponse.json({
      depositWallet: settings?.depositWallet || '0x33cb374635ab51fc669c1849b21b589a17475fc3',
      minDeposit: settings?.minDeposit || 10,
      minWithdraw: settings?.minWithdraw || 10,
      siteName: settings?.siteName || 'USDT Mining Lab'
    });
  } catch (error) {
    console.error('Get settings error:', error);
    // Return default values on error
    return NextResponse.json({
      depositWallet: '0x33cb374635ab51fc669c1849b21b589a17475fc3',
      minDeposit: 10,
      minWithdraw: 10,
      siteName: 'USDT Mining Lab'
    });
  }
}
