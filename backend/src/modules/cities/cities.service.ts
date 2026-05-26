import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { cities, departments } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CityListQueryDto, CreateCityDto, UpdateCityDto } from './cities.schema';

export type CityRecord = typeof cities.$inferSelect;

export class CitiesService {
  async findAll(query: CityListQueryDto): Promise<CityRecord[]> {
    if (query.departmentId) {
      return db
        .select()
        .from(cities)
        .where(eq(cities.departmentId, query.departmentId));
    }

    return db.select().from(cities);
  }

  async findById(id: string): Promise<CityRecord> {
    const [city] = await db.select().from(cities).where(eq(cities.id, id));

    if (!city) {
      throw new AppError('NOT_FOUND', 'Ville introuvable', 404);
    }

    return city;
  }

  private async assertDepartmentExists(departmentId: string): Promise<void> {
    const [department] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.id, departmentId));

    if (!department) {
      throw new AppError('NOT_FOUND', 'Département introuvable', 404);
    }
  }

  async create(input: CreateCityDto): Promise<CityRecord> {
    await this.assertDepartmentExists(input.departmentId);

    const [city] = await db
      .insert(cities)
      .values({
        name: input.name,
        departmentId: input.departmentId,
      })
      .returning();

    return city;
  }

  async update(id: string, input: UpdateCityDto): Promise<CityRecord> {
    await this.findById(id);

    if (input.departmentId) {
      await this.assertDepartmentExists(input.departmentId);
    }

    const [city] = await db
      .update(cities)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(cities.id, id))
      .returning();

    return city;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await db.delete(cities).where(eq(cities.id, id));
  }
}
