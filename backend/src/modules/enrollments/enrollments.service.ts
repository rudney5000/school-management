import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { enrollments } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateEnrollmentDto } from './enrollments.schema';

export type EnrollmentRecord = typeof enrollments.$inferSelect;

export class EnrollmentsService {
  async findAll(): Promise<EnrollmentRecord[]> {
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
}
