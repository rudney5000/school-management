import type { Request, RequestHandler } from 'express';
import { redisClient } from '@/lib/redis';
import { AppError } from '@/shared/errors/app-error';
import { asyncHandler } from '@/shared/utils/async-handler';

interface RateLimitOptions {
  windowSeconds: number;
  max: number;
  keyFn: (req: Request) => string;
}

// INCR and EXPIRE in one atomic step: if they were two calls, losing the EXPIRE
// (crash, Redis error) would leave a counter that never expires and block the
// key for good.
const INCREMENT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return count
`;

export function rateLimit({ windowSeconds, max, keyFn }: RateLimitOptions): RequestHandler {
  // asyncHandler forwards a Redis failure to the error handler; Express 4 would
  // otherwise leave the request hanging on the rejected promise.
  return asyncHandler(async (req, _res, next) => {
    const count = Number(
      await redisClient.eval(INCREMENT_SCRIPT, 1, `ratelimit:${keyFn(req)}`, windowSeconds),
    );

    if (count > max) {
      next(new AppError('RATE_LIMITED', 'Too many requests', 429));
      return;
    }

    next();
  });
}
