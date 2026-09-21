import { describe, expect, it } from 'vitest';
import { db } from '@/db';
import { userIdentifiers } from '@/db/schema';
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
