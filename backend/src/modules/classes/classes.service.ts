import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { classes } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateClassDto, UpdateClassDto } from './classes.schema';

export type ClassRecord = typeof classes.$inferSelect;

export class ClassesService {
  async findAll(subSchoolId: string): Promise<ClassRecord[]> {
    return db
      .select()
      .from(classes)
      .where(eq(classes.subSchoolId, subSchoolId));
  }

  async findById(id: string, subSchoolId: string): Promise<ClassRecord> {
    const [classRecord] = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.id, id),
          eq(classes.subSchoolId, subSchoolId),
        ),
      );

    if (!classRecord) {
      throw new AppError('NOT_FOUND', 'Classe introuvable', 404);
    }

    return classRecord;
  }

  async create(input: CreateClassDto): Promise<ClassRecord> {
    const [classRecord] = await db
      .insert(classes)
      .values({
        name: input.name,
        gradeLevel: input.gradeLevel,
        capacity: input.capacity,
        subSchoolId: input.subSchoolId,
      })
      .returning();

    return classRecord;
  }

  async update(
    id: string,
    subSchoolId: string,
    input: UpdateClassDto,
  ): Promise<ClassRecord> {
    await this.findById(id, subSchoolId);

    const [classRecord] = await db
      .update(classes)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(classes.id, id),
          eq(classes.subSchoolId, subSchoolId),
        ),
      )
      .returning();

    return classRecord;
  }

  async remove(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);
    await db.delete(classes).where(
      and(
        eq(classes.id, id),
        eq(classes.subSchoolId, subSchoolId),
      ),
    );
  }
}
