# System Architecture

## Overview
This application is a production-ready personal portfolio website integrated with a custom Content Management System (CMS). It features an interactive 3D physics-based hero section (built with React Three Fiber and Rapier), responsive dynamic views, secure authentication, object storage, and full Docker containerization.

```
                  ┌──────────────────────────────────────────────┐
                  │                 Nginx Proxy                  │
                  │                 (Port 80/443)                │
                  └──────┬───────────────────────────────┬───────┘
                         │                               │
                         ▼                               ▼
       ┌──────────────────────────────────┐   ┌──────────────────────────────────┐
       │         Frontend (React)         │   │        Backend (Express)         │
       │       Static SPA Assets          │   │         REST API (Port 3000)     │
       └──────────────────────────────────┘   └──────┬───────────────────┬───────┘
                                                     │                   │
                                                     ▼                   ▼
                                           ┌──────────────────┐ ┌──────────────────┐
                                           │  MySQL Database  │ │  MinIO Storage   │
                                           │   (Port 3306)    │ │   (Port 9000)    │
                                           └──────────────────┘ └──────────────────┘
```

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **3D Graphics & Physics**: Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`
- **Animations**: Framer Motion, GSAP
- **Styling**: Tailwind CSS v4, Vanilla CSS design tokens (Amber Gold accent `#F59E0B`)
- **Icons**: `react-icons`
- **State Management**: Zustand (Auth & UI stores)
- **Form Validation**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js + TypeScript (`tsx` for dev execution)
- **Framework**: Express.js
- **Database ORM**: Prisma ORM + MySQL 8.0
- **Object Storage**: MinIO SDK (AWS S3 compatible)
- **Image Processing**: Sharp (auto-optimizes uploads to WebP)
- **Security**: Helmet, CORS, Rate Limiting (`rate-limiter-flexible`), Cookie Parser, XSS Sanitization (`sanitize-html`), bcryptjs password hashing
- **Authentication**: Dual-token JWT (Access Tokens in Bearer header, HTTP-Only Refresh Tokens in cookies)

### DevOps & Infrastructure
- **Containerization**: Multi-stage Dockerfiles (`Dockerfile.frontend`, `Dockerfile.backend`)
- **Orchestration**: `docker-compose.yml` (MySQL, MinIO, Backend, Frontend, Nginx)
- **Reverse Proxy**: Nginx with rate limiting, security headers, and static asset caching
