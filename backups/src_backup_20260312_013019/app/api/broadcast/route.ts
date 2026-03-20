import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get active broadcasts
export async function GET(request: NextRequest) {
  try {
    const broadcasts = await db.broadcastMessage.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return NextResponse.json({ broadcasts });
  } catch (error) {
    console.error('Get broadcasts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new broadcast (admin only)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, message, type } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const broadcast = await db.broadcastMessage.create({
      data: {
        title,
        message,
        type: type || 'info'
      }
    });

    // Create notification for all users
    const users = await db.user.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    // Create notifications in batches
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await db.notification.createMany({
        data: batch.map(u => ({
          userId: u.id,
          type: 'broadcast',
          message: `${title}: ${message}`
        }))
      });
    }

    return NextResponse.json({ success: true, broadcast });
  } catch (error) {
    console.error('Create broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete/Deactivate broadcast (admin only)
export async function DELETE(request: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Broadcast ID required' }, { status: 400 });
    }

    await db.broadcastMessage.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
