import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { classes, courses } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';

type Db = typeof db;
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

/** Every linked class must belong to the programme's sub-school. */
export async function assertClassesInSubSchool(
  executor: Db | Tx,
  subSchoolId: string,
  classIds: string[],
): Promise<void> {
  const found = await executor
    .select({ id: classes.id })
    .from(classes)
    .where(and(inArray(classes.id, classIds), eq(classes.subSchoolId, subSchoolId)));

  if (found.length !== classIds.length) {
    throw new AppError('VALIDATION_ERROR', 'Une ou plusieurs classes sont introuvables', 400, {
      classIds: ['Every class must belong to this sub-school'],
    });
  }
}

/** The linked course must belong to the programme's sub-school. */
export async function assertCourseInSubSchool(
  executor: Db | Tx,
  subSchoolId: string,
  courseId: string,
): Promise<void> {
  const [found] = await executor
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.subSchoolId, subSchoolId)))
    .limit(1);

  if (!found) {
    throw new AppError('VALIDATION_ERROR', 'Cours introuvable', 400, {
      courseId: ['The course must belong to this sub-school'],
    });
  }
}
