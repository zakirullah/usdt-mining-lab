import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get public admin settings (deposit wallet, min amounts)
export async function GET() {
  try {
    const adminSettings = await db.adminSettings.findFirst();

    if (!adminSettings) {
      return NextResponse.json({
        depositWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f8F44E',
        minDeposit: 10,
        minWithdraw: 10
      });
    }

    return NextResponse.json({
      depositWallet: adminSettings.depositWallet,
      minDeposit: adminSettings.minDeposit,
      minWithdraw: adminSettings.minWithdraw,
      siteName: adminSettings.siteName,
      maintenanceMode: adminSettings.maintenanceMode
    });
  } catch (error) {
    console.error('Admin settings error:', error);
    return NextResponse.json({
      depositWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f8F44E',
      minDeposit: 10,
      minWithdraw: 10
    });
  }
}

// PUT - Update admin settings (admin only)
export async function PUT(request: NextRequest) {
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
    const { depositWallet, minDeposit, minWithdraw, maintenanceMode, referralCommission } = body;

    const updatedSettings = await db.adminSettings.update({
      where: { id: 'admin-settings-1' },
      data: {
        ...(depositWallet && { depositWallet }),
        ...(minDeposit !== undefined && { minDeposit: parseFloat(minDeposit) }),
        ...(minWithdraw !== undefined && { minWithdraw: parseFloat(minWithdraw) }),
        ...(maintenanceMode !== undefined && { maintenanceMode }),
        ...(referralCommission !== undefined && { referralCommission: parseFloat(referralCommission) })
      }
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('Update admin settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
