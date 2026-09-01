import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { grades } from '@/db/schema/grades';
import { AppError } from '@/shared/errors/app-error';
import type { CreateGradeInput, UpdateGradeInput, BulkCreateGradesInput } from './grades.schema';
import { academicPeriods } from '@/db/schema/academicPeriod';
import { ClassesService } from '@/modules/classes/classes.service';
import { enrollments } from '@/db/schema';
import { createHash } from 'crypto';

export type GradeRecord = typeof grades.$inferSelect;

export class GradesService {
  private readonly classesService = new ClassesService();

  async findAll(
    subSchoolId: string,
    filters?: {
      classId?: string;
      courseId?: string;
      academicPeriodId?: string;
      studentId?: string;
    },
  ): Promise<GradeRecord[]> {
    return db
      .select()
      .from(grades)
      .innerJoin(academicPeriods, eq(grades.academicPeriodId, academicPeriods.id))
      .where(
        and(
          eq(academicPeriods.subSchoolId, subSchoolId),
          filters?.classId ? eq(grades.classId, filters.classId) : undefined,
          filters?.courseId ? eq(grades.courseId, filters.courseId) : undefined,
          filters?.academicPeriodId
            ? eq(grades.academicPeriodId, filters.academicPeriodId)
            : undefined,
          filters?.studentId ? eq(grades.studentId, filters.studentId) : undefined,
        ),
      )
      .then((rows) => rows.map((r) => r.grades));
  }

  async ensureBulletinCanBeSigned(
    studentId: string,
    classId: string,
    academicPeriodId: string,
  ): Promise<void> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.studentId, studentId), eq(enrollments.classId, classId)));

    if (!enrollment) {
      throw new AppError('NOT_FOUND', "L'élève n'est pas inscrit dans cette classe", 404);
    }

    const expectedCourseIds = await this.classesService.getExpectedCourseIds(classId);

    if (expectedCourseIds.length === 0) {
      throw new AppError(
        'CURRICULUM_NOT_CONFIGURED',
        "Aucun cours n'est associé à cette classe (programme non configuré)",
        422,
      );
    }

    const studentGrades = await db
      .select({ courseId: grades.courseId, score: grades.score })
      .from(grades)
      .where(
        and(
          eq(grades.studentId, studentId),
          eq(grades.classId, classId),
          eq(grades.academicPeriodId, academicPeriodId),
        ),
      );

    const gradedCourseIds = new Set(
      studentGrades.filter((g) => g.score !== null).map((g) => g.courseId),
    );

    const missing = expectedCourseIds.filter((c: string) => !gradedCourseIds.has(c));

    if (missing.length > 0) {
      throw new AppError(
        'GRADES_INCOMPLETE',
        `Notes manquantes pour ${missing.length} cours sur ${expectedCourseIds.length}`,
        422,
      );
    }
  }

  async computeBulletinHash(
    studentId: string,
    classId: string,
    academicPeriodId: string,
  ): Promise<string> {
    const studentGrades = await db
      .select({
        id: grades.id,
        courseId: grades.courseId,
        gradeType: grades.gradeType,
        score: grades.score,
      })
      .from(grades)
      .where(
        and(
          eq(grades.studentId, studentId),
          eq(grades.classId, classId),
          eq(grades.academicPeriodId, academicPeriodId),
        ),
      );

    const normalized = studentGrades
      .map((g) => `${g.id}:${g.courseId}:${g.gradeType}:${g.score ?? 'null'}`)
      .sort()
      .join('|');

    return createHash('sha256').update(normalized).digest('hex');
  }

  async findById(id: string, subSchoolId: string): Promise<GradeRecord> {
    const [row] = await db
      .select()
      .from(grades)
      .innerJoin(academicPeriods, eq(grades.academicPeriodId, academicPeriods.id))
      .where(and(eq(grades.id, id), eq(academicPeriods.subSchoolId, subSchoolId)));

    if (!row) {
      throw new AppError('NOT_FOUND', 'Note introuvable', 404);
    }

    return row.grades;
  }

  async create(input: CreateGradeInput & { gradedBy: string }): Promise<GradeRecord> {
    const [period] = await db
      .select()
      .from(academicPeriods)
      .where(
        and(
          eq(academicPeriods.id, input.academicPeriodId),
          eq(academicPeriods.subSchoolId, input.subSchoolId),
        ),
      );

    if (!period) {
      throw new AppError('NOT_FOUND', 'Période académique introuvable', 404);
    }

    const [grade] = await db
      .insert(grades)
      .values({
        subSchoolId: input.subSchoolId,
        studentId: input.studentId,
        courseId: input.courseId,
        classId: input.classId,
        academicPeriodId: input.academicPeriodId,
        gradeType: input.gradeType,
        score: String(input.score),
        maxScore: String(input.maxScore ?? 20),
        coefficient: String(input.coefficient ?? 1),
        comment: input.comment ?? null,
        gradedBy: input.gradedBy,
        gradedAt: input.gradedAt ?? new Date(),
      })
      .returning();

    return grade;
  }

  async bulkCreate(
    input: BulkCreateGradesInput,
    subSchoolId: string,
    gradedBy: string,
  ): Promise<GradeRecord[]> {
    const [period] = await db
      .select()
      .from(academicPeriods)
      .where(
        and(
          eq(academicPeriods.id, input.academicPeriodId),
          eq(academicPeriods.subSchoolId, subSchoolId),
        ),
      );

    if (!period) {
      throw new AppError('NOT_FOUND', 'Période académique introuvable', 404);
    }

    const rows = input.results.map((r) => ({
      subSchoolId: subSchoolId,
      studentId: r.studentId,
      courseId: input.courseId,
      classId: input.classId,
      academicPeriodId: input.academicPeriodId,
      examId: input.examId ?? null,
      gradeType: input.gradeType,
      score: r.score !== null ? String(r.score) : null,
      maxScore: String(input.maxScore ?? 20),
      coefficient: String(input.coefficient ?? 1),
      comment: r.comment ?? null,
      gradedBy,
      gradedAt: new Date(),
    }));

    return db
      .insert(grades)
      .values(rows)
      .onConflictDoUpdate({
        target: [
          grades.studentId,
          grades.courseId,
          grades.academicPeriodId,
          grades.examId,
          grades.gradeType,
        ],
        set: {
          score: sql`excluded.score`,
          comment: sql`excluded."comment"`,
          gradedBy: sql`excluded.graded_by`,
          gradedAt: sql`excluded.graded_at`,
          updatedAt: new Date(),
        },
      })
      .returning();
  }

  async update(id: string, subSchoolId: string, input: UpdateGradeInput): Promise<GradeRecord> {
    await this.findById(id, subSchoolId);

    const [grade] = await db
      .update(grades)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(grades.id, id))
      .returning();

    return grade;
  }

  async delete(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);

    await db.delete(grades).where(eq(grades.id, id));
  }
}
