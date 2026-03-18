# USDT Mining Lab - Supabase Deployment Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note down your project URL and keys from Settings > API

## Step 2: Run SQL Schema

1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Click Run to create all tables

## Step 3: Create Admin User

In Supabase SQL Editor, run:

```sql
-- Replace with your admin wallet address
INSERT INTO users (wallet_address, pin, role, referral_code, balance, total_profit, total_invested, total_withdrawn, referral_earnings, is_active)
VALUES ('0xYOUR_ADMIN_WALLET_ADDRESS', '123456', 'admin', 'ADMIN01', 0, 0, 0, 0, 0, true);
```

## Step 4: Configure Environment Variables

Create `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 5: Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Features

### User Features:
- Register with BEP20 wallet address + 6-digit PIN
- Deposit USDT (manual approval)
- Buy mining plans (Starter 4% / Pro 4.5% daily)
- Real-time profit tracking
- Withdrawal requests (manual approval)
- Referral system

### Admin Features:
- Access at `/admin` route
- Approve/Reject deposits
- Approve/Reject withdrawals
- View all users
- View mining sessions
- Platform settings
- Broadcast messages

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/logout` | POST | Logout user |
| `/api/user-new` | GET | Get user dashboard data |
| `/api/deposit-new` | GET/POST | Get/Create deposits |
| `/api/withdrawal-new` | GET/POST | Get/Create withdrawals |
| `/api/mining-new/start` | POST | Start mining session |
| `/api/mining-new/update` | POST | Update mining profits |
| `/api/admin-new` | GET/POST | Admin operations |
| `/api/settings-new` | GET | Get platform settings |

## Database Tables

- `users` - User accounts
- `sessions` - Auth sessions
- `deposits` - Deposit requests
- `withdrawals` - Withdrawal requests
- `mining_sessions` - Active mining
- `platform_settings` - Config
- `broadcast_messages` - Admin messages

## Important Notes

1. The deposit wallet address can be changed in Admin Panel > Settings
2. Users can buy unlimited mining plans
3. Mining runs automatically and calculates profit per second
4. All deposits/withdrawals require manual admin approval
5. Minimum deposit: 10 USDT, Minimum withdrawal: 10 USDT
