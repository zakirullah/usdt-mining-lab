# 🚀 USDT MINING LAB - COMPLETE CODE EXPORT

## 📁 PROJECT STRUCTURE

```
usdt-mining-lab/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── register-wallet/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── deposit/route.ts
│   │   │   ├── withdraw/route.ts
│   │   │   ├── stats/route.ts
│   │   │   ├── activities/route.ts
│   │   │   ├── telegram/config/route.ts
│   │   │   └── user/me/route.ts
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── db.ts
│   │   ├── telegram.ts
│   │   └── auth.ts
│   └── components/ui/
│       └── (shadcn components)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env
```

---

## 📄 1. PRISMA SCHEMA (prisma/schema.prisma)

```prisma
// Usdt Mining Lab - Prisma Schema for Supabase PostgreSQL
// Crypto Mining Platform Database

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}

// User model - stores all user information
model User {
  id            String   @id @default(cuid())
  email         String?  @unique
  password      String?
  walletAddress String   @unique
  securityPin   String
  referralCode  String   @unique
  referredBy    String?
  deviceOs      String?
  role          String   @default("user") // "user" or "admin"
  balance       Float    @default(0)
  depositBalance Float   @default(0)
  miningBalance Float    @default(0)
  totalProfit   Float    @default(0)
  totalWithdrawn Float   @default(0)
  totalInvested Float    @default(0)
  referralEarnings Float @default(0)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  deposits      Deposit[]
  withdrawals   Withdrawal[]
  miningPlans   UserMining[]
  referralsAsReferrer Referral[] @relation("ReferrerReferrals")
  referralsAsReferred  Referral[] @relation("ReferredReferrals")
  transactions  Transaction[]
  notifications Notification[]
  sessions      Session[]

  @@index([walletAddress])
  @@map("umlab_users")
}

// Admin settings model
model AdminSettings {
  id                  String   @id @default(cuid())
  siteName            String   @default("USDT Mining Lab")
  depositWallet       String   @default("0x33cb374635ab51fc669c1849b21b589a17475fc3")
  minDeposit          Float    @default(10)
  minWithdraw         Float    @default(10)
  maintenanceMode     Boolean  @default(false)
  telegramBotToken    String?
  telegramChatId      String?
  telegramPublicChatId String?
  telegramEnabled     Boolean  @default(false)
  updatedAt           DateTime @updatedAt

  @@map("umlab_admin_settings")
}

// Mining Plan model
model MiningPlan {
  id           String   @id @default(cuid())
  name         String   @default("Starter Mining Plan")
  dailyProfit  Float    @default(4)
  duration     Int      @default(30)
  minInvest    Float    @default(10)
  maxInvest    Float    @default(100000)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  userMining   UserMining[]

  @@map("umlab_mining_plans")
}

// User Mining - tracks user's active mining
model UserMining {
  id             String   @id @default(cuid())
  userId         String
  planId         String
  planType       String   @default("starter")
  planName       String   @default("Starter Plan")
  investment     Float
  dailyPercent   Float    @default(4)
  dailyProfit    Float
  profitPerSecond Float   @default(0)
  totalEarned    Float    @default(0)
  status         String   @default("active")
  startedAt      DateTime @default(now())
  expiresAt      DateTime
  lastUpdateAt   DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user           User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan           MiningPlan @relation(fields: [planId], references: [id])

  @@index([userId])
  @@index([status])
  @@map("umlab_user_mining")
}

// Deposit model
model Deposit {
  id              String   @id @default(cuid())
  userId          String
  amount          Float
  txHash          String
  screenshotUrl   String?
  status          String   @default("pending")
  approvedBy      String?
  approvedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@map("umlab_deposits")
}

// Withdrawal model
model Withdrawal {
  id              String   @id @default(cuid())
  userId          String
  amount          Float
  walletAddress   String
  status          String   @default("pending")
  approvedBy      String?
  approvedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@map("umlab_withdrawals")
}

// Referral model
model Referral {
  id              String   @id @default(cuid())
  referrerId      String
  referredId      String
  level           Int      @default(1)
  commission      Float    @default(0)
  commissionPercent Float  @default(7)
  miningSessionId String?
  earnedAt        DateTime @default(now())

  referrer        User @relation("ReferrerReferrals", fields: [referrerId], references: [id], onDelete: Cascade)
  referred        User @relation("ReferredReferrals", fields: [referredId], references: [id], onDelete: Cascade)

  @@unique([referredId, level])
  @@index([referrerId])
  @@index([referredId])
  @@map("umlab_referrals")
}

// Transaction model
model Transaction {
  id          String   @id @default(cuid())
  userId      String
  type        String
  amount      Float
  status      String   @default("completed")
  description String?
  createdAt   DateTime @default(now())

  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@map("umlab_transactions")
}

// Notification model
model Notification {
  id        String   @id @default(cuid())
  userId    String?
  type      String
  message   String
  amount    Float?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User?  @relation(fields: [userId], references: [id])

  @@index([createdAt])
  @@map("umlab_notifications")
}

// Session model
model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("umlab_sessions")
}

// Visitor Tracking model
model Visitor {
  id           String   @id @default(cuid())
  visitorId    String   @unique
  ipAddress    String?
  userAgent    String?
  page         String   @default("/")
  referrer     String?
  lastVisit    DateTime @default(now())
  visitCount   Int      @default(1)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([visitorId])
  @@index([lastVisit])
  @@index([createdAt])
  @@map("umlab_visitors")
}

// Daily Stats model
model DailyStat {
  id           String   @id @default(cuid())
  date         DateTime @unique
  visitors     Int      @default(0)
  pageViews    Int      @default(0)
  newUsers     Int      @default(0)
  deposits     Float    @default(0)
  withdrawals  Float    @default(0)
  profit       Float    @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([date])
  @@map("umlab_daily_stats")
}
```

