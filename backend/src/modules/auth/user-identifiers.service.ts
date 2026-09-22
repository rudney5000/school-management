import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { userIdentifiers, users } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';

export interface IdentifierValues {
  email?: string;
  phone?: string;
  username?: string;
}

export async function createIdentifiers(userId: string, values: IdentifierValues): Promise<void> {
  const entries = (['email', 'phone', 'username'] as const)
    .filter((type) => values[type])
    .map((type) => ({ type, value: values[type]! }));

  if (entries.length === 0) {
    return;
  }

  const takenValues = entries.map((entry) => entry.value);
  const existing = await db
    .select({ value: userIdentifiers.value })
    .from(userIdentifiers)
    .where(inArray(userIdentifiers.value, takenValues));

  if (existing.length > 0) {
    throw new AppError('CONFLICT', 'Identifier already in use', 409);
  }

  const mirrorUpdate = Object.fromEntries(entries.map(({ type, value }) => [type, value]));

  await db.transaction(async (tx) => {
    await tx.insert(userIdentifiers).values(entries.map((entry) => ({ userId, ...entry })));
    await tx.update(users).set(mirrorUpdate).where(eq(users.id, userId));
  });
}

export async function findUserIdByIdentifierValue(value: string): Promise<string | null> {
  const [row] = await db
    .select({ userId: userIdentifiers.userId })
    .from(userIdentifiers)
    .where(eq(userIdentifiers.value, value))
    .limit(1);

  return row?.userId ?? null;
}
