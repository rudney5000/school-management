import type { NextFunction, Request, Response } from 'express';
import { redisClient } from '@/lib/redis';
import { AppError } from '@/shared/errors/app-error';

interface RateLimitOptions {
  windowSeconds: number;
  max: number;
  keyFn: (req: Request) => string;
}

export function rateLimit({ windowSeconds, max, keyFn }: RateLimitOptions) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const key = `ratelimit:${keyFn(req)}`;

    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    if (count > max) {
      next(new AppError('RATE_LIMITED', 'Too many requests', 429));
      return;
    }

    next();
  };
}
