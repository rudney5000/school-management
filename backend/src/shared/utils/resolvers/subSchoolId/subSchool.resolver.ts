import { and, eq } from 'drizzle-orm';
import type { Request } from 'express';
import { z } from 'zod';
import { db } from '@/db';
import { subSchools } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';

const uuid = z.string().uuid();

const forbidden = (): AppError => new AppError('FORBIDDEN', 'Accès refusé à cette sous-école', 403);

/**
 * The school a request may act on. Outside of `super_admin` it comes from the
 * token only: a client that could name its own school could read every other
 * school's data.
 */
export function resolveSchoolId(req: Request): string {
  const user = req.user;

  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Utilisateur non authentifié', 401);
  }

  if (user.role === 'super_admin') {
    const requested = (req.query as { schoolId?: string }).schoolId;

    if (requested) {
      return requested;
    }
  }

  if (!user.schoolId) {
    throw new AppError('BAD_REQUEST', 'schoolId is required', 400);
  }

  return user.schoolId;
}

/**
 * Checks that `subSchoolId` is one the caller may act on, and returns it.
 *
 * `super_admin` is a platform-level role and may target any sub-school. Everyone
 * else is confined to the school carried by their token — a value they cannot
 * forge. An account whose school never resolved (`schoolId: ''`) reaches nothing.
 */
async function authorizeSubSchool(req: Request, subSchoolId: string): Promise<string> {
  const user = req.user;

  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Utilisateur non authentifié', 401);
  }

  if (!uuid.safeParse(subSchoolId).success) {
    throw forbidden();
  }

  const isSuperAdmin = user.role === 'super_admin';

  if (!isSuperAdmin && !uuid.safeParse(user.schoolId).success) {
    throw forbidden();
  }

  const [match] = await db
    .select({ id: subSchools.id })
    .from(subSchools)
    .where(
      isSuperAdmin
        ? eq(subSchools.id, subSchoolId)
        : and(eq(subSchools.id, subSchoolId), eq(subSchools.schoolId, user.schoolId)),
    )
    .limit(1);

  if (!match) {
    throw forbidden();
  }

  return subSchoolId;
}

/**
 * Resolves the sub-school a request is allowed to act on.
 *
 * A token that already carries a sub-school wins outright. Otherwise the caller
 * may name one via `?subSchoolId=`, which the frontend's sub-school switcher
 * relies on — but it is only honoured once checked against the token. Without
 * that check any authenticated user could read another school's data just by
 * changing the query string.
 */
export async function resolveSubSchoolId(req: Request): Promise<string> {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 'Utilisateur non authentifié', 401);
  }

  if (req.user.subSchoolId) {
    return req.user.subSchoolId;
  }

  const requested = (req.query as { subSchoolId?: string }).subSchoolId;

  if (!requested) {
    throw new AppError('BAD_REQUEST', 'subSchoolId is required', 400);
  }

  return authorizeSubSchool(req, requested);
}

/**
 * Same check for a sub-school supplied in a request body, so a write cannot be
 * aimed at another tenant.
 */
export async function assertSubSchoolAllowed(req: Request, subSchoolId: string): Promise<void> {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 'Utilisateur non authentifié', 401);
  }

  if (req.user.subSchoolId) {
    if (req.user.subSchoolId !== subSchoolId) {
      throw forbidden();
    }
    return;
  }

  await authorizeSubSchool(req, subSchoolId);
}
