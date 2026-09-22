import { createHash, randomInt } from 'node:crypto';
import { redisClient } from '@/lib/redis';

export type OtpVerifyResult = 'ok' | 'invalid' | 'expired' | 'too_many_attempts';

const codeKey = (key: string): string => `otp:code:${key}`;
const attemptsKey = (key: string): string => `otp:attempts:${key}`;

const hash = (code: string): string => createHash('sha256').update(code).digest('hex');

export async function generateAndStore(key: string, ttlSeconds = 300): Promise<string> {
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');

  await redisClient.set(codeKey(key), hash(code), 'EX', ttlSeconds);
  await redisClient.del(attemptsKey(key));

  return code;
}

export async function verify(
  key: string,
  candidate: string,
  maxAttempts = 5,
): Promise<OtpVerifyResult> {
  const attempts = await redisClient.incr(attemptsKey(key));
  if (attempts === 1) {
    await redisClient.expire(attemptsKey(key), 300);
  }

  if (attempts > maxAttempts) {
    return 'too_many_attempts';
  }

  const stored = await redisClient.get(codeKey(key));
  if (!stored) {
    return 'expired';
  }

  if (stored !== hash(candidate)) {
    return 'invalid';
  }

  await redisClient.del(codeKey(key), attemptsKey(key));
  return 'ok';
}