---

## 📄 2. DATABASE CONFIG (src/lib/db.ts)

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Supabase PostgreSQL Database URL
const SUPABASE_DB_URL = 'postgresql://postgres.bvqtrchbvptorbanmxey:zakirullah%40123456789@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require'

const databaseUrl = process.env.DATABASE_URL || SUPABASE_DB_URL

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

## 📄 3. TELEGRAM SERVICE (src/lib/telegram.ts)

```typescript
// Telegram Notification Service for USDT Mining Lab
// Sends to TWO groups:
// 1. Private Group - Full details (wallet, amount, etc.)
// 2. Public Group - Secure info (hidden wallet)

interface TelegramMessage {
  type: 'deposit' | 'withdrawal' | 'register' | 'mining_started';
  data: {
    wallet?: string;
    amount?: number;
    status?: string;
    plan?: string;
    txHash?: string;
  };
}

// Send message to Telegram
async function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    );
    
    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Telegram send error:', error);
    return false;
  }
}

// Send notifications to both groups
export async function sendTelegramNotification(message: TelegramMessage): Promise<boolean> {
  try {
    const { db } = await import('./db');
    
    const settings = await db.adminSettings.findFirst();
    
    if (!settings?.telegramEnabled || !settings.telegramBotToken) {
      console.log('Telegram notifications not configured');
      return false;
    }
    
    const { telegramBotToken: botToken, telegramChatId: privateChatId, telegramPublicChatId: publicChatId } = settings;
    
    const emoji = {
      deposit: '💰',
      withdrawal: '💸',
      register: '👤',
      mining_started: '⚡'
    };
    
    const walletFull = message.data.wallet || 'Unknown';
    const walletHidden = message.data.wallet 
      ? `****${message.data.wallet.slice(-4)}`
      : 'Unknown';
    
    // ===== PRIVATE GROUP MESSAGE (Full Details) =====
    let privateText = '';
    switch (message.type) {
      case 'deposit':
        privateText = `
${emoji.deposit} <b>NEW DEPOSIT</b>

