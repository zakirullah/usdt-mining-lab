import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all referrals where user is the referrer
    const referrals = await db.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referred: {
          select: {
            walletAddress: true,
            createdAt: true
          }
        }
      },
      orderBy: { earnedAt: 'desc' }
    });

    return NextResponse.json({ referrals });
  } catch (error) {
    console.error('Referrals fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
