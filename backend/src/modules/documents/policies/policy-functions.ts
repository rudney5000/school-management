import { and, desc, eq, gte, inArray, isNotNull, lte, sql, sum, type SQL } from 'drizzle-orm';
import type { PolicyCheckContext, PolicyImplementations } from '@school-hub/documents';
import { db } from '@/db';
import {
  academicPeriods,
  documentParentShares,
  enrollments,
  grades,
  parentStudents,
  payments,
  studentAttendances,
} from '@/db/schema';
import { ClassesService } from '@/modules/classes/classes.service';
import type { DrizzleIssuingTx } from '../adapters/drizzle-issued-store';

type Context = PolicyCheckContext<DrizzleIssuingTx>;

const param = (ctx: Context, key: string): string | null => {
  const value = ctx.params?.[key];
  return typeof value === 'string' ? value : null;
};

/** The period the document is about: the one it names, else the current one of the sub-school. */
async function periodOf(ctx: Context) {
  const id = param(ctx, 'academicPeriodId');
  const [period] = await ctx.tx.tx
    .select({
      id: academicPeriods.id,
      startDate: academicPeriods.startDate,
      endDate: academicPeriods.endDate,
    })
    .from(academicPeriods)
    .where(
      and(
        eq(academicPeriods.subSchoolId, ctx.subSchoolId),
        id ? eq(academicPeriods.id, id) : eq(academicPeriods.isCurrent, true),
      ),
    )
    .limit(1);
  return period ?? null;
}

/** The class the document is about: the one it names, else the student's latest enrollment. */
async function classOf(ctx: Context, studentId: string): Promise<string | null> {
  const named = param(ctx, 'classId');
  if (named) return named;
  const [enrollment] = await ctx.tx.tx
    .select({ classId: enrollments.classId })
    .from(enrollments)
    .where(eq(enrollments.studentId, studentId))
    .orderBy(desc(enrollments.enrollmentDate))
    .limit(1);
  return enrollment?.classId ?? null;
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

/**
 * The functions of the catalogue that read the school's tables. They run in
 * the issuing transaction (`ctx.tx.tx`), after the subject lock.
 */
export const policyFunctions: PolicyImplementations<DrizzleIssuingTx> = {
  /**
   * Provisional: the app has no table of fees due yet. A PENDING payment is
   * read as an amount due on its payment date, so "period" counts those due by
   * the end of the period, and "year" every one still pending.
   */
  requireFeesPaid: async (ctx) => {
    const studentId = ctx.subject!.id;
    const conditions: SQL[] = [eq(payments.studentId, studentId), eq(payments.status, 'PENDING')];
    if (ctx.args.paymentTypes) conditions.push(inArray(payments.type, ctx.args.paymentTypes));
    if (ctx.args.upTo === 'period') {
      const period = await periodOf(ctx);
      if (period) conditions.push(lte(payments.paymentDate, period.endDate));
    }
    const [row] = await ctx.tx.tx
      .select({ due: sum(payments.amount) })
      .from(payments)
      .where(and(...conditions));
    const due = Number(row?.due ?? 0);
    if (due <= ctx.args.toleranceFc) return undefined;
    return {
      refuse: 'FEES_UNPAID',
      message: `${due} FC still due (tolerance ${ctx.args.toleranceFc} FC)`,
    };
  },

  requireAllGrades: async (ctx) => {
    const studentId = ctx.subject!.id;
    const classId = await classOf(ctx, studentId);
    const period = await periodOf(ctx);
    if (!classId || !period) {
      return { refuse: 'MISSING_GRADES', message: 'No class or period to check the grades of' };
    }
    const expected = await new ClassesService().getExpectedCourseIds(classId);
    if (expected.length === 0) {
      return { refuse: 'MISSING_GRADES', message: 'The class has no course' };
    }
    const graded = await ctx.tx.tx
      .selectDistinct({ courseId: grades.courseId })
      .from(grades)
      .where(
        and(
          eq(grades.studentId, studentId),
          eq(grades.classId, classId),
          eq(grades.academicPeriodId, period.id),
          isNotNull(grades.score),
        ),
      );
    const done = new Set(graded.map((g) => g.courseId));
    const missing = expected.filter((courseId) => !done.has(courseId));
    if (missing.length === 0) return undefined;
    return {
      refuse: 'MISSING_GRADES',
      message: `${missing.length} of ${expected.length} courses have no grade`,
    };
  },

  /** Late counts as present; excused days are left out. No day recorded: nothing to refuse. */
  requireAttendance: async (ctx) => {
    const studentId = ctx.subject!.id;
    const period = await periodOf(ctx);
    const conditions: SQL[] = [eq(studentAttendances.studentId, studentId)];
    if (period) {
      conditions.push(
        gte(studentAttendances.date, isoDay(period.startDate)),
        lte(studentAttendances.date, isoDay(period.endDate)),
      );
    }
    const rows = await ctx.tx.tx
      .select({ status: studentAttendances.status, count: sql<number>`count(*)::int` })
      .from(studentAttendances)
      .where(and(...conditions))
      .groupBy(studentAttendances.status);
    const count = (status: string) => rows.find((r) => r.status === status)?.count ?? 0;
    const present = count('PRESENT') + count('LATE');
    const counted = present + count('ABSENT');
    if (counted === 0) return undefined;
    const percent = (present / counted) * 100;
    if (percent >= ctx.args.minPercent) return undefined;
    return {
      refuse: 'ATTENDANCE_TOO_LOW',
      message: `Attendance ${Math.floor(percent * 10) / 10}% is below ${ctx.args.minPercent}%`,
    };
  },

  /** One share per document and parent: running it again shares nothing more. */
  publishToParentPortal: async ({ document }) => {
    if (document.subjectType !== 'student' || !document.subjectId) return;
    const links = await db
      .select({ parentId: parentStudents.parentId })
      .from(parentStudents)
      .where(eq(parentStudents.studentId, document.subjectId));
    if (links.length === 0) return;
    await db
      .insert(documentParentShares)
      .values(links.map(({ parentId }) => ({ issuedDocumentId: document.id, parentId })))
      .onConflictDoNothing();
  },
};
