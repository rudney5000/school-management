import { and, asc, eq, max, sql, sum } from 'drizzle-orm';
import type { BulletinPayload, Collector } from '@school-hub/documents';
import { db } from '@/db';
import {
  academicPeriods,
  cities,
  classes,
  courses,
  districts,
  grades,
  schools,
  students,
  subSchools,
} from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import { GradesService } from '@/modules/grades/grades.service';

interface BulletinParams {
  studentId: string;
  classId: string;
  academicPeriodId: string;
}

const notFound = (what: string) => new AppError('NOT_FOUND', `${what} introuvable`, 404);

/** "2025-2026" for a period starting in September 2025, or in March 2026. */
export function schoolYearOf(start: Date): string {
  const year = start.getUTCFullYear();
  const first = start.getUTCMonth() >= 7 ? year : year - 1;
  return `${first}-${first + 1}`;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Ranks by percentage, equal results share a position (1, 2, 2, 4).
 * `totals` holds every student of the class who has grades in the period.
 */
export function rankOf(
  studentId: string,
  totals: { studentId: string; obtained: number; max: number }[],
): { position: number; of: number } | null {
  const percent = (t: { obtained: number; max: number }) => (t.max > 0 ? t.obtained / t.max : 0);
  const own = totals.find((t) => t.studentId === studentId);
  if (!own) return null;
  const ahead = totals.filter((t) => percent(t) > percent(own)).length;
  return { position: ahead + 1, of: totals.length };
}

/**
 * Reads the bulletin of one student for one period. Every id is checked
 * against the sub-school the document is issued for: an id of another school
 * reads as not found.
 */
export class BulletinCollector implements Collector<BulletinParams, BulletinPayload> {
  private readonly grades = new GradesService();

  async collect(params: BulletinParams, ctx: { subSchoolId: string }): Promise<BulletinPayload> {
    const { studentId, classId, academicPeriodId } = params;
    const { subSchoolId } = ctx;

    const [school] = await db
      .select({
        name: subSchools.name,
        code: subSchools.code,
        city: cities.name,
      })
      .from(subSchools)
      .innerJoin(schools, eq(schools.id, subSchools.schoolId))
      .innerJoin(districts, eq(districts.id, schools.districtId))
      .innerJoin(cities, eq(cities.id, districts.cityId))
      .where(eq(subSchools.id, subSchoolId));
    if (!school) throw notFound('École');

    const [student] = await db
      .select()
      .from(students)
      .where(and(eq(students.id, studentId), eq(students.subSchoolId, subSchoolId)));
    if (!student) throw notFound('Élève');

    const [classRow] = await db
      .select()
      .from(classes)
      .where(and(eq(classes.id, classId), eq(classes.subSchoolId, subSchoolId)));
    if (!classRow) throw notFound('Classe');

    const [period] = await db
      .select()
      .from(academicPeriods)
      .where(
        and(eq(academicPeriods.id, academicPeriodId), eq(academicPeriods.subSchoolId, subSchoolId)),
      );
    if (!period) throw notFound('Période');

    // Enrolled in the class, and a grade for every course of its curriculum.
    await this.grades.ensureBulletinCanBeSigned(studentId, classId, academicPeriodId);

    // Several grades of one course (tests, exams) add up to one line.
    const rows = await db
      .select({
        course: courses.name,
        score: sum(grades.score),
        max: sum(grades.maxScore),
        coefficient: max(grades.coefficient),
      })
      .from(grades)
      .innerJoin(courses, eq(courses.id, grades.courseId))
      .where(
        and(
          eq(grades.studentId, studentId),
          eq(grades.classId, classId),
          eq(grades.academicPeriodId, academicPeriodId),
        ),
      )
      .groupBy(courses.id, courses.name)
      .orderBy(asc(courses.name));

    const classTotals = await db
      .select({
        studentId: grades.studentId,
        obtained: sql<string>`coalesce(sum(${grades.score}), 0)`,
        max: sql<string>`sum(${grades.maxScore})`,
      })
      .from(grades)
      .where(and(eq(grades.classId, classId), eq(grades.academicPeriodId, academicPeriodId)))
      .groupBy(grades.studentId);

    const lines = rows.map((row) => ({
      course: row.course,
      score: row.score === null ? null : Number(row.score),
      max: Number(row.max),
      coefficient: Number(row.coefficient ?? 1),
    }));
    const obtained = lines.reduce((total, line) => total + (line.score ?? 0), 0);
    const maxTotal = lines.reduce((total, line) => total + line.max, 0);

    return {
      school: { name: school.name, code: school.code, city: school.city, headName: null },
      student: {
        fullName: `${student.firstName} ${student.lastName}`,
        birthDate: student.dateOfBirth,
        gender: student.gender === 'female' ? 'F' : 'M',
        matricule: null,
      },
      class: { name: classRow.name, level: classRow.gradeLevel ?? classRow.name },
      period: { name: period.name, schoolYear: schoolYearOf(period.startDate) },
      rows: lines,
      totals: {
        obtained: round1(obtained),
        max: maxTotal,
        percent: maxTotal > 0 ? round1((obtained / maxTotal) * 100) : 0,
      },
      rank: rankOf(
        studentId,
        classTotals.map((t) => ({
          studentId: t.studentId,
          obtained: Number(t.obtained),
          max: Number(t.max),
        })),
      ),
      // Set by the school's rules (deliberation), not computed here.
      mention: null,
      decision: null,
    };
  }
}
