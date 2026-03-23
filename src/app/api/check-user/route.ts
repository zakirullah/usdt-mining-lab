import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet') || '0x33cb374635ab51fc669c1849b21b589a17475fc3';

    // Get user
    const userResult = await db.$queryRaw`
      SELECT id, "walletAddress", balance, "depositBalance", "miningBalance", "totalProfit", "totalInvested"
      FROM umlab_users
      WHERE "walletAddress" = ${wallet}
      LIMIT 1
    `;

    const users = userResult as any[];

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found', wallet });
    }

    const user = users[0];

    // Get mining sessions
    const miningResult = await db.$queryRaw`
      SELECT id, "planName", "planType", investment, "dailyPercent", "dailyProfit", "totalEarned", status, "startedAt", "expiresAt"
      FROM umlab_user_mining
      WHERE "userId" = ${user.id}
      ORDER BY "createdAt" DESC
    `;

    const miningSessions = miningResult as any[];

    // Get deposits
    const depositResult = await db.$queryRaw`
      SELECT id, amount, status, "createdAt"
      FROM umlab_deposits
      WHERE "userId" = ${user.id}
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;

    const deposits = depositResult as any[];

    return NextResponse.json({
      user,
      miningSessions,
      deposits,
      miningCount: miningSessions.length,
      activeMiningCount: miningSessions.filter(m => m.status === 'active').length
    });
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
