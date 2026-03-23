import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
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
