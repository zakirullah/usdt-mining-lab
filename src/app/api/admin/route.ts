import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Middleware to check admin access
async function checkAdmin(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date() || session.user.role !== 'admin') {
    return null;
  }

  return session;
}

// GET - Fetch admin data
export async function GET(request: NextRequest) {
  try {
    const session = await checkAdmin(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Get pending deposits
    if (type === 'pending-deposits') {
      const deposits = await db.deposit.findMany({
        where: { status: 'pending' },
        include: {
          user: {
            select: { 
              id: true,
              email: true, 
              walletAddress: true 
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, data: deposits });
    }

    // Get pending withdrawals
    if (type === 'pending-withdrawals') {
      const withdrawals = await db.withdrawal.findMany({
        where: { status: 'pending' },
        include: {
          user: {
            select: { 
              id: true,
              email: true, 
              walletAddress: true 
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, data: withdrawals });
    }

    // Get dashboard stats
    if (type === 'stats') {
      const totalUsers = await db.user.count();
      const totalDeposits = await db.deposit.aggregate({
        where: { status: 'approved' },
        _sum: { amount: true }
      });
      const totalWithdrawals = await db.withdrawal.aggregate({
        where: { status: 'approved' },
        _sum: { amount: true }
      });
      const pendingDeposits = await db.deposit.count({
        where: { status: 'pending' }
      });
      const pendingWithdrawals = await db.withdrawal.count({
        where: { status: 'pending' }
      });
      const activeMiners = await db.userMining.count({
        where: { status: 'active' }
      });

      return NextResponse.json({
        success: true,
        data: {
          stats: {
            totalUsers,
            totalDeposits: totalDeposits._sum.amount || 0,
            totalWithdrawals: totalWithdrawals._sum.amount || 0,
            pendingDeposits,
            pendingWithdrawals,
            activeMiners
          }
        }
      });
    }

    // Get all users
    if (type === 'users') {
      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          walletAddress: true,
          balance: true,
          totalProfit: true,
          referralEarnings: true,
          referralCode: true,
          role: true,
          isActive: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, data: users });
    }

    // Get all deposits
    if (type === 'deposits') {
      const deposits = await db.deposit.findMany({
        include: {
          user: {
            select: { id: true, email: true, walletAddress: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, data: deposits });
    }

    // Get all withdrawals
    if (type === 'withdrawals') {
      const withdrawals = await db.withdrawal.findMany({
        include: {
          user: {
            select: { id: true, email: true, walletAddress: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, data: withdrawals });
    }

    // Get settings
    if (type === 'settings') {
      const settings = await db.adminSettings.findFirst();
      return NextResponse.json({ success: true, data: settings });
    }

    return NextResponse.json({ success: false, error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Handle admin actions
export async function POST(request: NextRequest) {
  try {
    const session = await checkAdmin(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, id, userId, data } = body;

    switch (action) {
      case 'approveDeposit':
        return await handleApproveDeposit(id, session.user.id);
      
      case 'rejectDeposit':
        return await handleRejectDeposit(id);
      
      case 'approveWithdrawal':
        return await handleApproveWithdrawal(id, session.user.id);
      
      case 'rejectWithdrawal':
        return await handleRejectWithdrawal(id);
      
      case 'updateSettings':
        return await handleUpdateSettings(data);
      
      case 'toggleUser':
        return await handleToggleUser(userId);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Approve deposit
async function handleApproveDeposit(depositId: string, adminId: string) {
  const deposit = await db.deposit.findUnique({
    where: { id: depositId },
    include: { user: true }
  });

  if (!deposit || deposit.status !== 'pending') {
    return NextResponse.json(
      { success: false, error: 'Deposit not found or already processed' },
      { status: 400 }
    );
  }

  // Update deposit status and add balance to user
  await db.$transaction([
    db.deposit.update({
      where: { id: depositId },
      data: {
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date()
      }
    }),
    db.user.update({
      where: { id: deposit.userId },
      data: { balance: { increment: deposit.amount } }
    }),
    db.transaction.create({
      data: {
        userId: deposit.userId,
        type: 'deposit',
        amount: deposit.amount,
        status: 'completed',
        description: 'Deposit approved'
      }
    })
  ]);

  // Handle referral commissions
  await handleReferralCommissions(deposit.userId, deposit.amount);

  return NextResponse.json({ 
    success: true, 
    message: 'Deposit approved successfully' 
  });
}

// Reject deposit
async function handleRejectDeposit(depositId: string) {
  const deposit = await db.deposit.findUnique({
    where: { id: depositId }
  });

  if (!deposit || deposit.status !== 'pending') {
    return NextResponse.json(
      { success: false, error: 'Deposit not found or already processed' },
      { status: 400 }
    );
  }

  await db.deposit.update({
    where: { id: depositId },
    data: { status: 'rejected' }
  });

  return NextResponse.json({ 
    success: true, 
    message: 'Deposit rejected' 
  });
}

// Approve withdrawal
async function handleApproveWithdrawal(withdrawalId: string, adminId: string) {
  const withdrawal = await db.withdrawal.findUnique({
    where: { id: withdrawalId }
  });

  if (!withdrawal || withdrawal.status !== 'pending') {
    return NextResponse.json(
      { success: false, error: 'Withdrawal not found or already processed' },
      { status: 400 }
    );
  }

  await db.$transaction([
    db.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date()
      }
    }),
    db.transaction.create({
      data: {
        userId: withdrawal.userId,
        type: 'withdrawal',
        amount: withdrawal.amount,
        status: 'completed',
        description: 'Withdrawal approved'
      }
    })
  ]);

  return NextResponse.json({ 
    success: true, 
    message: 'Withdrawal approved successfully' 
  });
}

// Reject withdrawal
async function handleRejectWithdrawal(withdrawalId: string) {
  const withdrawal = await db.withdrawal.findUnique({
    where: { id: withdrawalId }
  });

  if (!withdrawal || withdrawal.status !== 'pending') {
    return NextResponse.json(
      { success: false, error: 'Withdrawal not found or already processed' },
      { status: 400 }
    );
  }

  // Refund balance to user
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

  return NextResponse.json({ 
    success: true, 
    message: 'Withdrawal rejected and balance refunded' 
  });
}

// Update settings
async function handleUpdateSettings(data: {
  siteName?: string;
  depositWallet?: string;
  minDeposit?: number;
  minWithdraw?: number;
  maintenanceMode?: boolean;
}) {
  let settings = await db.adminSettings.findFirst();

  if (!settings) {
    settings = await db.adminSettings.create({
      data: {
        siteName: data.siteName || 'USDT Mining Lab',
        depositWallet: data.depositWallet || '',
        minDeposit: data.minDeposit || 10,
        minWithdraw: data.minWithdraw || 10,
        maintenanceMode: data.maintenanceMode || false
      }
    });
  } else {
    settings = await db.adminSettings.update({
      where: { id: settings.id },
      data
    });
  }

  return NextResponse.json({ success: true, data: settings });
}

// Toggle user status
async function handleToggleUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  await db.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive }
  });

  return NextResponse.json({ 
    success: true, 
    message: `User ${!user.isActive ? 'activated' : 'deactivated'}` 
  });
}

// Handle referral commissions (3-level: 5%, 2%, 1% = total 8%)
async function handleReferralCommissions(userId: string, amount: number) {
  const commissions = [0.05, 0.02, 0.01]; // 5%, 2%, 1%

  for (let level = 1; level <= 3; level++) {
    const referral = await db.referral.findFirst({
      where: { referredId: userId, level }
    });

    if (referral) {
      const commission = amount * commissions[level - 1];
      
      await db.$transaction([
        db.user.update({
          where: { id: referral.referrerId },
          data: {
            balance: { increment: commission },
            referralEarnings: { increment: commission }
          }
        }),
        db.referral.update({
          where: { id: referral.id },
          data: { commission: { increment: commission } }
        }),
        db.transaction.create({
          data: {
            userId: referral.referrerId,
            type: 'referral_bonus',
            amount: commission,
            status: 'completed',
            description: `Level ${level} referral bonus from deposit`
          }
        })
      ]);
    }
  }
}
