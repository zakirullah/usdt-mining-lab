import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const result = await db.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({ 
      status: 'connected',
      message: 'Database connection successful',
      result
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('Starting database setup...');

    // Create umlab_users table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS umlab_users (
        id TEXT PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "walletAddress" TEXT UNIQUE NOT NULL,
        "securityPin" TEXT NOT NULL,
        "referralCode" TEXT UNIQUE NOT NULL,
        "referredBy" TEXT,
        "deviceOs" TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        balance DOUBLE PRECISION NOT NULL DEFAULT 0,
        "totalProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "referralEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created umlab_users table');

    // Create umlab_sessions table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS umlab_sessions (
        id TEXT PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
        "userId" TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created umlab_sessions table');

    // Create umlab_admin_settings table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS umlab_admin_settings (
        id TEXT PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
        "siteName" TEXT NOT NULL DEFAULT 'Usdt Mining Lab',
        "depositWallet" TEXT NOT NULL DEFAULT '0x742d35Cc6634C0532925a3b844Bc9e7595f5aE31',
        "minDeposit" DOUBLE PRECISION NOT NULL DEFAULT 10,
        "minWithdraw" DOUBLE PRECISION NOT NULL DEFAULT 10,
        "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created umlab_admin_settings table');

    // Create umlab_mining_plans table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS umlab_mining_plans (
        id TEXT PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
        name TEXT NOT NULL DEFAULT 'Starter Mining Plan',
        "dailyProfit" DOUBLE PRECISION NOT NULL DEFAULT 4,
        duration INTEGER NOT NULL DEFAULT 30,
        "minInvest" DOUBLE PRECISION NOT NULL DEFAULT 10,
        "maxInvest" DOUBLE PRECISION NOT NULL DEFAULT 100000,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created umlab_mining_plans table');

    // Create umlab_user_mining table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS umlab_user_mining (
        id TEXT PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
        "userId" TEXT NOT NULL,
        "planId" TEXT NOT NULL,
        investment DOUBLE PRECISION NOT NULL,
        "dailyProfit" DOUBLE PRECISION NOT NULL,
        "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "lastUpdateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created umlab_user_mining table');

    // Create umlab_deposits table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS umlab_deposits (
        id TEXT PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
        "userId" TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        "txHash" TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        "approvedBy" TEXT,
        "approvedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created umlab_deposits table');

    // Create umlab_withdrawals table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS umlab_withdrawals (
        id TEXT PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
        "userId" TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        "walletAddress" TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        "approvedBy" TEXT,
        "approvedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created umlab_withdrawals table');

    // Create umlab_referrals table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS umlab_referrals (
        id TEXT PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
        "referrerId" TEXT NOT NULL,
        "referredId" TEXT NOT NULL,
        level INTEGER NOT NULL,
        commission DOUBLE PRECISION NOT NULL DEFAULT 0,
        "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created umlab_referrals table');

    // Create umlab_transactions table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS umlab_transactions (
        id TEXT PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
        "userId" TEXT NOT NULL,
        type TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        status TEXT NOT NULL DEFAULT 'completed',
        description TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created umlab_transactions table');

    // Create umlab_notifications table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS umlab_notifications (
        id TEXT PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
        "userId" TEXT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        amount DOUBLE PRECISION,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created umlab_notifications table');

    // Create indexes
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_sessions_userId_idx ON umlab_sessions("userId")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_sessions_token_idx ON umlab_sessions(token)`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_user_mining_userId_idx ON umlab_user_mining("userId")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_user_mining_status_idx ON umlab_user_mining(status)`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_deposits_userId_idx ON umlab_deposits("userId")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_deposits_status_idx ON umlab_deposits(status)`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_withdrawals_userId_idx ON umlab_withdrawals("userId")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_withdrawals_status_idx ON umlab_withdrawals(status)`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_referrals_referrerId_idx ON umlab_referrals("referrerId")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_referrals_referredId_idx ON umlab_referrals("referredId")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_transactions_userId_idx ON umlab_transactions("userId")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_transactions_type_idx ON umlab_transactions(type)`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS umlab_notifications_createdAt_idx ON umlab_notifications("createdAt")`);
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS umlab_referrals_referredId_level_key ON umlab_referrals("referredId", level)`);
    console.log('Created indexes');

    // Insert default admin settings
    await db.$executeRawUnsafe(`
      INSERT INTO umlab_admin_settings ("depositWallet") 
      SELECT '0x742d35Cc6634C0532925a3b844Bc9e7595f5aE31' 
      WHERE NOT EXISTS (SELECT 1 FROM umlab_admin_settings)
    `);

    // Insert default mining plan
    await db.$executeRawUnsafe(`
      INSERT INTO umlab_mining_plans ("dailyProfit", duration, "minInvest", "maxInvest") 
      SELECT 4, 30, 10, 100000
      WHERE NOT EXISTS (SELECT 1 FROM umlab_mining_plans)
    `);
    console.log('Inserted default data');

    return NextResponse.json({ 
      status: 'success',
      message: 'Database setup completed successfully!'
    });
  } catch (error) {
    console.error('Setup error:', error);
    
    return NextResponse.json({ 
      status: 'error',
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
