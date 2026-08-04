# Setup and Deployment Guide

## Prerequisites
- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Docker & Docker Compose**: (Optional, recommended for production)
- **MySQL**: 8.0+
- **MinIO**: AWS S3-compatible object storage

## Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```

3. **Database Migration & Seed**:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. **Run Development Servers**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`
   - CMS Dashboard: `http://localhost:5173/admin`

5. **Default Admin Login**:
   - **Email**: `admin@rizalzaky.dev`
   - **Password**: `Admin@123456`

## Production Docker Deployment

To launch the full containerized stack (MySQL, MinIO, Backend, Frontend, Nginx on port 8080):

```bash
docker compose up -d --build
```

Access the application at `http://localhost:8080` (or `http://YOUR_SERVER_IP:8080`).
Note: Port `8080` is used to avoid port conflicts with host services such as CasaOS (which uses port `80`).
