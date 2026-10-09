#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/home/rizal/portofolio}"

echo "🚀 Deploying to $DEPLOY_PATH"
cd "$DEPLOY_PATH"

echo "[1/3] Install dependencies..."
npm ci

echo "[2/3] Build Docker..."
docker compose build --no-cache

echo "[3/3] Deploy containers..."
docker compose up -d --force-recreate

echo "✅ Deploy finished"
