import Redis from 'ioredis';
import { env } from '@/config/env';

export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  tls: env.REDIS_TLS ? {} : undefined,
  // Importing the app under test must not open a socket to a Redis that the
  // test environment does not run.
  lazyConnect: env.NODE_ENV === 'test',
});

redisClient.on('connect', () => console.log('✓ Redis connected'));
redisClient.on('error', (err) => console.error('✗ Redis error:', err));
