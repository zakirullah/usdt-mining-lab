import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's deposits
    const { data: deposits } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('user_wallet', user.wallet_address)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      deposits: deposits || []
    });
  } catch (error) {
    console.error('Get deposits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, txid, screenshotUrl } = body;

    // Validate input
    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json(
        { error: 'Please enter a valid amount' },
        { status: 400 }
      );
    }

    const depositAmount = parseFloat(amount);
    if (depositAmount < 10) {
      return NextResponse.json(
        { error: 'Minimum deposit is 10 USDT' },
        { status: 400 }
      );
    }

    if (!txid || txid.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid transaction hash' },
        { status: 400 }
      );
    }

    // Check for duplicate transaction hash
    const { data: existingDeposit } = await supabaseAdmin
      .from('deposits')
      .select('id')
      .eq('txid', txid)
      .single();

    if (existingDeposit) {
      return NextResponse.json(
        { error: 'This transaction hash has already been used' },
        { status: 400 }
      );
    }

    // Create deposit
    const { data: deposit, error } = await supabaseAdmin
      .from('deposits')
      .insert({
        id: crypto.randomUUID(),
        user_wallet: user.wallet_address,
        amount: depositAmount,
        txid: txid,
        screenshot_url: screenshotUrl || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Deposit error:', error);
      return NextResponse.json(
        { error: 'Failed to submit deposit. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Deposit submitted successfully! Awaiting admin approval.',
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        status: deposit.status,
        createdAt: deposit.created_at
      }
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
