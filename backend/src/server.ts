import './config/env.js'; // Must be first — loads & validates env
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { prisma } from './config/database.js';
import { storage } from './services/storage/MinIOProvider.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { rateLimitGlobal } from './middleware/rateLimit.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import contentRoutes from './routes/content.js';
import apiRoutes from './routes/api.js';

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ─── Utilities ────────────────────────────────────────────────────────────────
app.use(compression());
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}
app.use(rateLimitGlobal);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ success: false, status: 'unhealthy' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', contentRoutes);
app.use('/api', apiRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    await (storage as import('./services/storage/MinIOProvider.js').MinIOProvider).initialize();
    console.log('✅ MinIO storage initialized');

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();

export default app;
