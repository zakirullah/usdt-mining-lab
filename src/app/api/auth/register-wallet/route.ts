import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHash, randomBytes } from 'crypto';

// Hash PIN
function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

// Generate session token
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, pin, referralCode } = body;

    // Validate wallet address
    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Validate PIN - must be exactly 6 digits
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Normalize wallet address to lowercase
    const normalizedWallet = walletAddress.toLowerCase();

    // Check if wallet already registered
    const existingUser = await db.user.findUnique({
      where: { walletAddress: normalizedWallet }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Wallet address already registered' },
        { status: 400 }
      );
    }

    // Get referral user if code provided
    let referrerUser = null;
    if (referralCode) {
      referrerUser = await db.user.findUnique({
        where: { referralCode }
      });
      if (!referrerUser) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        );
      }
    }

    // Detect device OS
    const userAgent = request.headers.get('user-agent') || '';
    let deviceOs = 'Unknown';
    if (userAgent.includes('Windows')) deviceOs = 'Windows';
    else if (userAgent.includes('Mac')) deviceOs = 'MacOS';
    else if (userAgent.includes('Linux')) deviceOs = 'Linux';
    else if (userAgent.includes('Android')) deviceOs = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) deviceOs = 'iOS';

    // Generate email from wallet
    const generatedEmail = `${normalizedWallet.slice(2, 10)}@usdtmining.io`;

    // Create user
    const user = await db.user.create({
      data: {
        email: generatedEmail,
        password: hashPin(pin),
        walletAddress: normalizedWallet,
        securityPin: hashPin(pin),
        referralCode: randomBytes(4).toString('hex').toUpperCase(),
        referredBy: referrerUser?.referralCode || null,
        deviceOs
      }
    });

    // Create referral relationships with 7% commission
    if (referrerUser) {
      // Level 1 referral (direct) - 7%
      await db.referral.create({
        data: {
          referrerId: referrerUser.id,
          referredId: user.id,
          level: 1,
          commission: 7
        }
      });

      // Check for level 2 and 3 referrers
      if (referrerUser.referredBy) {
        const level2User = await db.user.findUnique({
          where: { referralCode: referrerUser.referredBy }
        });

        if (level2User) {
          await db.referral.create({
            data: {
              referrerId: level2User.id,
              referredId: user.id,
              level: 2,
              commission: 2
            }
          });

          // Level 3
          if (level2User.referredBy) {
            const level3User = await db.user.findUnique({
              where: { referralCode: level2User.referredBy }
            });

            if (level3User) {
              await db.referral.create({
                data: {
                  referrerId: level3User.id,
                  referredId: user.id,
                  level: 3,
                  commission: 1
                }
              });
            }
          }
        }
      }
    }

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

    // Create notification
    await db.notification.create({
      data: {
        type: 'register',
        message: `New miner just joined USDT Mining Lab`
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
      }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt
    });

    return response;
  } catch (error) {
    console.error('Wallet registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
