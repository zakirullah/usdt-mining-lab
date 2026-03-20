import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's withdrawals
    const { data: withdrawals } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('user_wallet', user.wallet_address)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals || []
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
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
    const { amount, walletAddress, pin } = body;

    // Validate input
    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json(
        { error: 'Please enter a valid amount' },
        { status: 400 }
      );
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount < 10) {
      return NextResponse.json(
        { error: 'Minimum withdrawal is 10 USDT' },
        { status: 400 }
      );
    }

    if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Please enter a valid BEP20 wallet address' },
        { status: 400 }
      );
    }

    if (!pin || pin.length !== 6) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    // Verify PIN
    if (user.pin !== pin) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 400 }
      );
    }

    // Check balance
    if (user.balance < withdrawAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Deduct balance immediately (pending withdrawal)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ balance: user.balance - withdrawAmount })
      .eq('id', user.id);

    if (updateError) {
      console.error('Balance update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to process withdrawal' },
        { status: 500 }
      );
    }

    // Create withdrawal request
    const { data: withdrawal, error } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        id: crypto.randomUUID(),
        user_wallet: user.wallet_address,
        amount: withdrawAmount,
        wallet_address: walletAddress.toLowerCase(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      // Refund balance if withdrawal creation fails
      await supabaseAdmin
        .from('users')
        .update({ balance: user.balance })
        .eq('id', user.id);
      
      console.error('Withdrawal error:', error);
      return NextResponse.json(
        { error: 'Failed to submit withdrawal. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted! Awaiting admin approval.',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        status: withdrawal.status,
        createdAt: withdrawal.created_at
      }
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
