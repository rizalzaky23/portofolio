# Setup and Deployment Guide

## Prerequisites
- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Docker & Docker Compose**: (Optional, recommended for production)
- **MySQL**: 8.0+
- **MinIO**: AWS S3-compatible object storage

## Architectural Highlights
- **Hero Section**: Award-winning interactive 3D ID Card Lanyard powered by **React Three Fiber** and **@react-three/rapier** physics engine. Includes rope joint physics, mouse drag momentum, glass/acrylic MeshTransmissionMaterial, volumetric workspace particles, dynamic canvas texture generation (Profile photo, QR code, employee ID), and cinematic lighting.
- **Desktop 50/50 Split Layout**: Interactive 3D Lanyard viewport on the left, high-impact typography ("Rizal Zaky"), CTA action buttons, currently listening Music widget, and pulse availability status on the right.
- **CMS Module**: Full CRUD management for projects, experiences, achievements, certificates, skills, about section, users, and media assets.

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

5. **Default Admin Credentials**:
   - **Email**: `admin@rizalzaky.dev`
   - **Password**: `Admin@123456`

## Production Docker Deployment

To launch the full containerized stack (MySQL, MinIO, Backend, Frontend, Nginx on port 8080):

```bash
docker compose up -d --build
```

Access the application at `http://localhost:8080` (or `http://192.168.1.13:8080`).
Note: Port `8080` is used to avoid port conflicts with host services such as CasaOS (which uses port `80`).
