#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/home/rizal/portofolio}"

echo "🚀 Deploying to $DEPLOY_PATH"
cd "$DEPLOY_PATH"

# First run: remove the currently executing script so git can reset cleanly
if [ -z "$DEPLOY_RESTARTED" ]; then
  export DEPLOY_RESTARTED=1
  SCRIPT_NAME="$(basename "$0")"
  SCRIPT_FULL="$(realpath "$0")"
  # Move the running script out of the repo (so it's not an untracked file)
  mv "$SCRIPT_FULL" "/tmp/${SCRIPT_NAME}.old"
  # Pull latest code and reset hard – deploy.sh will be recreated from the repo
  echo "[0/5] Pull latest code..."
  git fetch --depth=1 origin main
  git reset --hard origin/main
  # Re‑exec the fresh script now present in the repo
  exec "$DEPLOY_PATH/$SCRIPT_NAME"
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
