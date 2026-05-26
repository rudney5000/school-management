import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { parents } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateParentDto, UpdateParentDto } from './parents.schema';

export type ParentRecord = typeof parents.$inferSelect;

export class ParentsService {
  async findAll(subSchoolId: string): Promise<ParentRecord[]> {
    return db
      .select()
      .from(parents)
      .where(eq(parents.subSchoolId, subSchoolId));
  }

  async findById(id: string, subSchoolId: string): Promise<ParentRecord> {
    const [parent] = await db
      .select()
      .from(parents)
      .where(
        and(
          eq(parents.id, id),
          eq(parents.subSchoolId, subSchoolId),
        ),
      );

    if (!parent) {
      throw new AppError('NOT_FOUND', 'Parent introuvable', 404);
    }

    return parent;
  }

  async create(input: CreateParentDto): Promise<ParentRecord> {
    const [parent] = await db
      .insert(parents)
      .values({
        userId: input.userId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        subSchoolId: input.subSchoolId,
      })
      .returning();

    return parent;
  }

  async update(
    id: string,
    subSchoolId: string,
    input: UpdateParentDto,
  ): Promise<ParentRecord> {
    await this.findById(id, subSchoolId);

    const [parent] = await db
      .update(parents)
      .set({
        ...input,
      })
      .where(
        and(
          eq(parents.id, id),
          eq(parents.subSchoolId, subSchoolId),
        ),
      )
      .returning();

    return parent;
  }

  async remove(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);
    await db.delete(parents).where(
      and(
        eq(parents.id, id),
        eq(parents.subSchoolId, subSchoolId),
      ),
    );
  }
}
