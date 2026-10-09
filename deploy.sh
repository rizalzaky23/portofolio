#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/home/rizal/portofolio}"

echo "🚀 Deploying to $DEPLOY_PATH"
cd "$DEPLOY_PATH"

# Preserve this script before cleaning
SCRIPT_NAME="$(basename "$0")"
TMP_SCRIPT="/tmp/${SCRIPT_NAME}.backup"
cp "$SCRIPT_NAME" "$TMP_SCRIPT"

# Clean untracked files except this script
echo "[0/5] Clean workspace (excluding deploy script)"
git clean -fdx -e "$SCRIPT_NAME"

# Pull latest code and reset hard
echo "[1/5] Pull latest code..."
git fetch --depth=1 origin main
# Reset will overwrite tracked files, including deploy.sh, but we have backup
git reset --hard origin/main

# Restore the script if needed (optional, not required for next run)
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
