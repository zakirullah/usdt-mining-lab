import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Create Admin Settings
    const adminSettings = await db.adminSettings.upsert({
      where: { id: 'admin-settings' },
      update: {},
      create: {
        id: 'admin-settings',
        siteName: 'USDT Mining Lab',
        depositWallet: '0x742d35cc6634c0532925a3b844bc9173e4438f44',
        minDeposit: 5,
        minWithdraw: 10,
        maintenanceMode: false,
      }
    });

    // Create Starter Plan (4% daily)
    const starterPlan = await db.miningPlan.upsert({
      where: { name: 'Starter Plan' },
      update: {},
      create: {
        name: 'Starter Plan',
        minAmount: 5,
        dailyPercent: 4,
        durationDays: 30,
        isActive: true,
      }
    });

    // Create Pro Plan (5% daily)
    const proPlan = await db.miningPlan.upsert({
      where: { name: 'Pro Plan' },
      update: {},
      create: {
        name: 'Pro Plan',
        minAmount: 100,
        dailyPercent: 5,
        durationDays: 30,
        isActive: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      adminSettings,
      plans: [starterPlan, proPlan]
    });

  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    );
  }
}
