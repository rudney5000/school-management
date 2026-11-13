import { readFileSync } from 'node:fs';
import path from 'node:path';
import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { db } from '@/db';
import { userIdentifiers, users } from '@/db/schema';
import {
  createIdentifiers,
  findUserByIdentifier,
  normalizeIdentifier,
} from '@/modules/auth/user-identifiers.service';
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

describe('createIdentifiers', () => {
  it('rejects the same value used for two identifier types', async () => {
    const [user] = await db.insert(users).values({ password: 'x', role: 'worker' }).returning();

    await expect(
      createIdentifiers(user.id, { email: 'same@test.local', username: 'same@test.local' }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

describe('0006 migration backfill', () => {
  // The last statement of the migration that created user_identifiers.
  const backfill = readFileSync(
    path.resolve(process.cwd(), 'src/db/migrations/0006_round_doctor_doom.sql'),
    'utf8',
  )
    .split('--> statement-breakpoint')
    .at(-1)!;

  it('gives accounts created before the migration a lowercased email identifier', async () => {
    const [legacy] = await db
      .insert(users)
      .values({ email: 'Legacy.User@Test.Local', password: 'x', role: 'worker' })
      .returning();

    await db.execute(sql.raw(backfill));

    expect((await findUserByIdentifier('legacy.user@test.local'))?.id).toBe(legacy.id);
  });

  it('can run again without duplicating or failing', async () => {
    await db.insert(users).values({ email: 'again@test.local', password: 'x', role: 'worker' });

    await db.execute(sql.raw(backfill));
    await db.execute(sql.raw(backfill));

    expect(
      await db
        .select()
        .from(userIdentifiers)
        .where(sql`${userIdentifiers.value} = 'again@test.local'`),
    ).toHaveLength(1);
  });

  it('fails loudly when two accounts share an email up to case', async () => {
    await db.insert(users).values([
      { email: 'twin@test.local', password: 'x', role: 'worker' },
      { email: 'Twin@test.local', password: 'x', role: 'worker' },
    ]);

    await expect(db.execute(sql.raw(backfill))).rejects.toThrow();
  });
});
