# USDT Mining Lab - Backup Information

## Backup Date: March 12, 2026 - 01:30

## What is Backed Up:
1. **src_backup_20260312_013019** - All source code including:
   - `src/app/page.tsx` - Main page with Login and Dashboard
   - `src/app/api/` - All API routes
   - `src/components/ui/` - UI components
   - `src/lib/` - Database and utility functions

2. **prisma_backup_20260312_013019** - Database schema:
   - `schema.prisma` - Prisma schema with all models
   - `seed.ts` - Database seed file

3. **db_backup_20260312_013032** - SQLite Database:
   - `custom.db` - Local database with all user data

## Current Working Features:

### Login Page:
- Loading screen with animation (2 seconds)
- Platform Statistics (6 neon-colored cards)
- Global Mining Power counter
- Today Statistics
- Recent Withdrawals Board
- Online Users Counter
- Website Visitors Counter
- Floating Crypto Background
- Mining Rigs Background Animation
- Login/Register with Wallet Address + 6 Digit PIN
- Mining Calculator
- Referral System
- FAQ Section
- Live Activity Popups (left bottom corner)

### Dashboard (After Login):
- Dashboard Header with User Info
- Balance Cards
- Live Mining System
- Deposit System (Manual Confirmation)
- Withdrawal System (Manual Approval)
- Transaction History
- Referral Program
- User Statistics

### Admin Features:
- Deposit Approval
- Withdrawal Approval
- Broadcast Message System

## Database Tables (umlab_ prefix):
- umlab_users
- umlab_admin_settings
- umlab_mining_plans
- umlab_user_mining
- umlab_deposits
- umlab_withdrawals
- umlab_referrals
- umlab_transactions
- umlab_notifications
- umlab_sessions
- umlab_broadcasts
- umlab_user_stats

## Vercel Environment Variables (Production):
- DATABASE_URL (PostgreSQL Neon)
- DIRECT_DATABASE_URL
- DIRECT_URL
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_URL
- JWT_SECRET

## Important URLs:
- Production: https://my-project-bay-rho.vercel.app
- GitHub: https://github.com/zakirullah/usdt-mining

## DO NOT DELETE THESE BACKUPS!