<b>Wallet:</b> <code>${walletFull}</code>
<b>Amount:</b> $${message.data.amount?.toFixed(2) || '0'} USDT
<b>Status:</b> ${message.data.status || 'Pending'}
${message.data.txHash ? `<b>TxHash:</b> <code>${message.data.txHash}</code>` : ''}

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
        
      case 'withdrawal':
        privateText = `
${emoji.withdrawal} <b>NEW WITHDRAWAL REQUEST</b>

<b>Wallet:</b> <code>${walletFull}</code>
<b>Amount:</b> $${message.data.amount?.toFixed(2) || '0'} USDT
<b>Status:</b> ${message.data.status || 'Pending'}

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
        
      case 'register':
        privateText = `
${emoji.register} <b>NEW USER REGISTERED</b>

<b>Wallet:</b> <code>${walletFull}</code>

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
        
      case 'mining_started':
        privateText = `
${emoji.mining_started} <b>MINING STARTED</b>

<b>Wallet:</b> <code>${walletFull}</code>
<b>Plan:</b> ${message.data.plan || 'Unknown'}
<b>Investment:</b> $${message.data.amount?.toFixed(2) || '0'} USDT

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
    }
    
    // ===== PUBLIC GROUP MESSAGE (Secure/Limited Info) =====
    let publicText = '';
    switch (message.type) {
      case 'deposit':
        publicText = `
${emoji.deposit} <b>NEW DEPOSIT</b>

<b>User:</b> <code>${walletHidden}</code>
<b>Amount:</b> $${message.data.amount?.toFixed(2) || '0'} USDT
<b>Status:</b> ✅ ${message.data.status || 'Pending'}

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
        
      case 'withdrawal':
        publicText = `
${emoji.withdrawal} <b>WITHDRAWAL REQUEST</b>

<b>User:</b> <code>${walletHidden}</code>
<b>Amount:</b> $${message.data.amount?.toFixed(2) || '0'} USDT

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
        
      case 'register':
        publicText = `
${emoji.register} <b>NEW MINER JOINED</b>

🎉 Welcome to USDT Mining Lab!

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
        
      case 'mining_started':
        publicText = `
${emoji.mining_started} <b>MINING ACTIVATED</b>

<b>Plan:</b> ${message.data.plan || 'Unknown'}
<b>Investment:</b> $${message.data.amount?.toFixed(2) || '0'} USDT

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
    }
    
    // Send to both groups
    let success = true;
    
    if (privateChatId) {
      const privateResult = await sendTelegramMessage(botToken, privateChatId, privateText);
      console.log('Private group:', privateResult ? '✅' : '❌');
      if (!privateResult) success = false;
    }
    
    if (publicChatId) {
      const publicResult = await sendTelegramMessage(botToken, publicChatId, publicText);
      console.log('Public group:', publicResult ? '✅' : '❌');
      if (!publicResult) success = false;
    }
    
    return success;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}

// Helper functions
export async function notifyNewDeposit(wallet: string, amount: number, txHash?: string, status: string = 'Pending') {
  return sendTelegramNotification({ type: 'deposit', data: { wallet, amount, txHash, status } });
}

export async function notifyNewWithdrawal(wallet: string, amount: number, status: string = 'Pending') {
  return sendTelegramNotification({ type: 'withdrawal', data: { wallet, amount, status } });
}

export async function notifyNewUser(wallet: string) {
  return sendTelegramNotification({ type: 'register', data: { wallet } });
}

export async function notifyMiningStarted(wallet: string, plan: string, amount: number) {
  return sendTelegramNotification({ type: 'mining_started', data: { wallet, plan, amount } });
}
```

---

## 📄 4. AUTH LIBRARY (src/lib/auth.ts)

```typescript
import { NextRequest } from 'next/server';
import { db } from './db';

export async function getAuthUser(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) return null;
    
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    });
    
    if (!session || new Date() > session.expiresAt) {
      return null;
    }
    
    return session.user;
  } catch {
    return null;
  }
}
```

---

