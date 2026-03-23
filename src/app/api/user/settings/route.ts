import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHash } from 'crypto';
import { getAuthUser } from '@/lib/auth';

// Hash PIN
function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
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

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      return NextResponse.json(
        { error: 'New PIN must be 6 digits' },
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
