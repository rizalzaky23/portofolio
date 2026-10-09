#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/home/rizal/portofolio}"

echo "🚀 Deploying to $DEPLOY_PATH"
cd "$DEPLOY_PATH"

# If this is the first run, move the script out of the repo, reset, then re‑exec the fresh script
if [ -z "$DEPLOY_SCRIPT_RAN" ]; then
  export DEPLOY_SCRIPT_RAN=1
  SCRIPT_NAME="$(basename "$0")"
  mv "$SCRIPT_NAME" "/tmp/${SCRIPT_NAME}.old"
  echo "[0/5] Reset repository..."
  git fetch --depth=1 origin main
  git reset --hard origin/main
  # Re‑exec the updated script (now back in the repo)
  exec bash "$SCRIPT_NAME"
fi

# Install dependencies
echo "[1/5] Install dependencies..."
npm ci

# Build Docker image without cache and redeploy
echo "[2/5] Build Docker..."
docker compose build --no-cache

echo "[3/5] Deploy containers..."
docker compose up -d --force-recreate

echo "✅ Deploy finished"
