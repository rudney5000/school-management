import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { countries, departments } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {
  CreateDepartmentDto,
  DepartmentListQueryDto,
  UpdateDepartmentDto,
} from './departments.schema';

export type DepartmentRecord = typeof departments.$inferSelect;

export class DepartmentsService {
  async findAll(query: DepartmentListQueryDto): Promise<DepartmentRecord[]> {
    const conditions = query.countryId
      ? eq(departments.countryId, query.countryId)
      : undefined;

    if (conditions) {
      return db.select().from(departments).where(conditions);
    }

    return db.select().from(departments);
  }

  async findById(id: string): Promise<DepartmentRecord> {
    const [department] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, id));

    if (!department) {
      throw new AppError('NOT_FOUND', 'Département introuvable', 404);
    }

    return department;
  }

  private async assertCountryExists(countryId: string): Promise<void> {
    const [country] = await db
      .select({ id: countries.id })
      .from(countries)
      .where(eq(countries.id, countryId));

    if (!country) {
      throw new AppError('NOT_FOUND', 'Pays introuvable', 404);
    }
  }

  async create(input: CreateDepartmentDto): Promise<DepartmentRecord> {
    await this.assertCountryExists(input.countryId);

    const [department] = await db
      .insert(departments)
      .values({
        name: input.name,
        code: input.code,
        countryId: input.countryId,
      })
      .returning();

    return department;
  }

  async update(id: string, input: UpdateDepartmentDto): Promise<DepartmentRecord> {
    await this.findById(id);

    if (input.countryId) {
      await this.assertCountryExists(input.countryId);
    }

    const [department] = await db
      .update(departments)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(departments.id, id))
      .returning();

    return department;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await db.delete(departments).where(eq(departments.id, id));
  }
}
