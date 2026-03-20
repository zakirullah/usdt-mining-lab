-- USDT Mining Lab - PostgreSQL Schema for Railway
-- Run this SQL in Railway PostgreSQL Query tab if Prisma migrations fail

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS umlab_users (
  id TEXT PRIMARY KEY DEFAULT 'user_' || replace(gen_random_uuid()::text, '-', ''),
  email TEXT UNIQUE,
  password TEXT,
  "walletAddress" TEXT UNIQUE NOT NULL,
  "securityPin" TEXT NOT NULL,
  "referralCode" TEXT UNIQUE NOT NULL,
  "referredBy" TEXT,
  "deviceOs" TEXT,
  role TEXT DEFAULT 'user',
  balance DOUBLE PRECISION DEFAULT 0,
  "depositBalance" DOUBLE PRECISION DEFAULT 0,
  "miningBalance" DOUBLE PRECISION DEFAULT 0,
  "totalProfit" DOUBLE PRECISION DEFAULT 0,
  "totalWithdrawn" DOUBLE PRECISION DEFAULT 0,
  "totalInvested" DOUBLE PRECISION DEFAULT 0,
  "referralEarnings" DOUBLE PRECISION DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Admin Settings table
CREATE TABLE IF NOT EXISTS umlab_admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'settings_' || replace(gen_random_uuid()::text, '-', ''),
  "siteName" TEXT DEFAULT 'USDT Mining Lab',
  "depositWallet" TEXT DEFAULT '0x33cb374635ab51fc669c1849b21b589a17475fc3',
  "minDeposit" DOUBLE PRECISION DEFAULT 10,
  "minWithdraw" DOUBLE PRECISION DEFAULT 10,
  "maintenanceMode" BOOLEAN DEFAULT false,
  "broadcastMessage" TEXT,
  "broadcastType" TEXT DEFAULT 'info',
  "broadcastActive" BOOLEAN DEFAULT false,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Mining Plans table
CREATE TABLE IF NOT EXISTS umlab_mining_plans (
  id TEXT PRIMARY KEY DEFAULT 'plan_' || replace(gen_random_uuid()::text, '-', ''),
  name TEXT DEFAULT 'Starter Mining Plan',
  "dailyProfit" DOUBLE PRECISION DEFAULT 4,
  duration INTEGER DEFAULT 30,
  "minInvest" DOUBLE PRECISION DEFAULT 10,
  "maxInvest" DOUBLE PRECISION DEFAULT 100000,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- User Mining Sessions table
CREATE TABLE IF NOT EXISTS umlab_user_mining (
  id TEXT PRIMARY KEY DEFAULT 'mining_' || replace(gen_random_uuid()::text, '-', ''),
  "userId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "planType" TEXT DEFAULT 'starter',
  "planName" TEXT DEFAULT 'Starter Plan',
  investment DOUBLE PRECISION NOT NULL,
  "dailyPercent" DOUBLE PRECISION DEFAULT 4,
  "dailyProfit" DOUBLE PRECISION NOT NULL,
  "profitPerSecond" DOUBLE PRECISION DEFAULT 0,
  "totalEarned" DOUBLE PRECISION DEFAULT 0,
  status TEXT DEFAULT 'active',
  "startedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "lastUpdateAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES umlab_users(id) ON DELETE CASCADE,
  FOREIGN KEY ("planId") REFERENCES umlab_mining_plans(id)
);

-- Deposits table
CREATE TABLE IF NOT EXISTS umlab_deposits (
  id TEXT PRIMARY KEY DEFAULT 'dep_' || replace(gen_random_uuid()::text, '-', ''),
  "userId" TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  "txHash" TEXT NOT NULL,
  "screenshotUrl" TEXT,
  status TEXT DEFAULT 'pending',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES umlab_users(id) ON DELETE CASCADE
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS umlab_withdrawals (
  id TEXT PRIMARY KEY DEFAULT 'wd_' || replace(gen_random_uuid()::text, '-', ''),
  "userId" TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  "walletAddress" TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES umlab_users(id) ON DELETE CASCADE
);

-- Referrals table
CREATE TABLE IF NOT EXISTS umlab_referrals (
  id TEXT PRIMARY KEY DEFAULT 'ref_' || replace(gen_random_uuid()::text, '-', ''),
  "referrerId" TEXT NOT NULL,
  "referredId" TEXT NOT NULL,
  commission DOUBLE PRECISION DEFAULT 0,
  "commissionPercent" DOUBLE PRECISION DEFAULT 7,
  "miningSessionId" TEXT,
  "earnedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("referrerId") REFERENCES umlab_users(id) ON DELETE CASCADE,
  FOREIGN KEY ("referredId") REFERENCES umlab_users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS umlab_transactions (
  id TEXT PRIMARY KEY DEFAULT 'tx_' || replace(gen_random_uuid()::text, '-', ''),
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'completed',
  description TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES umlab_users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS umlab_notifications (
  id TEXT PRIMARY KEY DEFAULT 'notif_' || replace(gen_random_uuid()::text, '-', ''),
  "userId" TEXT,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  amount DOUBLE PRECISION,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES umlab_users(id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS umlab_sessions (
  id TEXT PRIMARY KEY DEFAULT 'sess_' || replace(gen_random_uuid()::text, '-', ''),
  "userId" TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES umlab_users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet ON umlab_users("walletAddress");
CREATE INDEX IF NOT EXISTS idx_mining_user ON umlab_user_mining("userId");
CREATE INDEX IF NOT EXISTS idx_mining_status ON umlab_user_mining(status);
CREATE INDEX IF NOT EXISTS idx_deposits_user ON umlab_deposits("userId");
CREATE INDEX IF NOT EXISTS idx_deposits_status ON umlab_deposits(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON umlab_withdrawals("userId");
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON umlab_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON umlab_sessions(token);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON umlab_transactions("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_created ON umlab_notifications("createdAt");

-- Insert default data
INSERT INTO umlab_mining_plans (id, name, "dailyProfit", duration, "minInvest", "maxInvest", "isActive")
VALUES ('plan_default_001', 'Starter Mining Plan', 4, 30, 10, 100000, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO umlab_admin_settings (id, "siteName", "depositWallet", "minDeposit", "minWithdraw", "maintenanceMode")
VALUES ('settings_default_001', 'USDT Mining Lab', '0x33cb374635ab51fc669c1849b21b589a17475fc3', 10, 10, false)
ON CONFLICT (id) DO NOTHING;

-- Create admin user (CHANGE WALLET ADDRESS!)
-- INSERT INTO umlab_users (id, "walletAddress", "securityPin", "referralCode", role, "isActive")
-- VALUES ('admin_001', '0xYOUR_ADMIN_WALLET', '$2a$10$hashedpin', 'ADMIN001', 'admin', true);
