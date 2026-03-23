# 🚀 USDT Mining Lab - Railway Deployment Guide

## Prerequisites
- GitHub account
- Railway account (free tier available)

---

## Step 1: Push to GitHub

```bash
# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - USDT Mining Lab"

# Create GitHub repo and push
# Go to github.com → New repository
# Then:
git remote add origin https://github.com/YOUR_USERNAME/usdt-mining-lab.git
git push -u origin main
```

---

## Step 2: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Sign up with **GitHub**
4. Authorize Railway to access your repos

---

## Step 3: Deploy Project

1. Click **"Deploy from GitHub repo"**
2. Select **"usdt-mining-lab"** repository
3. Railway will auto-detect Next.js and start building

---

## Step 4: Add PostgreSQL Database

1. In your project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a database and provide connection strings

---

## Step 5: Set Environment Variables

In your project settings, add these variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
DIRECT_DATABASE_URL=${{Postgres.DIRECT_DATABASE_URL}}
TELEGRAM_BOT_TOKEN=8705535597:AAH3CT-aZlChDG_4NZeqGRwVObDfieFVz7k
TELEGRAM_CHAT_ID=8582959779
TELEGRAM_GROUP_ID=-1003551540968
NODE_ENV=production
```

---

## Step 6: Generate Domain

1. Go to **Settings** → **Domains**
2. Click **"Generate Domain"**
3. You'll get a URL like: `usdt-mining-lab.up.railway.app`

---

## Step 7: Update Telegram Bot

Once deployed, update the website URL in Telegram notifications:

```bash
curl -X POST "https://api.telegram.org/bot8705535597:AAH3CT-aZlChDG_4NZeqGRwVObDfieFVz7k/editMessageReplyMarkup" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "-1003551540968",
    "message_id": 9,
    "reply_markup": {
      "inline_keyboard": [
        [{"text": "🚀 Open Website", "url": "https://YOUR-URL.up.railway.app"}],
        [{"text": "💰 Deposit", "url": "https://YOUR-URL.up.railway.app"}, {"text": "🏦 Withdraw", "url": "https://YOUR-URL.up.railway.app"}]
      ]
    }
  }'
```

---

## Free Tier Limits

Railway free tier includes:
- **$5/month** free credits
- **512MB RAM**
- **Shared CPU**
- **1GB PostgreSQL** database

---

## Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Ensure all dependencies are in package.json

### Database Connection Error
- Verify DATABASE_URL is set correctly
- Check if PostgreSQL service is running

### App Not Loading
- Check deployment logs
- Verify environment variables are set

---

## Need Help?

If you need assistance:
1. Check Railway logs in dashboard
2. Check build output for errors
3. Contact Railway support

---

## Your Website URL

After deployment, your website will be available at:
**https://your-project-name.up.railway.app**

---

🎉 **Happy Mining!**
