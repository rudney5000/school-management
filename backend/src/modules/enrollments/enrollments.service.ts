import { eq, and, SQL } from 'drizzle-orm';
import { db } from '@/db';
import { attachments, enrollments } from '@/db/schema';
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
  async findAll(filters: { classId?: string; studentId?: string }): Promise<EnrollmentRecord[]> {
    const conditions: SQL[] = [];
    if (filters.classId) conditions.push(eq(enrollments.classId, filters.classId));
    if (filters.studentId) conditions.push(eq(enrollments.studentId, filters.studentId));

    if (conditions.length === 0) {
      return db.select().from(enrollments);
    }
    return db
      .select()
      .from(enrollments)
      .where(and(...conditions));
  }

  async findById(id: string): Promise<EnrollmentRecord> {
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id));

    if (!enrollment) {
      throw new AppError('NOT_FOUND', 'Inscription introuvable', 404);
    }

    return enrollment;
  }

  async create(input: CreateEnrollmentDto): Promise<EnrollmentRecord> {
    const [enrollment] = await db
      .insert(enrollments)
      .values({
        studentId: input.studentId,
        classId: input.classId,
      })
      .returning();

    return enrollment;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await db.delete(enrollments).where(eq(enrollments.id, id));
  }

  async ensureEnrollmentCanBeSigned(enrollmentId: string): Promise<EnrollmentRecord> {
    const enrollment = await this.findById(enrollmentId);
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
    const enrollment = await this.findById(enrollmentId);
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
