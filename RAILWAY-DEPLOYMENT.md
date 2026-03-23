# USDT Mining Lab - Railway Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Verify your account

### Step 2: Create PostgreSQL Database
1. In Railway Dashboard, click **"New Project"**
2. Select **"Provision PostgreSQL"**
3. Wait for database to be created
4. Go to your PostgreSQL service → **Variables** tab
5. Copy the following values:
   - `DATABASE_URL` (connection pool URL)
   - `DIRECT_DATABASE_URL` (direct connection URL - you may need to create this)

### Step 3: Deploy Next.js App
1. Click **"New"** → **"Deploy from GitHub repo"**
2. Select your repository
3. Configure the service:
   - **Root Directory**: `./`
   - **Build Command**: `npm run railway:build`
   - **Start Command**: `npm run railway:start`

### Step 4: Add Environment Variables

In your Railway Next.js service, add these variables:

```env
# Database (from PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}
DIRECT_DATABASE_URL=${{Postgres.DATABASE_URL}}

# Next.js
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-app-name.up.railway.app

# Session
JWT_SECRET=your-jwt-secret-key-here

# Admin Wallet (change to your admin wallet)
ADMIN_WALLET=0xYourAdminWalletAddress
```

### Step 5: Connect Database to App
1. Go to your Next.js service in Railway
2. Click **"New Variable"**
3. Type `${{Postgres.DATABASE_URL}}` to reference the PostgreSQL database

### Step 6: Deploy
1. Click **"Deploy"** button
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at `https://your-app.up.railway.app`

---

## 📋 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection URL | ✅ Yes |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL connection | ✅ Yes |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | ✅ Yes |
| `NEXTAUTH_URL` | Your app URL | ✅ Yes |
| `JWT_SECRET` | JWT signing secret | ✅ Yes |
| `ADMIN_WALLET` | Admin wallet address | Optional |

---

## 🔧 Alternative: Using PostgreSQL Schema

If Prisma migrations fail, use the PostgreSQL SQL schema:

1. Go to Railway PostgreSQL → **Query** tab
2. Run the SQL from `prisma/schema.postgres.sql`
3. This creates all tables manually

---

## 🎯 Post-Deployment Steps

### 1. Create Admin User

Connect to your Railway PostgreSQL database and run:

```sql
INSERT INTO umlab_users (id, "walletAddress", "securityPin", "referralCode", role, balance, "totalProfit", "totalInvested", "totalWithdrawn", "referralEarnings", "isActive")
VALUES (
  'admin_001',
  '0xYourAdminWalletAddress',
  '$2a$10$YourHashedPinHere',
  'ADMIN001',
  'admin',
  0, 0, 0, 0, 0,
  true
);
```

Or use the API endpoint to register and then manually update role to 'admin'.

### 2. Create Default Mining Plan

```sql
INSERT INTO umlab_mining_plans (id, name, "dailyProfit", duration, "minInvest", "maxInvest", "isActive")
VALUES ('plan_001', 'Starter Mining Plan', 4, 30, 10, 100000, true);
```

### 3. Create Admin Settings

```sql
INSERT INTO umlab_admin_settings (id, "siteName", "depositWallet", "minDeposit", "minWithdraw", "maintenanceMode")
VALUES ('settings_001', 'USDT Mining Lab', '0x33cb374635ab51fc669c1849b21b589a17475fc3', 10, 10, false);
```

---

## 🔒 Security Recommendations

1. **Change Default Admin PIN**: After creating admin, login and change PIN
2. **Use Strong Secrets**: Generate random 32+ character secrets
3. **Enable Railway's Domain**: Use Railway's provided SSL domain
4. **Monitor Logs**: Check Railway logs regularly for errors

---

## 📊 Monitoring

Railway provides:
- Real-time logs
- CPU/Memory metrics
- Database query logs (PostgreSQL)
- Deployment history

---

## 🔄 Updating Deployment

1. Push changes to GitHub
2. Railway auto-deploys on push
3. Or manually redeploy in Railway dashboard

---

## ❓ Troubleshooting

### Database Connection Error
```
Error: P1001: Can't reach database server
```
**Solution**: Check DATABASE_URL is correct and PostgreSQL service is running

### Prisma Migration Error
```
Error: P3005: The database schema is not empty
```
**Solution**: Use `prisma db push` instead of `prisma migrate deploy`

### Build Timeout
```
Build timed out after 10 minutes
```
**Solution**: Increase Railway's build timeout or optimize build

---

## 📱 Support

- Railway Docs: https://docs.railway.app
- Prisma Docs: https://www.prisma.io/docs
- GitHub Issues: [Your Repo Issues]

---

## 💰 Railway Pricing

Railway offers:
- **Free Tier**: $5/month credit (limited)
- **Pro Tier**: Pay-as-you-go ($20/month min)
- Database: ~$5/month for PostgreSQL

---

**Happy Mining! 🚀⛏️**
