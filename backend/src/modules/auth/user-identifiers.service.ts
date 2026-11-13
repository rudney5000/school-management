import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { identifierTypeEnum, userIdentifiers, users } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import { isUniqueViolation } from '@/shared/utils/pg-errors';

type Db = typeof db;
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

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

/**
 * Writes the identifier rows and their users mirror columns. Pass the caller's
 * transaction so the account and its identifiers are created atomically.
 *
 * Uniqueness is left to the database: the UNIQUE constraints on
 * user_identifiers.value and users.email are the only check that holds under
 * concurrent registrations, and a violation is reported as a 409.
 */
export async function createIdentifiers(
  userId: string,
  values: IdentifierValues,
  executor: Db | Tx = db,
): Promise<void> {
  const entries = identifierTypeEnum.enumValues
    .filter((type) => values[type])
    .map((type) => ({ type, value: normalizeIdentifier(type, values[type]!) }));

  if (entries.length === 0) {
    return;
  }

  if (new Set(entries.map((entry) => entry.value)).size !== entries.length) {
    throw new AppError(
      'VALIDATION_ERROR',
      'The same value cannot be used for two identifiers',
      400,
    );
  }

  const mirrorUpdate = Object.fromEntries(entries.map(({ type, value }) => [type, value]));

  try {
    await executor.insert(userIdentifiers).values(entries.map((entry) => ({ userId, ...entry })));
    await executor.update(users).set(mirrorUpdate).where(eq(users.id, userId));
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError('CONFLICT', 'Identifier already in use', 409);
    }
    throw error;
  }
}

// Login has a single free-text field, so the type is read from the value's
// shape. Registration rules make this unambiguous: only emails contain "@",
// and usernames must start with a letter, so anything starting with "+" or a
// digit is a phone number.
export function detectIdentifierType(value: string): IdentifierType {
  const trimmed = value.trim();

  if (trimmed.includes('@')) {
    return 'email';
  }

  return /^[+\d]/.test(trimmed) ? 'phone' : 'username';
}

export async function findUserByIdentifier(
  identifier: string,
): Promise<typeof users.$inferSelect | null> {
  const value = normalizeIdentifier(detectIdentifierType(identifier), identifier);

  const [row] = await db
    .select({ user: users })
    .from(userIdentifiers)
    .innerJoin(users, eq(users.id, userIdentifiers.userId))
    .where(eq(userIdentifiers.value, value))
    .limit(1);

  return row?.user ?? null;
}
