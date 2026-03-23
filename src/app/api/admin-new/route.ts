import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-supabase';

// Check if user is admin
async function checkAdmin(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Get pending deposits
    if (type === 'deposits') {
      const { data: deposits } = await supabaseAdmin
        .from('deposits')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      return NextResponse.json({ deposits: deposits || [] });
    }

    // Get pending withdrawals
    if (type === 'withdrawals') {
      const { data: withdrawals } = await supabaseAdmin
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      return NextResponse.json({ withdrawals: withdrawals || [] });
    }

    // Get all users
    if (type === 'users') {
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, wallet_address, balance, total_profit, total_invested, total_withdrawn, referral_earnings, role, is_active, created_at')
        .order('created_at', { ascending: false });
      
      return NextResponse.json({ users: users || [] });
    }

    // Get all mining sessions
    if (type === 'mining') {
      const { data: sessions } = await supabaseAdmin
        .from('mining_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      return NextResponse.json({ sessions: sessions || [] });
    }

    // Get dashboard stats
    if (type === 'stats') {
      const { count: totalUsers } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { data: depositsSum } = await supabaseAdmin
        .from('deposits')
        .select('amount')
        .eq('status', 'approved');

      const { data: withdrawalsSum } = await supabaseAdmin
        .from('withdrawals')
        .select('amount')
        .eq('status', 'approved');

      const { count: pendingDeposits } = await supabaseAdmin
        .from('deposits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: pendingWithdrawals } = await supabaseAdmin
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: activeMining } = await supabaseAdmin
        .from('mining_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return NextResponse.json({
        stats: {
          totalUsers: totalUsers || 0,
          totalDeposits: (depositsSum || []).reduce((sum: number, d: { amount: number }) => sum + d.amount, 0),
          totalWithdrawals: (withdrawalsSum || []).reduce((sum: number, w: { amount: number }) => sum + w.amount, 0),
          pendingDeposits: pendingDeposits || 0,
          pendingWithdrawals: pendingWithdrawals || 0,
          activeMining: activeMining || 0
        }
      });
    }

    // Get platform settings
    if (type === 'settings') {
      const { data: settings } = await supabaseAdmin
        .from('platform_settings')
        .select('*')
        .single();
      
      return NextResponse.json({ settings });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, data } = body;

    // Approve deposit
    if (action === 'approveDeposit') {
      // Get deposit
      const { data: deposit, error: fetchError } = await supabaseAdmin
        .from('deposits')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !deposit) {
        return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
      }

      if (deposit.status !== 'pending') {
        return NextResponse.json({ error: 'Deposit already processed' }, { status: 400 });
      }

      // Get user
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wallet_address', deposit.user_wallet)
        .single();

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Update deposit and user balance
      await supabaseAdmin
        .from('deposits')
        .update({
          status: 'approved',
          approved_by: admin.wallet_address,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      await supabaseAdmin
        .from('users')
        .update({
          balance: user.balance + deposit.amount
        })
        .eq('id', user.id);

      return NextResponse.json({ success: true, message: 'Deposit approved' });
    }

    // Reject deposit
    if (action === 'rejectDeposit') {
      await supabaseAdmin
        .from('deposits')
        .update({ status: 'rejected' })
        .eq('id', id);

      return NextResponse.json({ success: true, message: 'Deposit rejected' });
    }

    // Approve withdrawal
    if (action === 'approveWithdrawal') {
      const { data: withdrawal } = await supabaseAdmin
        .from('withdrawals')
        .select('*')
        .eq('id', id)
        .single();

      if (!withdrawal || withdrawal.status !== 'pending') {
        return NextResponse.json({ error: 'Withdrawal not found or already processed' }, { status: 400 });
      }

      await supabaseAdmin
        .from('withdrawals')
        .update({
          status: 'approved',
          approved_by: admin.wallet_address,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      return NextResponse.json({ success: true, message: 'Withdrawal approved' });
    }

    // Reject withdrawal
    if (action === 'rejectWithdrawal') {
      const { data: withdrawal } = await supabaseAdmin
        .from('withdrawals')
        .select('*')
        .eq('id', id)
        .single();

      if (!withdrawal) {
        return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
      }

      // Get user and refund balance
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wallet_address', withdrawal.user_wallet)
        .single();

      if (user) {
        await supabaseAdmin
          .from('users')
          .update({ balance: user.balance + withdrawal.amount })
          .eq('id', user.id);
      }

      await supabaseAdmin
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', id);

      return NextResponse.json({ success: true, message: 'Withdrawal rejected and balance refunded' });
    }

    // Update settings
    if (action === 'updateSettings') {
      const { depositWallet, minDeposit, minWithdraw } = data;

      const { data: existing } = await supabaseAdmin
        .from('platform_settings')
        .select('id')
        .single();

      if (existing) {
        await supabaseAdmin
          .from('platform_settings')
          .update({
            deposit_wallet: depositWallet,
            min_deposit: minDeposit,
            min_withdraw: minWithdraw,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabaseAdmin
          .from('platform_settings')
          .insert({
            id: crypto.randomUUID(),
            deposit_wallet: depositWallet,
            min_deposit: minDeposit,
            min_withdraw: minWithdraw
          });
      }

      return NextResponse.json({ success: true, message: 'Settings updated' });
    }

    // Toggle user status
    if (action === 'toggleUser') {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('is_active')
        .eq('id', id)
        .single();

      if (!userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      await supabaseAdmin
        .from('users')
        .update({ is_active: !userData.is_active })
        .eq('id', id);

      return NextResponse.json({ success: true });
    }

    // Update user balance
    if (action === 'updateBalance') {
      const { amount, operation } = data; // operation: 'add' or 'subtract'

      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('balance')
        .eq('id', id)
        .single();

      if (!userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const newBalance = operation === 'add' 
        ? userData.balance + amount 
        : userData.balance - amount;

      await supabaseAdmin
        .from('users')
        .update({ balance: Math.max(0, newBalance) })
        .eq('id', id);

      return NextResponse.json({ success: true });
    }

    // Broadcast message
    if (action === 'broadcast') {
      const { message } = data;

      // Deactivate old messages
      await supabaseAdmin
        .from('broadcast_messages')
        .update({ is_active: false })
        .eq('is_active', true);

      // Create new message
      await supabaseAdmin
        .from('broadcast_messages')
        .insert({
          id: crypto.randomUUID(),
          message,
          is_active: true
        });

      return NextResponse.json({ success: true, message: 'Broadcast sent' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
