#!/bin/bash

# ===========================================
# USDT Mining Lab - GitHub Push Script
# ===========================================

echo "🚀 USDT Mining Lab - Deployment Script"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if GitHub remote exists
REMOTE=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE" ]; then
    echo -e "${YELLOW}⚠️  No GitHub remote found!${NC}"
    echo ""
    echo "Please follow these steps:"
    echo ""
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository named 'usdt-mining-lab'"
    echo "3. Don't initialize with README (we already have code)"
    echo "4. Run this command:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/usdt-mining-lab.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "5. Then go to https://railway.app"
    echo "6. Sign up with GitHub"
    echo "7. Click 'New Project' → 'Deploy from GitHub repo'"
    echo "8. Select 'usdt-mining-lab' repository"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ GitHub remote found: $REMOTE${NC}"
echo ""
echo "Pushing to GitHub..."
git push origin master || git push origin main

echo ""
echo -e "${GREEN}✅ Push complete!${NC}"
echo ""
echo "Now go to https://railway.app to deploy:"
echo "1. Sign up/Login with GitHub"
echo "2. New Project → Deploy from GitHub repo"
echo "3. Select 'usdt-mining-lab'"
echo "4. Add PostgreSQL database"
echo "5. Add environment variables"
echo ""
echo "See RAILWAY-DEPLOYMENT.md for detailed instructions!"
