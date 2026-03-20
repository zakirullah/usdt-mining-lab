import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { token }
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // Get user notifications
    const notifications = await db.notification.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { userId: null } // Global notifications
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { token }
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (notificationId) {
      await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });
    } else {
      // Mark all as read
      await db.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
