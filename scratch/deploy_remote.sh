#!/usr/bin/env bash
set -e

echo "=== 🚀 Starting Deployment on Server (192.168.1.13:8080) ==="

TARGET_DIR="/home/rizal/portofolio"

if [ -d "$TARGET_DIR" ]; then
    echo "Updating existing repository in $TARGET_DIR..."
    cd "$TARGET_DIR"
    git fetch origin
    git reset --hard origin/main
else
    echo "Cloning repository to $TARGET_DIR..."
    git clone https://github.com/rizalzaky23/portofolio.git "$TARGET_DIR"
    cd "$TARGET_DIR"
fi

echo "Creating production .env configuration..."
cat << 'EOF' > .env
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://192.168.1.13:8080
CORS_ORIGINS=http://192.168.1.13:8080,http://localhost:8080,http://192.168.1.13

DATABASE_URL=mysql://portfolio:portfoliopassword@mysql:3306/portfolio
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=portfolio
MYSQL_USER=portfolio
MYSQL_PASSWORD=portfoliopassword

JWT_SECRET=super-secret-production-jwt-key-rizal-zaky-portfolio-2026-secure-at-least-64-characters
JWT_REFRESH_SECRET=super-secret-production-jwt-refresh-key-rizal-zaky-portfolio-2026-secure-different
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=portfolio
MINIO_PUBLIC_URL=http://192.168.1.13:9000
EOF

echo "Stopping existing containers..."
echo rizal2302. | sudo -S docker compose down --remove-orphans || true

echo "Building and starting Docker containers..."
echo rizal2302. | sudo -S docker compose up -d --build

echo "Waiting 20s for services & database health..."
sleep 20

echo "Running Prisma Database Migrations..."
echo rizal2302. | sudo -S docker compose exec -T backend npx prisma migrate deploy --schema=/app/prisma/schema.prisma || true

echo "Seeding Database..."
echo rizal2302. | sudo -S docker compose exec -T backend npx tsx /app/prisma/seed.ts || true

echo "=== ✅ Deployment Complete! ==="
echo "Access the application at:"
echo "  Portfolio: http://192.168.1.13:8080"
echo "  CMS Admin: http://192.168.1.13:8080/admin"
echo "  API Health: http://192.168.1.13:8080/api/health"
