import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHash } from 'crypto';

// Hash PIN
function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

// Get user from session
async function getUserFromSession(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPin, newPin } = body;

    // Validate PINs
    if (!currentPin || !newPin) {
      return NextResponse.json(
        { error: 'Current PIN and new PIN are required' },
        { status: 400 }
      );
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return NextResponse.json(
        { error: 'New PIN must be 4 digits' },
        { status: 400 }
      );
    }

    // Verify current PIN
    const hashedCurrentPin = hashPin(currentPin);
    if (hashedCurrentPin !== user.securityPin) {
      return NextResponse.json(
        { error: 'Current PIN is incorrect' },
        { status: 400 }
      );
    }

    // Update PIN
    const hashedNewPin = hashPin(newPin);
    await db.user.update({
      where: { id: user.id },
      data: {
        securityPin: hashedNewPin,
        password: hashedNewPin // Also update password field for consistency
      }
    });

    return NextResponse.json({ success: true, message: 'PIN updated successfully' });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
