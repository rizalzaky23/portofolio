#!/usr/bin/env bash
set -euo pipefail

# Deploy script for portfolio site
# Called by GitHub Actions workflow (.github/workflows/deploy.yml)
# Assumes $DEPLOY_PATH points to the server directory.

DEPLOY_PATH="${DEPLOY_PATH:-/home/rizal/portofolio}"

echo "🚀 Deploying to $DEPLOY_PATH"

cd "$DEPLOY_PATH"

echo "🔄 Pulling latest code..."
git fetch --depth=1 origin main
git reset --hard origin/main

echo "📦 Installing dependencies..."
npm ci

echo "🏗️ Building project..."
npm run build

# Copy built assets to Nginx html directory
echo "📂 Deploying built files to /usr/share/nginx/html"
sudo cp -r dist/* /usr/share/nginx/html/

# Reload Nginx to serve the new files
echo "🔄 Reloading Nginx"
sudo nginx -s reload

# If you use a process manager, restart it here. Example for pm2 (uncomment if applicable):
# echo "♻️ Restarting pm2 process..."
# pm2 reload portfolio || pm2 start npm --name portfolio -- run start

echo "✅ Deploy finished"
