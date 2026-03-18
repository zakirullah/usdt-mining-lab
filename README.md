# USDT Mining Lab - Deployment Guide

## 🚀 Vercel Deployment

### Step 1: Create a PostgreSQL Database

Choose one of these free options:
- **Vercel Postgres** (Recommended): [Create here](https://vercel.com/storage/postgres)
- **Supabase**: [Create here](https://supabase.com)
- **Neon**: [Create here](https://neon.tech)
- **PlanetScale**: [Create here](https://planetscale.com)

### Step 2: Set Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

```
DATABASE_URL=postgresql://username:password@host:5432/database?pgbouncer=true&connect_timeout=15
DIRECT_DATABASE_URL=postgresql://username:password@host:5432/database
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
ADMIN_WALLET=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 3: Deploy

1. Push code to GitHub
2. Import project in Vercel
3. Deploy!

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   └── page.tsx       # Main page
│   └── components/        # UI components
└── vercel.json           # Vercel config
```

## 🔧 Local Development

```bash
# Install dependencies
bun install

# Setup database
bun run db:push

# Run development server
bun run dev
```

## ⚠️ Important Notes

1. **Database**: SQLite works locally but PostgreSQL is required for Vercel
2. **Sessions**: Stored in database, persistent across deployments
3. **Mining Updates**: Per-second profit calculations happen client-side
4. **Admin Approval**: Deposits and withdrawals require manual admin approval

## 📱 Features

- ✅ Real-time mining with per-second profit updates
- ✅ Platform & Today statistics with animated counters
- ✅ Sequential glow effects on stats cards
- ✅ Auto-scrolling deposit/withdrawal history
- ✅ Mining profit calculator
- ✅ 3-level referral system (7% commission)
- ✅ Mobile-responsive design
- ✅ Dark neon crypto theme
- ✅ Live activity ticker

## 🔐 Security

- 256-bit SSL encryption
- Secure PIN authentication
- Session-based auth with cookies
- Admin-only approval system
