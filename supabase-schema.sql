-- USDT Mining Lab - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL,
  balance NUMERIC DEFAULT 0,
  total_profit NUMERIC DEFAULT 0,
  total_invested NUMERIC DEFAULT 0,
  total_withdrawn NUMERIC DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  referral_earnings NUMERIC DEFAULT 0,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_wallet TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  txid TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mining Sessions table
CREATE TABLE IF NOT EXISTS mining_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'pro')),
  investment NUMERIC NOT NULL,
  daily_percent NUMERIC NOT NULL,
  daily_profit NUMERIC NOT NULL,
  profit_earned NUMERIC DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deposit_wallet TEXT DEFAULT '0x33cb374635ab51fc669c1849b21b589a17475fc3',
  min_deposit NUMERIC DEFAULT 10,
  min_withdraw NUMERIC DEFAULT 10,
  starter_daily_percent NUMERIC DEFAULT 4,
  pro_daily_percent NUMERIC DEFAULT 4.5,
  plan_duration_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Broadcast Messages table
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_wallet ON deposits(user_wallet);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet ON withdrawals(user_wallet);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_mining_wallet ON mining_sessions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_mining_status ON mining_sessions(status);

-- Insert default platform settings
INSERT INTO platform_settings (deposit_wallet, min_deposit, min_withdraw)
VALUES ('0x33cb374635ab51fc669c1849b21b589a17475fc3', 10, 10)
ON CONFLICT DO NOTHING;

-- Create an admin user (change wallet address to your admin wallet)
-- INSERT INTO users (wallet_address, pin, role, referral_code)
-- VALUES ('0xYOUR_ADMIN_WALLET_ADDRESS', '123456', 'admin', 'ADMIN01');

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims')::json->>'wallet_address');

-- Deposits policies
CREATE POLICY "Users can read own deposits" ON deposits
  FOR SELECT USING (user_wallet = current_setting('request.jwt.claims')::json->>'wallet_address');

CREATE POLICY "Users can insert own deposits" ON deposits
  FOR INSERT WITH CHECK (user_wallet = current_setting('request.jwt.claims')::json->>'wallet_address');

-- Withdrawals policies
CREATE POLICY "Users can read own withdrawals" ON withdrawals
  FOR SELECT USING (user_wallet = current_setting('request.jwt.claims')::json->>'wallet_address');

CREATE POLICY "Users can insert own withdrawals" ON withdrawals
  FOR INSERT WITH CHECK (user_wallet = current_setting('request.jwt.claims')::json->>'wallet_address');

-- Mining sessions policies
CREATE POLICY "Users can read own mining" ON mining_sessions
  FOR SELECT USING (user_wallet = current_setting('request.jwt.claims')::json->>'wallet_address');

CREATE POLICY "Users can insert own mining" ON mining_sessions
  FOR INSERT WITH CHECK (user_wallet = current_setting('request.jwt.claims')::json->>'wallet_address');

-- Note: Service role key bypasses RLS, so admin operations work via server-side API
