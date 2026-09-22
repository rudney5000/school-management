import { describe, expect, it } from 'vitest';
import { generateAndStore, verify } from '@/lib/otp-cache';

describe('otp-cache', () => {
  it('verifies the correct code once, then rejects it as expired', async () => {
    const key = `test:${crypto.randomUUID()}`;
    const code = await generateAndStore(key);

    expect(await verify(key, code)).toBe('ok');
    expect(await verify(key, code)).toBe('expired');
  });

  it('rejects a wrong code without consuming it', async () => {
    const key = `test:${crypto.randomUUID()}`;
    await generateAndStore(key);

    expect(await verify(key, '000000')).toBe('invalid');
  });

  it('blocks after too many attempts, even with the right code', async () => {
    const key = `test:${crypto.randomUUID()}`;
    const code = await generateAndStore(key);

    for (let i = 0; i < 5; i++) {
      expect(await verify(key, '000000', 5)).toBe('invalid');
    }

    expect(await verify(key, code, 5)).toBe('too_many_attempts');
  });

  it('expires the code after its TTL', async () => {
    const key = `test:${crypto.randomUUID()}`;
    const code = await generateAndStore(key, 1);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    expect(await verify(key, code)).toBe('expired');
  });

  it('resets the attempt budget on a fresh generation for the same key', async () => {
    const key = `test:${crypto.randomUUID()}`;
    await generateAndStore(key);

    for (let i = 0; i < 5; i++) {
      await verify(key, '000000', 5);
    }

    const code = await generateAndStore(key);
    expect(await verify(key, code, 5)).toBe('ok');
  });
});