## 📄 5. LOGIN API (src/app/api/auth/login/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { walletAddress, pin } = body;

    if (!walletAddress || !walletAddress.startsWith('0x')) {
      return NextResponse.json({ error: 'Wallet address must start with 0x' }, { status: 400 });
    }

    if (!pin || pin.length !== 6) {
      return NextResponse.json({ error: 'PIN must be exactly 6 digits' }, { status: 400 });
    }

    walletAddress = walletAddress.toLowerCase().trim();
    pin = pin.trim();

    const user = await db.user.findUnique({
      where: { walletAddress: walletAddress }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found with this wallet address' }, { status: 401 });
    }

    if (user.securityPin !== pin) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Your account has been suspended' }, { status: 403 });
    }

    // Create session
    const sessionId = crypto.randomUUID();
    await db.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: sessionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // Get active mining sessions
    const miningSessions = await db.userMining.findMany({
      where: { userId: user.id, status: 'active' }
    });

    const deposits = await db.deposit.findMany({
      where: { userId: user.id, status: 'approved' }
    });

    const withdrawals = await db.withdrawal.findMany({
      where: { userId: user.id, status: 'approved' }
    });

    const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        balance: user.balance,
        totalProfit: user.totalProfit,
        totalInvested: user.totalInvested,
        totalWithdrawn: user.totalWithdrawn,
        referralCode: user.referralCode,
        referralEarnings: user.referralEarnings,
        role: user.role
      },
      sessionId: sessionId,
      activeMiningSessions: miningSessions,
      stats: {
        totalDeposits,
        totalWithdrawals,
        depositCount: deposits.length,
        withdrawalCount: withdrawals.length,
        activeMiningCount: miningSessions.length
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 📄 6. REGISTER API (src/app/api/auth/register-wallet/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHash, randomBytes } from 'crypto';
import { notifyNewUser } from '@/lib/telegram';

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, pin, referralCode } = body;

    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 6 digits' }, { status: 400 });
    }

    const normalizedWallet = walletAddress.toLowerCase();

    const existingUser = await db.user.findUnique({
      where: { walletAddress: normalizedWallet }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Wallet address already registered' }, { status: 400 });
    }

    let referrerUser = null;
    if (referralCode) {
      referrerUser = await db.user.findUnique({ where: { referralCode } });
    }

    const generatedEmail = `${normalizedWallet.slice(2, 10)}@usdtmining.io`;

    const user = await db.user.create({
      data: {
        email: generatedEmail,
        password: hashPin(pin),
        walletAddress: normalizedWallet,
        securityPin: pin,
        referralCode: randomBytes(4).toString('hex').toUpperCase(),
        referredBy: referrerUser?.referralCode || null
      }
    });

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.session.create({
      data: { userId: user.id, token, expiresAt }
    });

    // Create notification
    await db.notification.create({
      data: { type: 'register', message: `New miner just joined USDT Mining Lab` }
    });

    // Send Telegram notification
    await notifyNewUser(user.walletAddress);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        balance: user.balance,
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
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 📄 7. DEPOSIT API (src/app/api/deposit/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { notifyNewDeposit } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, txHash } = body;

    if (!amount || !txHash) {
      return NextResponse.json({ error: 'Amount and transaction hash are required' }, { status: 400 });
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < 10) {
      return NextResponse.json({ error: 'Minimum deposit is 10 USDT' }, { status: 400 });
    }

    const existingDeposit = await db.deposit.findFirst({ where: { txHash } });
    if (existingDeposit) {
      return NextResponse.json({ error: 'This transaction hash has already been used' }, { status: 400 });
    }

    const deposit = await db.deposit.create({
      data: {
        userId: user.id,
        amount: depositAmount,
        txHash,
        status: 'pending'
      }
    });

    await db.notification.create({
      data: {
        type: 'deposit',
        message: `${user.walletAddress.slice(0, 8)}... just deposited ${depositAmount} USDT`,
        amount: depositAmount
      }
    });

    // Send Telegram notification
    await notifyNewDeposit(user.walletAddress, depositAmount, txHash, 'Pending');

    return NextResponse.json({
      success: true,
      message: 'Deposit submitted successfully! Awaiting admin approval.',
      data: { id: deposit.id, amount: deposit.amount, status: deposit.status }
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 📄 8. WITHDRAW API (src/app/api/withdraw/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHash } from 'crypto';
import { getAuthUser } from '@/lib/auth';
import { notifyNewWithdrawal } from '@/lib/telegram';

const WITHDRAWAL_FEE_PERCENT = 5;

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, walletAddress, pin } = body;

    if (!amount || !walletAddress || !pin) {
      return NextResponse.json({ error: 'Amount, wallet address, and PIN are required' }, { status: 400 });
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 10) {
      return NextResponse.json({ error: 'Minimum withdrawal is 10 USDT' }, { status: 400 });
    }

    // Calculate 5% fee
    const fee = withdrawAmount * (WITHDRAWAL_FEE_PERCENT / 100);
    const netAmount = withdrawAmount - fee;

    if (withdrawAmount > user.balance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      return NextResponse.json({ error: 'Invalid BEP20 wallet address' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 6 digits' }, { status: 400 });
    }

    // Verify PIN
    const hashedPin = hashPin(pin);
    if (user.securityPin !== hashedPin && user.securityPin !== pin) {
      return NextResponse.json({ error: 'Invalid security PIN' }, { status: 400 });
    }

    const withdrawal = await db.withdrawal.create({
      data: {
        userId: user.id,
        amount: netAmount,
        walletAddress,
        status: 'pending'
      }
    });

    await db.user.update({
      where: { id: user.id },
      data: { balance: { decrement: withdrawAmount } }
    });

    await db.transaction.create({
      data: {
        userId: user.id,
        type: 'withdrawal_request',
        amount: netAmount,
        status: 'pending',
        description: `Withdrawal | Fee: ${fee.toFixed(2)} USDT (5%)`
      }
    });

    await db.notification.create({
      data: {
        type: 'withdraw',
        message: `${user.walletAddress.slice(0, 8)}... withdrew ${netAmount.toFixed(2)} USDT`,
        amount: netAmount
      }
    });

    // Send Telegram notification
    await notifyNewWithdrawal(user.walletAddress, netAmount, 'Pending');

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted!',
      data: {
        id: withdrawal.id,
        requestedAmount: withdrawAmount,
        fee,
        netAmount,
        status: withdrawal.status
      }
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 📄 9. STATS API (src/app/api/stats/route.ts)

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const [
      totalUsers,
      depositsAggregate,
      withdrawalsAggregate,
      activeMiners,
      profitAggregate,
      activeSessions,
      newUsersToday,
      todayDepositsAggregate,
      todayWithdrawalsAggregate,
      todayVisitors,
      onlineVisitors
    ] = await Promise.all([
      db.user.count({ where: { role: 'user' } }),
      db.deposit.aggregate({ where: { status: 'approved' }, _sum: { amount: true } }),
      db.withdrawal.aggregate({ where: { status: 'approved' }, _sum: { amount: true } }),
      db.userMining.count({ where: { status: 'active' } }),
      db.userMining.aggregate({ _sum: { totalEarned: true } }),
      db.session.count({ where: { createdAt: { gte: fiveMinutesAgo } } }),
      db.user.count({ where: { createdAt: { gte: today } } }),
      db.deposit.aggregate({ where: { status: 'approved', createdAt: { gte: today } }, _sum: { amount: true } }),
      db.withdrawal.aggregate({ where: { status: 'approved', createdAt: { gte: today } }, _sum: { amount: true } }),
      db.dailyStat.findUnique({ where: { date: today } }).then(stat => stat?.visitors || 0).catch(() => 0),
      db.visitor.count({ where: { lastVisit: { gte: fiveMinutesAgo } } }).catch(() => 0)
    ]);
    
    const onlineUsers = Math.max(activeSessions + onlineVisitors, 1);
    
    return NextResponse.json({
      totalUsers,
      totalDeposits: depositsAggregate._sum.amount || 0,
      totalWithdrawals: withdrawalsAggregate._sum.amount || 0,
      activeMiners,
      totalProfitDistributed: profitAggregate._sum.totalEarned || 0,
      onlineUsers,
      newUsersToday,
      todayDeposits: todayDepositsAggregate._sum.amount || 0,
      todayWithdrawals: todayWithdrawalsAggregate._sum.amount || 0,
      todayProfit: 0,
      todayVisitors,
      isRealData: true,
      responseTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      totalUsers: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      activeMiners: 0,
      totalProfitDistributed: 0,
      onlineUsers: 1,
      newUsersToday: 0,
      todayDeposits: 0,
      todayWithdrawals: 0,
      todayProfit: 0,
      todayVisitors: 0,
      isRealData: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## 📄 10. ACTIVITIES API (src/app/api/activities/route.ts)

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [recentDeposits, recentWithdrawals, recentRegistrations] = await Promise.all([
      db.deposit.findMany({
        where: { createdAt: { gte: oneDayAgo } },
        include: { user: { select: { walletAddress: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      db.withdrawal.findMany({
        where: { createdAt: { gte: oneDayAgo } },
        include: { user: { select: { walletAddress: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      db.user.findMany({
        where: { createdAt: { gte: oneDayAgo } },
        select: { walletAddress: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const activities: Array<{
      type: string;
      message: string;
      amount?: number;
      walletAddress: string;
      createdAt: Date;
    }> = [];

    recentDeposits.forEach(deposit => {
      const walletShort = deposit.user.walletAddress.slice(0, 8) + '...' + deposit.user.walletAddress.slice(-4);
      activities.push({
        type: 'deposit',
        message: `${walletShort} just deposited ${deposit.amount} USDT`,
        amount: deposit.amount,
        walletAddress: deposit.user.walletAddress,
        createdAt: deposit.createdAt
      });
    });

    recentWithdrawals.forEach(withdrawal => {
      const walletShort = withdrawal.user.walletAddress.slice(0, 8) + '...' + withdrawal.user.walletAddress.slice(-4);
      activities.push({
        type: 'withdraw',
        message: `${walletShort} just withdrew ${withdrawal.amount} USDT`,
        amount: withdrawal.amount,
        walletAddress: withdrawal.user.walletAddress,
        createdAt: withdrawal.createdAt
      });
    });

    recentRegistrations.forEach(user => {
      const walletShort = user.walletAddress.slice(0, 8) + '...' + user.walletAddress.slice(-4);
      activities.push({
        type: 'register',
        message: `${walletShort} just joined Usdt Mining Lab`,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt
      });
    });

    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      activities: activities.slice(0, 20),
      hasRealData: activities.length > 0
    });
  } catch (error) {
    return NextResponse.json({ activities: [], hasRealData: false });
  }
}
```

---

## 📄 11. PACKAGE.JSON

```json
{
  "name": "usdt-mining-lab",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "db:push": "prisma db push",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/uuid": "^10.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^9.0.0",
    "postcss": "^8.0.0",
    "prisma": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 📄 12. ENVIRONMENT VARIABLES (.env.example)

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:pass@host:6543/db?sslmode=require"

# Telegram (Optional - stored in database)
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_PRIVATE_CHAT_ID="-100xxxxxxxxxx"
TELEGRAM_PUBLIC_CHAT_ID="-100xxxxxxxxxx"
```

---

## 🚀 DEPLOYMENT INFO

| Item | Value |
|------|-------|
| **GitHub** | https://github.com/zakirullah/usdt-mining-lab |
| **Railway** | https://usdt-mining-lab-production.up.railway.app |
| **Database** | Supabase PostgreSQL |
| **Telegram Bot** | @USDTMiningLabBot |

---

## 🔑 TELEGRAM CONFIG

| Group | Chat ID | Purpose |
|-------|---------|---------|
| Public Group | `-1003551540968` | Secure notifications |
| Private Channel | `-1003821953548` | Full details |
| Bot Token | `8705535597:AAFJ...` | API access |

---

**END OF CODE EXPORT** 🚀
