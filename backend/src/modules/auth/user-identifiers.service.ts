import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { identifierTypeEnum, userIdentifiers, users } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';

export interface IdentifierValues {
  email?: string;
  phone?: string;
  username?: string;
}

export type IdentifierType = (typeof identifierTypeEnum.enumValues)[number];

export function normalizeIdentifier(type: IdentifierType, value: string): string {
  switch (type) {
    case 'email':
    case 'username':
      return value.toLowerCase().trim();
    case 'phone':
      return value.replace(/[\s().-]/g, '');
  }
}

export async function createIdentifiers(userId: string, values: IdentifierValues): Promise<void> {
  const entries = identifierTypeEnum.enumValues
    .filter((type) => values[type])
    .map((type) => ({ type, value: normalizeIdentifier(type, values[type]!) }));

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
