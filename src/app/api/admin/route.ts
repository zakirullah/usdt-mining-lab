import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get all admin data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Get mining sessions
    const miningSessions = await db.userMining.findMany({
      include: {
        user: {
          select: { walletAddress: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedSessions = miningSessions.map(session => ({
      id: session.id,
      user_wallet: session.user.walletAddress,
      planName: session.planName,
      planType: session.planType,
      investment: session.investment,
      dailyProfit: session.dailyProfit,
      profitEarned: session.totalEarned,
      status: session.status,
      endTime: session.expiresAt
    }));

    return NextResponse.json({
      miningSessions: formattedSessions
    });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle admin actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id, data } = body;

    switch (action) {
      case 'approveDeposit':
        return await handleApproveDeposit(id);
      
      case 'rejectDeposit':
        return await handleRejectDeposit(id);
      
      case 'approveWithdrawal':
        return await handleApproveWithdrawal(id);
      
      case 'rejectWithdrawal':
        return await handleRejectWithdrawal(id);
      
      case 'toggleUser':
        return await handleToggleUser(id);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Approve deposit
async function handleApproveDeposit(depositId: string) {
  const deposit = await db.deposit.findUnique({
    where: { id: depositId },
    include: { user: true }
  });

  if (!deposit || deposit.status !== 'pending') {
    return NextResponse.json(
      { error: 'Deposit not found or already processed' },
      { status: 400 }
    );
  }

  // Get or create mining plan
  let plan = await db.miningPlan.findFirst();
  if (!plan) {
    plan = await db.miningPlan.create({
      data: {
        name: 'Starter Mining Plan',
        dailyProfit: 4,
        duration: 30,
        minInvest: 10,
        maxInvest: 100000
      }
    });
  }

  // Start mining for the user
  const dailyProfit = deposit.amount * (plan.dailyProfit / 100);
  const profitPerSecond = dailyProfit / 86400;
  const expiresAt = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);

  await db.$transaction([
    // Update deposit status
    db.deposit.update({
      where: { id: depositId },
      data: {
        status: 'approved',
        approvedBy: 'admin',
        approvedAt: new Date()
      }
    }),
    // Create mining session
    db.userMining.create({
      data: {
        userId: deposit.userId,
        planId: plan.id,
        planType: deposit.amount >= 100 ? 'pro' : 'starter',
        planName: deposit.amount >= 100 ? 'Pro Plan' : 'Starter Plan',
        investment: deposit.amount,
        dailyPercent: deposit.amount >= 100 ? 4.5 : 4,
        dailyProfit,
        profitPerSecond,
        expiresAt,
        status: 'active'
      }
    }),
    // Update user invested amount
    db.user.update({
      where: { id: deposit.userId },
      data: {
        totalInvested: { increment: deposit.amount }
      }
    }),
    // Create transaction record
    db.transaction.create({
      data: {
        userId: deposit.userId,
        type: 'deposit',
        amount: deposit.amount,
        description: 'Deposit approved - Mining started'
      }
    })
  ]);

  return NextResponse.json({ success: true, message: 'Deposit approved and mining started!' });
}

// Reject deposit
async function handleRejectDeposit(depositId: string) {
  const deposit = await db.deposit.findUnique({
    where: { id: depositId }
  });

  if (!deposit || deposit.status !== 'pending') {
    return NextResponse.json(
      { error: 'Deposit not found or already processed' },
      { status: 400 }
    );
  }

  await db.deposit.update({
    where: { id: depositId },
    data: { status: 'rejected' }
  });

  return NextResponse.json({ success: true, message: 'Deposit rejected' });
}

// Approve withdrawal
async function handleApproveWithdrawal(withdrawalId: string) {
  const withdrawal = await db.withdrawal.findUnique({
    where: { id: withdrawalId }
  });

  if (!withdrawal || withdrawal.status !== 'pending') {
    return NextResponse.json(
      { error: 'Withdrawal not found or already processed' },
      { status: 400 }
    );
  }

  await db.$transaction([
    db.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'approved',
        approvedBy: 'admin',
        approvedAt: new Date()
      }
    }),
    db.user.update({
      where: { id: withdrawal.userId },
      data: {
        totalWithdrawn: { increment: withdrawal.amount }
      }
    }),
    db.transaction.create({
      data: {
        userId: withdrawal.userId,
        type: 'withdrawal',
        amount: withdrawal.amount,
        description: 'Withdrawal approved'
      }
    })
  ]);

  return NextResponse.json({ success: true, message: 'Withdrawal approved' });
}

// Reject withdrawal
async function handleRejectWithdrawal(withdrawalId: string) {
  const withdrawal = await db.withdrawal.findUnique({
    where: { id: withdrawalId }
  });

  if (!withdrawal || withdrawal.status !== 'pending') {
    return NextResponse.json(
      { error: 'Withdrawal not found or already processed' },
      { status: 400 }
    );
  }

  // Refund balance
  await db.$transaction([
    db.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: 'rejected' }
    }),
    db.user.update({
      where: { id: withdrawal.userId },
      data: { balance: { increment: withdrawal.amount } }
    })
  ]);

  return NextResponse.json({ success: true, message: 'Withdrawal rejected and balance refunded' });
}

// Toggle user status
async function handleToggleUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  await db.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive }
  });

  return NextResponse.json({ success: true, message: `User ${!user.isActive ? 'activated' : 'suspended'}` });
}
