import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get all active mining plans
export async function GET(request: NextRequest) {
  try {
    const plans = await db.miningPlan.findMany({
      where: { isActive: true },
      orderBy: { minDeposit: 'asc' }
    });

    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      planName: plan.planName,
      minDeposit: plan.minDeposit,
      dailyProfit: plan.dailyProfit,
      durationDays: plan.durationDays,
      totalReturn: plan.dailyProfit * plan.durationDays,
    }));

    return NextResponse.json({
      plans: formattedPlans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
