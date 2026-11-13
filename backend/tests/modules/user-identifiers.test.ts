import { describe, expect, it } from 'vitest';
import { db } from '@/db';
import { userIdentifiers } from '@/db/schema';
import { normalizeIdentifier } from '@/modules/auth/user-identifiers.service';
import { createTenant, createUser } from '../setup/factories';

describe('user_identifiers uniqueness', () => {
  it('rejects a value that collides with another identifier of a different type', async () => {
    await createTenant();
    const existing = await createUser('parent');

    const other = await createUser('parent');

    await expect(
      db.insert(userIdentifiers).values({
        userId: other.id,
        type: 'username',
        // Same value as `existing`'s email identifier, but a different type —
        // this is exactly the collision the single UNIQUE constraint on
        // `value` (spanning all types) must block.
        value: existing.email!,
      }),
    ).rejects.toThrow();
  });
});

describe('normalizeIdentifier', () => {
  it.each(['+243 81 234 5678', '+243 (81) 234-5678', '+243.81.234.5678'])(
    'strips separators from %s but keeps the leading +',
    (raw) => {
      expect(normalizeIdentifier('phone', raw)).toBe('+243812345678');
    },
  );

  it('trims and lowercases emails', () => {
    expect(normalizeIdentifier('email', ' Admin@X.cd ')).toBe('admin@x.cd');
  });

  it('lowercases usernames', () => {
    expect(normalizeIdentifier('username', 'JeanM')).toBe('jeanm');
  });
});
