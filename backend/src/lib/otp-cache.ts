import { createHash, randomInt } from 'node:crypto';
import { redisClient } from '@/lib/redis';

export type OtpVerifyResult = 'ok' | 'invalid' | 'expired' | 'too_many_attempts';

const DEFAULT_TTL_SECONDS = 300;

const codeKey = (key: string): string => `otp:code:${key}`;
const attemptsKey = (key: string): string => `otp:attempts:${key}`;

const hash = (code: string): string => createHash('sha256').update(code).digest('hex');

// Runs as one atomic step in Redis: count the attempt, then compare and consume
// the code. Two concurrent requests with the right code can never both get 'ok'.
// The attempts counter is created by generateAndStore with the code's own TTL,
// and INCR keeps that TTL. The EXPIRE only fires when the counter has no expiry
// (TTL -1: INCR just created it because no code was ever generated), so the
// budget is never shortened and no counter is left without an expiry.
const VERIFY_SCRIPT = `
local attempts = redis.call('INCR', KEYS[2])
if redis.call('TTL', KEYS[2]) == -1 then
  redis.call('EXPIRE', KEYS[2], ARGV[3])
end
if attempts > tonumber(ARGV[2]) then
  return 'too_many_attempts'
end
local stored = redis.call('GET', KEYS[1])
if not stored then
  return 'expired'
end
if stored ~= ARGV[1] then
  return 'invalid'
end
redis.call('DEL', KEYS[1], KEYS[2])
return 'ok'
`;

export async function generateAndStore(
  key: string,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): Promise<string> {
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');

  // The attempts budget lives exactly as long as the code, so it cannot reset
  // while the code is still valid.
  await redisClient
    .multi()
    .set(codeKey(key), hash(code), 'EX', ttlSeconds)
    .set(attemptsKey(key), 0, 'EX', ttlSeconds)
    .exec();

  return code;
}

export async function verify(
  key: string,
  candidate: string,
  maxAttempts = 5,
): Promise<OtpVerifyResult> {
  const result = await redisClient.eval(
    VERIFY_SCRIPT,
    2,
    codeKey(key),
    attemptsKey(key),
    hash(candidate),
    maxAttempts,
    DEFAULT_TTL_SECONDS,
  );

  return result as OtpVerifyResult;
}
