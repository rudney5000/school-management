import {
  eq,
  and
} from 'drizzle-orm';
import { db } from '@/db';
import {
  attachments,
  enrollments
} from '@/db/schema';
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
  async findAll(classId?: string): Promise<EnrollmentRecord[]> {
    if (classId) {
      return db.select().from(enrollments).where(eq(enrollments.classId, classId));
    }
    return db.select().from(enrollments);
  }

  async findById(id: string): Promise<EnrollmentRecord> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, id));

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

    const docs = await db
        .select({ category: attachments.category, status: attachments.status })
        .from(attachments)
        .where(
            and(
                eq(attachments.attachableType, 'enrollment'),
                eq(attachments.attachableId, enrollmentId),
            ),
        );

    const validatedCategories = new Set(
        docs.filter((d) => d.status === 'validated').map((d) => d.category),
    );

    const missing = REQUIRED_ENROLLMENT_CATEGORIES.filter((c) => !validatedCategories.has(c));

    if (missing.length > 0) {
      throw new AppError(
          'DOCUMENTS_INCOMPLETE',
          `Pièces manquantes ou non validées : ${missing.join(', ')}`,
          422,
      );
    }

    return enrollment;
  }
}
