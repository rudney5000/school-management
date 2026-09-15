import { eq, and, getTableColumns, SQL } from 'drizzle-orm';
import { db } from '@/db';
import { attachments, classes, enrollments, students } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateEnrollmentDto } from './enrollments.schema';

const REQUIRED_ENROLLMENT_CATEGORIES = [
  'birth_certificate',
  'medical_certificate',
  'previous_report',
  'student_photo',
] as const;

export type EnrollmentRecord = typeof enrollments.$inferSelect;

export class EnrollmentsService {
  async findAll(
    subSchoolId: string,
    filters: { classId?: string; studentId?: string },
  ): Promise<EnrollmentRecord[]> {
    const conditions: SQL[] = [eq(students.subSchoolId, subSchoolId)];
    if (filters.classId) conditions.push(eq(enrollments.classId, filters.classId));
    if (filters.studentId) conditions.push(eq(enrollments.studentId, filters.studentId));

    return db
      .select(getTableColumns(enrollments))
      .from(enrollments)
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .where(and(...conditions));
  }

  async findById(id: string, subSchoolId: string): Promise<EnrollmentRecord> {
    const [enrollment] = await db
      .select(getTableColumns(enrollments))
      .from(enrollments)
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .where(and(eq(enrollments.id, id), eq(students.subSchoolId, subSchoolId)));

    if (!enrollment) {
      throw new AppError('NOT_FOUND', 'Inscription introuvable', 404);
    }

    return enrollment;
  }

  /**
   * Lookup with no tenant filter, for the signature flow which establishes its
   * own scope. Never reachable straight from an HTTP handler.
   */
  async findByIdUnscoped(id: string): Promise<EnrollmentRecord> {
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id));

    if (!enrollment) {
      throw new AppError('NOT_FOUND', 'Inscription introuvable', 404);
    }

    return enrollment;
  }

  async create(input: CreateEnrollmentDto, subSchoolId: string): Promise<EnrollmentRecord> {
    const [student] = await db
      .select({ id: students.id })
      .from(students)
      .where(and(eq(students.id, input.studentId), eq(students.subSchoolId, subSchoolId)))
      .limit(1);

    if (!student) {
      throw new AppError('NOT_FOUND', 'Élève introuvable', 404);
    }

    const [klass] = await db
      .select({ id: classes.id })
      .from(classes)
      .where(and(eq(classes.id, input.classId), eq(classes.subSchoolId, subSchoolId)))
      .limit(1);

    if (!klass) {
      throw new AppError('NOT_FOUND', 'Classe introuvable', 404);
    }

    const [enrollment] = await db
      .insert(enrollments)
      .values({
        studentId: input.studentId,
        classId: input.classId,
      })
      .returning();

    return enrollment;
  }

  async remove(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);
    await db.delete(enrollments).where(eq(enrollments.id, id));
  }

  async ensureEnrollmentCanBeSigned(enrollmentId: string): Promise<EnrollmentRecord> {
    const enrollment = await this.findByIdUnscoped(enrollmentId);
    const docsState = await this.getRequiredDocumentsState(enrollmentId);

    const missing = docsState.filter((d) => d.status === 'missing').map((d) => d.category);

    if (missing.length > 0) {
      throw new AppError(
        'DOCUMENTS_INCOMPLETE',
        `Pièces manquantes ou non validées : ${missing.join(', ')}`,
        422,
      );
    }

    return enrollment;
  }

  async getSignableSnapshot(enrollmentId: string) {
    const enrollment = await this.findByIdUnscoped(enrollmentId);
    const docsState = await this.getRequiredDocumentsState(enrollmentId);

    return { enrollment, docsState };
  }

  private async getRequiredDocumentsState(enrollmentId: string) {
    const docs = await db
      .select({
        id: attachments.id,
        category: attachments.category,
        status: attachments.status,
      })
      .from(attachments)
      .where(
        and(
          eq(attachments.attachableType, 'enrollment'),
          eq(attachments.attachableId, enrollmentId),
        ),
      );

    return REQUIRED_ENROLLMENT_CATEGORIES.map((category) => {
      const match = docs.find((d) => d.category === category && d.status === 'validated');
      return {
        category,
        attachmentId: match?.id ?? null,
        status: match ? 'validated' : 'missing',
      };
    });
  }
}
