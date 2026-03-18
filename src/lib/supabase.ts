import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client-side Supabase client (for browser) - lazy initialization
let supabaseInstance: ReturnType<typeof createClient> | null = null;
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
    if (!supabaseInstance) {
      return () => { throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'); };
    }
    return Reflect.get(supabaseInstance, prop);
  }
});

// Admin Supabase client (for server-side operations with elevated privileges)
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    if (!supabaseAdminInstance && supabaseUrl && supabaseServiceKey) {
      supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    if (!supabaseAdminInstance) {
      return () => { throw new Error('Supabase Admin not configured. Please set SUPABASE_SERVICE_ROLE_KEY'); };
    }
    return Reflect.get(supabaseAdminInstance, prop);
  }
});

// Database Types
export interface User {
  id: string;
  wallet_address: string;
  pin: string;
  balance: number;
  total_profit: number;
  total_invested: number;
  total_withdrawn: number;
  referral_code: string;
  referred_by?: string;
  referral_earnings: number;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface Deposit {
  id: string;
  user_wallet: string;
  amount: number;
  txid: string;
  screenshot_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  user_wallet: string;
  amount: number;
  wallet_address: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface MiningSession {
  id: string;
  user_wallet: string;
  plan_name: string;
  plan_type: 'starter' | 'pro';
  investment: number;
  daily_percent: number;
  daily_profit: number;
  profit_earned: number;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface BroadcastMessage {
  id: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

export interface PlatformSettings {
  id: string;
  deposit_wallet: string;
  min_deposit: number;
  min_withdraw: number;
  starter_daily_percent: number;
  pro_daily_percent: number;
  plan_duration_days: number;
  created_at: string;
  updated_at: string;
}

// Helper to generate unique IDs
export function generateId(): string {
  return crypto.randomUUID();
}

// Helper to generate referral code
export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
