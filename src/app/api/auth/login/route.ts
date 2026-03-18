import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Force recompile - v2
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { walletAddress, pin } = body;

    console.log('Login attempt:', { walletAddress, pin, walletLength: walletAddress?.length, pinLength: pin?.length });

    // Validate input
    if (!walletAddress || !walletAddress.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Wallet address must start with 0x' },
        { status: 400 }
      );
    }

    if (!pin || pin.length !== 6) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Normalize wallet address
    walletAddress = walletAddress.toLowerCase().trim();
    pin = pin.trim();

    // Find user directly
    const user = await db.user.findUnique({
      where: { walletAddress: walletAddress }
    });

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User PIN:', user.securityPin, '| Entered PIN:', pin, '| Match:', user.securityPin === pin);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found with this wallet address' },
        { status: 401 }
      );
    }

    if (user.securityPin !== pin) {
      return NextResponse.json(
        { error: 'Incorrect PIN' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Create session
    const sessionId = crypto.randomUUID();
    await db.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: sessionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // Get active mining sessions
    const miningSessions = await db.userMining.findMany({
      where: { 
        userId: user.id,
        status: 'active'
      }
    });

    // Calculate real-time profit earned for each session
    const now = new Date();
    const sessionsWithProfit = miningSessions.map((session) => {
      const startTime = new Date(session.startedAt);
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const profitPerSecond = session.dailyProfit / 86400;
      const realTimeProfit = session.totalEarned + (elapsedSeconds * profitPerSecond);
      
      return {
        id: session.id,
        planType: session.planType,
        planName: session.planName,
        investment: session.investment,
        dailyPercent: session.dailyPercent,
        dailyProfit: session.dailyProfit,
        profitPerSecond: profitPerSecond,
        totalEarned: realTimeProfit,
        status: session.status,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt
      };
    });

    // Get stats
    const deposits = await db.deposit.findMany({
      where: { 
        userId: user.id,
        status: 'approved'
      }
    });

    const withdrawals = await db.withdrawal.findMany({
      where: { 
        userId: user.id,
        status: 'approved'
      }
    });

    const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const activeMiningCount = sessionsWithProfit.length;
    const totalProfitPerSecond = sessionsWithProfit.reduce((sum, s) => sum + s.profitPerSecond, 0);

    // Return user data
    const responseData = {
      id: user.id,
      walletAddress: user.walletAddress,
      balance: user.balance,
      totalProfit: user.totalProfit,
      totalInvested: user.totalInvested,
      totalWithdrawn: user.totalWithdrawn,
      referralCode: user.referralCode,
      referralEarnings: user.referralEarnings,
      role: user.role
    };

    console.log('Login successful for:', user.walletAddress, '| Role:', user.role);

    return NextResponse.json({
      success: true,
      user: responseData,
      sessionId: sessionId,
      activeMiningSessions: sessionsWithProfit,
      stats: {
        totalDeposits,
        totalWithdrawals,
        depositCount: deposits.length,
        withdrawalCount: withdrawals.length,
        referralCount: 0,
        activeMiningCount,
        totalProfitPerSecond
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
