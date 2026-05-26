import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { workers } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateWorkerDto, UpdateWorkerDto } from './workers.schema';

export type WorkerRecord = typeof workers.$inferSelect;

export class WorkersService {
  async findAll(subSchoolId: string): Promise<WorkerRecord[]> {
    return db
      .select()
      .from(workers)
      .where(eq(workers.subSchoolId, subSchoolId));
  }

  async findById(id: string, subSchoolId: string): Promise<WorkerRecord> {
    const [worker] = await db
      .select()
      .from(workers)
      .where(
        and(
          eq(workers.id, id),
          eq(workers.subSchoolId, subSchoolId),
        ),
      );

    if (!worker) {
      throw new AppError('NOT_FOUND', 'Employé introuvable', 404);
    }

    return worker;
  }

  async create(input: CreateWorkerDto): Promise<WorkerRecord> {
    const [worker] = await db
      .insert(workers)
      .values({
        userId: input.userId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        jobTitle: input.jobTitle,
        subSchoolId: input.subSchoolId,
      })
      .returning();

    return worker;
  }

  async update(
    id: string,
    subSchoolId: string,
    input: UpdateWorkerDto,
  ): Promise<WorkerRecord> {
    await this.findById(id, subSchoolId);

    const [worker] = await db
      .update(workers)
      .set({
        ...input,
      })
      .where(
        and(
          eq(workers.id, id),
          eq(workers.subSchoolId, subSchoolId),
        ),
      )
      .returning();

    return worker;
  }

  async remove(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);
    await db.delete(workers).where(
      and(
        eq(workers.id, id),
        eq(workers.subSchoolId, subSchoolId),
      ),
    );
  }
}
