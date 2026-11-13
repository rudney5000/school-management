import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { redisClient } from '@/lib/redis';
import { rateLimit } from '@/middleware/rate-limit';
import { errorHandler } from '@/middleware/error-handler';

function appWithLimit(options: Parameters<typeof rateLimit>[0]) {
  const app = express();
  app.get('/ping', rateLimit(options), (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);
  return app;
}

describe('rateLimit', () => {
  it('allows requests within the window', async () => {
    const app = appWithLimit({
      windowSeconds: 60,
      max: 2,
      keyFn: () => `test:${crypto.randomUUID()}:fixed`,
    });

    await request(app).get('/ping').expect(200);
  });

  it('rejects once the count exceeds max, within the same key', async () => {
    const key = `test:${crypto.randomUUID()}`;
    const app = appWithLimit({ windowSeconds: 60, max: 1, keyFn: () => key });

    await request(app).get('/ping').expect(200);

    const response = await request(app).get('/ping').expect(429);
    expect(response.body.error.code).toBe('RATE_LIMITED');
  });

  it('allows a new request again after the window expires', async () => {
    const key = `test:${crypto.randomUUID()}`;
    const app = appWithLimit({ windowSeconds: 1, max: 1, keyFn: () => key });

    await request(app).get('/ping').expect(200);
    await request(app).get('/ping').expect(429);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    await request(app).get('/ping').expect(200);
  });

  it('always gives the counter an expiry', async () => {
    const key = `test:${crypto.randomUUID()}`;
    const app = appWithLimit({ windowSeconds: 60, max: 5, keyFn: () => key });

    await request(app).get('/ping').expect(200);

    expect(await redisClient.ttl(`ratelimit:${key}`)).toBeGreaterThan(0);
  });

  it('passes a Redis failure to the error handler instead of hanging', async () => {
    const spy = vi.spyOn(redisClient, 'eval').mockRejectedValueOnce(new Error('Redis down'));
    const app = appWithLimit({ windowSeconds: 60, max: 5, keyFn: () => 'any' });

    await request(app).get('/ping').expect(500);

    spy.mockRestore();
  });
});
