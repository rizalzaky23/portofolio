#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/home/rizal/portofolio}"

echo "🚀 Deploying to $DEPLOY_PATH"
cd "$DEPLOY_PATH"

echo "[0/4] Clean workspace..."
# Remove any untracked files that could interfere with git reset
git clean -fdx

git fetch --depth=1 origin main
git reset --hard origin/main

echo "[2/3] Install dependencies..."
npm ci

echo "[3/3] Build and deploy Docker..."
# Pull latest images (if any)
# docker compose pull
# Rebuild containers without cache and recreate
docker compose build --no-cache
docker compose up -d --force-recreate

echo "✅ Deploy finished"