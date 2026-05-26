import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { subSchools } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateSubSchoolDto, UpdateSubSchoolDto } from './sub-schools.schema';

export type SubSchoolRecord = typeof subSchools.$inferSelect;

export class SubSchoolsService {
  async findAll(schoolId: string): Promise<SubSchoolRecord[]> {
    return db
      .select()
      .from(subSchools)
      .where(eq(subSchools.schoolId, schoolId));
  }

  async findById(id: string, schoolId: string): Promise<SubSchoolRecord> {
    const [subSchool] = await db
      .select()
      .from(subSchools)
      .where(
        and(
          eq(subSchools.id, id),
          eq(subSchools.schoolId, schoolId),
        ),
      );

    if (!subSchool) {
      throw new AppError('NOT_FOUND', 'Sous-école introuvable', 404);
    }

    return subSchool;
  }

  async create(input: CreateSubSchoolDto): Promise<SubSchoolRecord> {
    const [subSchool] = await db
      .insert(subSchools)
      .values({
        name: input.name,
        code: input.code,
        email: input.email,
        phone: input.phone,
        address: input.address,
        logo: input.logo,
        schoolId: input.schoolId,
      })
      .returning();

    return subSchool;
  }

  async update(
    id: string,
    schoolId: string,
    input: UpdateSubSchoolDto,
  ): Promise<SubSchoolRecord> {
    await this.findById(id, schoolId);

    const [subSchool] = await db
      .update(subSchools)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(subSchools.id, id),
          eq(subSchools.schoolId, schoolId),
        ),
      )
      .returning();

    return subSchool;
  }

  async remove(id: string, schoolId: string): Promise<void> {
    await this.findById(id, schoolId);
    await db.delete(subSchools).where(
      and(
        eq(subSchools.id, id),
        eq(subSchools.schoolId, schoolId),
      ),
    );
  }
}
