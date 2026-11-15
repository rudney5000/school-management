import { and, eq, inArray, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import {
  attachments,
  curricula,
  curriculumClasses,
  enrollments,
  parentStudents,
  users,
} from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CurriculumRecord, CurriculumViewer } from './curricula.types';

export const curriculumNotFound = (): AppError =>
  new AppError('NOT_FOUND', 'Programme introuvable', 404);

/**
 * The classes a parent's children, or a student, are enrolled in.
 *
 * Every enrollment counts, `draft` included: a draft only means some
 * enrollment documents are missing, and the student still attends the class.
 * Courses, grades and report cards read enrollments the same way.
 */
export async function resolveFamilyClassIds(
  userId: string,
  role: 'parent' | 'student',
): Promise<string[]> {
  const [userRecord] = await db
    .select({ parentId: users.parentId, studentId: users.studentId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  let studentIds: string[];

  if (role === 'parent') {
    if (!userRecord?.parentId) {
      throw new AppError('FORBIDDEN', 'Aucun profil parent associé à ce compte', 403);
    }
    const links = await db
      .select({ studentId: parentStudents.studentId })
      .from(parentStudents)
      .where(eq(parentStudents.parentId, userRecord.parentId));
    studentIds = links.map((link) => link.studentId);
  } else {
    if (!userRecord?.studentId) {
      throw new AppError('FORBIDDEN', 'Aucun profil élève associé à ce compte', 403);
    }
    studentIds = [userRecord.studentId];
  }

  if (studentIds.length === 0) return [];

  const rows = await db
    .select({ classId: enrollments.classId })
    .from(enrollments)
    .where(inArray(enrollments.studentId, studentIds));

  return [...new Set(rows.map((row) => row.classId))];
}

/** Subquery: the programmes linked to any of these classes. */
export function curriculaOfClasses(classIds: string[]) {
  return db
    .select({ id: curriculumClasses.curriculumId })
    .from(curriculumClasses)
    .where(inArray(curriculumClasses.classId, classIds));
}

/** The conditions that limit programmes to what this viewer may see, or null when nothing is visible. */
export function visibilityConditions(viewer: CurriculumViewer): SQL[] | null {
  const conditions: SQL[] = [];

  if (viewer.kind === 'family') {
    if (viewer.classIds.length === 0) return null;
    conditions.push(inArray(curricula.id, curriculaOfClasses(viewer.classIds)));
  } else {
    conditions.push(eq(curricula.subSchoolId, viewer.subSchoolId));
  }

  if (viewer.kind !== 'manager') conditions.push(eq(curricula.status, 'published'));

  return conditions;
}

/** The programme, if this viewer may see it; otherwise 404, so its existence does not leak. */
export async function findAccessibleCurriculum(
  id: string,
  viewer: CurriculumViewer,
): Promise<CurriculumRecord> {
  const visible = visibilityConditions(viewer);
  if (!visible) throw curriculumNotFound();

  const [record] = await db
    .select()
    .from(curricula)
    .where(and(eq(curricula.id, id), ...visible))
    .limit(1);

  if (!record) throw curriculumNotFound();
  return record;
}

/** The attachment rows of one programme. */
export function filesOf(curriculumId: string): SQL {
  return and(
    eq(attachments.attachableType, 'curriculum'),
    eq(attachments.attachableId, curriculumId),
  ) as SQL;
}
