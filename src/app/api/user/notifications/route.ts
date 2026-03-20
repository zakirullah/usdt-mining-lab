import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Get user-specific notifications (transactions)
    const userNotifications = await db.transaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get broadcast messages
    const broadcasts = await db.broadcastMessage.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get unread count
    const unreadCount = userNotifications.filter(n => n.status === 'pending').length;

    return NextResponse.json({
      notifications: userNotifications.map(t => ({
        id: t.id,
        type: t.type,
        message: t.description || `${t.type}: ${t.amount} USDT`,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt
      })),
      broadcasts: broadcasts.map(b => ({
        id: b.id,
        title: b.title,
        message: b.message,
        type: b.type,
        createdAt: b.createdAt
      })),
      unreadCount
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
