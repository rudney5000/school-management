import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { schools } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateSchoolDto, UpdateSchoolDto } from './schools.schema';

export type SchoolRecord = typeof schools.$inferSelect;

export class SchoolsService {
  async findAll(districtId?: string): Promise<SchoolRecord[]> {
    if (districtId) {
      return db
        .select()
        .from(schools)
        .where(eq(schools.districtId, districtId));
    }
    return db.select().from(schools);
  }

  async findById(id: string): Promise<SchoolRecord> {
    const [school] = await db
      .select()
      .from(schools)
      .where(eq(schools.id, id));

    if (!school) {
      throw new AppError('NOT_FOUND', 'École introuvable', 404);
    }

    return school;
  }

  async create(input: CreateSchoolDto): Promise<SchoolRecord> {
    const [school] = await db
      .insert(schools)
      .values({
        name: input.name,
        code: input.code,
        email: input.email,
        phone: input.phone,
        address: input.address,
        logo: input.logo,
        districtId: input.districtId,
      })
      .returning();

    return school;
  }

  async update(id: string, input: UpdateSchoolDto): Promise<SchoolRecord> {
    await this.findById(id);

    const [school] = await db
      .update(schools)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(schools.id, id))
      .returning();

    return school;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await db.delete(schools).where(eq(schools.id, id));
  }
}
