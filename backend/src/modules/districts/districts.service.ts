import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { cities, districts } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {
  CreateDistrictDto,
  DistrictListQueryDto,
  UpdateDistrictDto,
} from './districts.schema';

export type DistrictRecord = typeof districts.$inferSelect;

export class DistrictsService {
  async findAll(query: DistrictListQueryDto): Promise<DistrictRecord[]> {
    if (query.cityId) {
      return db.select().from(districts).where(eq(districts.cityId, query.cityId));
    }

    return db.select().from(districts);
  }

  async findById(id: string): Promise<DistrictRecord> {
    const [district] = await db
      .select()
      .from(districts)
      .where(eq(districts.id, id));

    if (!district) {
      throw new AppError('NOT_FOUND', 'Quartier introuvable', 404);
    }

    return district;
  }

  private async assertCityExists(cityId: string): Promise<void> {
    const [city] = await db
      .select({ id: cities.id })
      .from(cities)
      .where(eq(cities.id, cityId));

    if (!city) {
      throw new AppError('NOT_FOUND', 'Ville introuvable', 404);
    }
  }

  async create(input: CreateDistrictDto): Promise<DistrictRecord> {
    await this.assertCityExists(input.cityId);

    const [district] = await db
      .insert(districts)
      .values({
        name: input.name,
        cityId: input.cityId,
      })
      .returning();

    return district;
  }

  async update(id: string, input: UpdateDistrictDto): Promise<DistrictRecord> {
    await this.findById(id);

    if (input.cityId) {
      await this.assertCityExists(input.cityId);
    }

    const [district] = await db
      .update(districts)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(districts.id, id))
      .returning();

    return district;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await db.delete(districts).where(eq(districts.id, id));
  }
}
