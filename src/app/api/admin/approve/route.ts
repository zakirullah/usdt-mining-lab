import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch pending deposits and withdrawals for admin
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date() || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get pending deposits
    const pendingDeposits = await db.deposit.findMany({
      where: { status: 'pending' },
      include: { 
        user: { 
          select: { walletAddress: true, email: true } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get pending withdrawals
    const pendingWithdrawals = await db.withdrawal.findMany({
      where: { status: 'pending' },
      include: { 
        user: { 
          select: { walletAddress: true, email: true, balance: true } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get admin settings
    const adminSettings = await db.adminSettings.findFirst();

    return NextResponse.json({
      pendingDeposits,
      pendingWithdrawals,
      adminSettings
    });
  } catch (error) {
    console.error('Admin fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Approve or reject deposit/withdrawal
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date() || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { type, id, action, rejectionReason } = body; // type: 'deposit' | 'withdrawal', action: 'approve' | 'reject'

    if (!type || !id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'deposit') {
      const deposit = await db.deposit.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!deposit) {
        return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
      }

      if (deposit.status !== 'pending') {
        return NextResponse.json({ error: 'Deposit already processed' }, { status: 400 });
      }

      if (action === 'approve') {
        // Update deposit status
        await db.deposit.update({
          where: { id },
          data: {
            status: 'approved',
            approvedBy: session.userId,
            approvedAt: new Date()
          }
        });

        // Add amount to user balance
        await db.user.update({
          where: { id: deposit.userId },
          data: {
            balance: { increment: deposit.amount },
            totalDeposited: { increment: deposit.amount }
          }
        });

        // Update transaction status
        await db.transaction.updateMany({
          where: { userId: deposit.userId, type: 'deposit', status: 'pending' },
          data: { status: 'completed' }
        });

        // Update platform stats
        await db.platformStats.update({
          where: { id: 'platform-stats-1' },
          data: {
            totalDeposits: { increment: deposit.amount },
            todayDeposits: { increment: deposit.amount }
          }
        });

        // Create notification
        await db.notification.create({
          data: {
            type: 'deposit',
            message: `Your deposit of ${deposit.amount} USDT has been approved!`,
            amount: deposit.amount,
            userId: deposit.userId
          }
        });

        return NextResponse.json({ success: true, message: 'Deposit approved successfully' });

      } else if (action === 'reject') {
        // Update deposit status
        await db.deposit.update({
          where: { id },
          data: {
            status: 'rejected',
            approvedBy: session.userId,
            approvedAt: new Date(),
            rejectionReason: rejectionReason || 'Rejected by admin'
          }
        });

        // Update transaction status
        await db.transaction.updateMany({
          where: { userId: deposit.userId, type: 'deposit', status: 'pending' },
          data: { 
            status: 'rejected',
            description: `Deposit rejected: ${rejectionReason || 'Rejected by admin'}`
          }
        });

        return NextResponse.json({ success: true, message: 'Deposit rejected' });
      }

    } else if (type === 'withdrawal') {
      const withdrawal = await db.withdrawal.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!withdrawal) {
        return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
      }

      if (withdrawal.status !== 'pending') {
        return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 });
      }

      if (action === 'approve') {
        // Update withdrawal status
        await db.withdrawal.update({
          where: { id },
          data: {
            status: 'approved',
            approvedBy: session.userId,
            approvedAt: new Date()
          }
        });

        // Update user total withdrawn
        await db.user.update({
          where: { id: withdrawal.userId },
          data: {
            totalWithdrawn: { increment: withdrawal.amount }
          }
        });

        // Update transaction status
        await db.transaction.updateMany({
          where: { userId: withdrawal.userId, type: 'withdrawal', status: 'pending' },
          data: { status: 'completed' }
        });

        // Update platform stats
        await db.platformStats.update({
          where: { id: 'platform-stats-1' },
          data: {
            totalWithdrawals: { increment: withdrawal.amount },
            todayWithdrawals: { increment: withdrawal.amount }
          }
        });

        // Create notification
        await db.notification.create({
          data: {
            type: 'withdraw',
            message: `Your withdrawal of ${withdrawal.amount} USDT has been processed!`,
            amount: withdrawal.amount,
            userId: withdrawal.userId
          }
        });

        return NextResponse.json({ success: true, message: 'Withdrawal approved successfully' });

      } else if (action === 'reject') {
        // Update withdrawal status
        await db.withdrawal.update({
          where: { id },
          data: {
            status: 'rejected',
            approvedBy: session.userId,
            approvedAt: new Date(),
            rejectionReason: rejectionReason || 'Rejected by admin'
          }
        });

        // Refund the amount back to user balance
        await db.user.update({
          where: { id: withdrawal.userId },
          data: {
            balance: { increment: withdrawal.amount }
          }
        });

        // Update transaction status
        await db.transaction.updateMany({
          where: { userId: withdrawal.userId, type: 'withdrawal', status: 'pending' },
          data: { 
            status: 'rejected',
            description: `Withdrawal rejected: ${rejectionReason || 'Rejected by admin'}`
          }
        });

        return NextResponse.json({ success: true, message: 'Withdrawal rejected and amount refunded' });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
