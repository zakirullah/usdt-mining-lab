import { NextRequest } from 'next/server';
import { supabaseAdmin, User } from './supabase';

export async function getAuthUser(request: NextRequest): Promise<User | null> {
  try {
    // Get session ID from header or cookie
    const sessionId = request.headers.get('x-session-id') || 
                     request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return null;
    }

    // Get session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('user_id, user_wallet, expires_at')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return null;
    }

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      await supabaseAdmin.from('sessions').delete().eq('id', sessionId);
      return null;
    }

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single();

    if (userError || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function getAuthUserFromWallet(walletAddress: string): Promise<User | null> {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    return user;
  } catch {
    return null;
  }
}
