import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHash, randomBytes } from 'crypto';

// Hash password
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Generate session token
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (user.password !== hashPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Get active mining data
    const mining = await db.userMining.findFirst({
      where: {
        userId: user.id,
        status: 'active'
      },
      include: {
        plan: true
      }
    });

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        balance: user.balance,
        totalProfit: user.totalProfit,
        referralEarnings: user.referralEarnings,
        referralCode: user.referralCode,
        role: user.role
      },
      mining: mining ? {
        id: mining.id,
        investment: mining.investment,
        dailyProfit: mining.dailyProfit,
        totalEarned: mining.totalEarned,
        status: mining.status,
        startedAt: mining.startedAt,
        expiresAt: mining.expiresAt,
        lastUpdateAt: mining.lastUpdateAt
      } : null
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
