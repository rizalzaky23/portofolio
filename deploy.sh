#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/home/rizal/portofolio}"

echo "🚀 Deploying to $DEPLOY_PATH"
cd "$DEPLOY_PATH"

echo "[1/3] Pull latest code..."
git fetch --depth=1 origin main
git reset --hard origin/main

echo "[2/3] Install dependencies..."
npm ci

echo "[3/3] Build and deploy Docker..."
# Pull latest images (if any)
docker compose pull
# Rebuild containers without cache and recreate
docker compose up -d --build --force-recreate --pull always

echo "✅ Deploy finished"