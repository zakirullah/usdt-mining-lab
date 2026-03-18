import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, generateReferralCode } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, pin, referralCode } = body;

    // Validate input
    if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Please enter a valid BEP20 wallet address' },
        { status: 400 }
      );
    }

    if (!pin || pin.length !== 6) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'This wallet address is already registered' },
        { status: 400 }
      );
    }

    // Check referral code if provided
    let referrerWallet: string | null = null;
    if (referralCode) {
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('wallet_address')
        .eq('referral_code', referralCode.toUpperCase())
        .single();
      
      if (referrer) {
        referrerWallet = referrer.wallet_address;
      }
    }

    // Create user
    const userId = crypto.randomUUID();
    const newReferralCode = generateReferralCode();
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        wallet_address: walletAddress.toLowerCase(),
        pin: pin,
        balance: 0,
        total_profit: 0,
        total_invested: 0,
        total_withdrawn: 0,
        referral_code: newReferralCode,
        referred_by: referrerWallet,
        referral_earnings: 0,
        role: 'user',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    // Create session
    const sessionId = crypto.randomUUID();
    await supabaseAdmin
      .from('sessions')
      .insert({
        id: sessionId,
        user_id: userId,
        user_wallet: walletAddress.toLowerCase(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });

    // Return user data without sensitive info
    const responseData = {
      id: user.id,
      walletAddress: user.wallet_address,
      balance: user.balance,
      totalProfit: user.total_profit,
      totalInvested: user.total_invested,
      totalWithdrawn: user.total_withdrawn,
      referralCode: user.referral_code,
      referralEarnings: user.referral_earnings
    };

    return NextResponse.json({
      success: true,
      user: responseData,
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
