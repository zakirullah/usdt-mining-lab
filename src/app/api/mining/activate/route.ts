import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planName, investment, profitRate } = body;

    // Get user from session
    const sessionToken = request.cookies.get('auth_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find session using raw query
    const sessionResult = await db.$queryRaw`
      SELECT s.id, s.token, s."expiresAt", s."userId",
             u.id as user_id, u."walletAddress", u.balance
      FROM umlab_sessions s
      JOIN umlab_users u ON s."userId" = u.id
      WHERE s.token = ${sessionToken}
      LIMIT 1
    `;

    const sessions = sessionResult as any[];
    
    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      );
    }

    const session = sessions[0];

    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const userBalance = Number(session.balance);

    // Validate investment
    const minAmount = profitRate === 4 ? 10 : 100;
    
    if (!investment || investment < minAmount) {
      return NextResponse.json(
        { error: `Minimum investment is ${minAmount} USDT` },
        { status: 400 }
      );
    }

    // Check balance
    if (userBalance < investment) {
      return NextResponse.json(
        { error: 'Insufficient Funds' },
        { status: 400 }
      );
    }

    // Check if user already has active mining
    const existingMiningResult = await db.$queryRaw`
      SELECT id FROM umlab_user_mining WHERE "userId" = ${userId} AND status = 'active' LIMIT 1
    `;

    if ((existingMiningResult as any[]).length > 0) {
      return NextResponse.json(
        { error: 'You already have an active mining plan' },
        { status: 400 }
      );
    }

    // Get or create mining plan
    const planResult = await db.$queryRaw`
      SELECT id FROM umlab_mining_plans WHERE "dailyProfit" = ${profitRate} LIMIT 1
    `;

    let planId: string;
    const plans = planResult as any[];

    if (plans.length === 0) {
      // Create plan
      planId = randomUUID();
      await db.$queryRaw`
        INSERT INTO umlab_mining_plans (id, name, "dailyProfit", duration, "minInvest", "maxInvest", "isActive", "createdAt", "updatedAt")
        VALUES (${planId}, ${planName}, ${profitRate}, 30, ${minAmount}, 100000, true, NOW(), NOW())
      `;
    } else {
      planId = plans[0].id;
    }

    // Calculate dates
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const miningId = randomUUID();
    const transactionId = randomUUID();
    const notificationId = randomUUID();
    const newBalance = userBalance - investment;
    const dailyProfit = investment * (profitRate / 100);

    // Deduct balance
    await db.$queryRaw`
      UPDATE umlab_users SET balance = ${newBalance}, "updatedAt" = ${now} WHERE id = ${userId}
    `;

    // Create mining record
    await db.$queryRaw`
      INSERT INTO umlab_user_mining (id, "userId", "planId", investment, "dailyProfit", "totalEarned", status, "startedAt", "expiresAt", "lastUpdateAt", "createdAt", "updatedAt")
      VALUES (${miningId}, ${userId}, ${planId}, ${investment}, ${dailyProfit}, 0, 'active', ${now}, ${expiresAt}, ${now}, ${now}, ${now})
    `;

    // Create transaction
    await db.$queryRaw`
      INSERT INTO umlab_transactions (id, "userId", type, amount, status, description, "createdAt")
      VALUES (${transactionId}, ${userId}, 'plan_purchase', ${investment}, 'completed', ${planName + ' activated'}, ${now})
    `;

    // Create notification
    const walletShort = session.walletAddress.slice(0, 6) + '...' + session.walletAddress.slice(-4);
    const notificationMessage = `${walletShort} activated ${planName}`;
    
    await db.$queryRaw`
      INSERT INTO umlab_notifications (id, type, message, amount, "isRead", "createdAt")
      VALUES (${notificationId}, 'plan_activate', ${notificationMessage}, ${investment}, false, ${now})
    `;

    return NextResponse.json({
      success: true,
      mining: {
        id: miningId,
        planName,
        investment,
        dailyProfit,
        totalEarned: 0,
        status: 'active',
        startedAt: now,
        expiresAt,
        profitRate
      }
    });

  } catch (error) {
    console.error('Mining activation error:', error);
    return NextResponse.json(
      { error: 'Failed to activate mining plan', details: String(error) },
      { status: 500 }
    );
  }
}
