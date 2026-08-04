import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

const globalLimiter = new RateLimiterMemory({
  points: 100,    // requests
  duration: 60,   // per 60 seconds
});

const authLimiter = new RateLimiterMemory({
  points: 10,
  duration: 900,  // 15 minutes
});

const createMiddleware =
  (limiter: RateLimiterMemory) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = req.ip ?? 'unknown';
    try {
      await limiter.consume(key);
      next();
    } catch {
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    }
  };

export const rateLimitGlobal = createMiddleware(globalLimiter);
export const rateLimitAuth = createMiddleware(authLimiter);
