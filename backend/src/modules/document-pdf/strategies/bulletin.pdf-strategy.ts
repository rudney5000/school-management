import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { grades, classes, academicPeriods, students, courses, subSchools } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import { BulletinDocument } from '@school-hub/pdf-templates';
import type { DocumentPdfStrategy } from '@/modules/document-pdf/document-pdf.schema';

export const bulletinPdfStrategy: DocumentPdfStrategy<'bulletin'> = {
  async buildDocument({ subSchoolId, classId, studentId, academicPeriodId }, locale, signature) {
    const [subSchool] = await db.select().from(subSchools).where(eq(subSchools.id, subSchoolId));
    const [classRow] = await db.select().from(classes).where(eq(classes.id, classId));
    const [periodRow] = await db
      .select()
      .from(academicPeriods)
      .where(eq(academicPeriods.id, academicPeriodId));
    const [student] = await db.select().from(students).where(eq(students.id, studentId));

    if (!subSchool) {
      throw new AppError('NOT_FOUND', 'École introuvable', 404);
    }
    if (!student) {
      throw new AppError('NOT_FOUND', 'Élève introuvable', 404);
    }

    const studentGrades = await db
      .select({
        courseName: courses.name,
        score: grades.score,
        maxScore: grades.maxScore,
        coefficient: grades.coefficient,
      })
      .from(grades)
      .innerJoin(courses, eq(grades.courseId, courses.id))
      .where(
        and(
          eq(grades.studentId, studentId),
          eq(grades.classId, classId),
          eq(grades.academicPeriodId, academicPeriodId),
        ),
      );

    return BulletinDocument({
      locale,
      schoolName: subSchool.name,
      studentFullName: `${student.firstName} ${student.lastName}`,
      className: classRow?.name ?? '—',
      academicPeriodLabel: periodRow?.name ?? '—',
      rows: studentGrades.map((g) => ({
        course: g.courseName,
        score: g.score ?? '-',
        maxScore: g.maxScore,
        coefficient: g.coefficient,
      })),
      signature,
    });
  },
};
