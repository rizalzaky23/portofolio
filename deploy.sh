#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/home/rizal/portofolio}"

echo "🚀 Deploying to $DEPLOY_PATH"
cd "$DEPLOY_PATH"

# Preserve this script before cleaning (optional backup)
SCRIPT_NAME="$(basename "$0")"
TMP_SCRIPT="/tmp/${SCRIPT_NAME}.backup"
cp "$SCRIPT_NAME" "$TMP_SCRIPT"

# Delete the currently running deploy script to avoid merge conflict
rm -f "$SCRIPT_NAME"


# Pull latest code safely
 echo "[1/5] Pull latest code..."
 git fetch --depth=1 origin main
 git reset --hard origin/main

# Restore script from backup (in case it was removed by clean)
 cp "$TMP_SCRIPT" "$SCRIPT_NAME" || true
 rm -f "$TMP_SCRIPT"

# Install dependencies
echo "[2/5] Install dependencies..."
npm ci

# Build Docker image without cache and redeploy
echo "[3/5] Build Docker..."
docker compose build --no-cache

echo "[4/5] Deploy containers..."
docker compose up -d --force-recreate

echo "✅ Deploy finished"
