import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const env = {
  // App
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3000'), 10),
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:5173'),
  CORS_ORIGINS: optional('CORS_ORIGINS', 'http://localhost:5173').split(','),

  // Database
  DATABASE_URL: required('DATABASE_URL'),

  // JWT
  JWT_SECRET: required('JWT_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

  // MinIO
  MINIO_ENDPOINT: optional('MINIO_ENDPOINT', 'localhost'),
  MINIO_PORT: parseInt(optional('MINIO_PORT', '9000'), 10),
  MINIO_USE_SSL: optional('MINIO_USE_SSL', 'false') === 'true',
  MINIO_ACCESS_KEY: required('MINIO_ACCESS_KEY'),
  MINIO_SECRET_KEY: required('MINIO_SECRET_KEY'),
  MINIO_BUCKET_NAME: optional('MINIO_BUCKET_NAME', 'portfolio'),
  MINIO_PUBLIC_URL: optional('MINIO_PUBLIC_URL', 'http://localhost:9000'),
} as const;
