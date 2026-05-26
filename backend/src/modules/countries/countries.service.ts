import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { countries } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateCountryDto, UpdateCountryDto } from './countries.schema';

export type CountryRecord = typeof countries.$inferSelect;

export class CountriesService {
  async findAll(): Promise<CountryRecord[]> {
    return db.select().from(countries);
  }

  async findById(id: string): Promise<CountryRecord> {
    const [country] = await db
      .select()
      .from(countries)
      .where(eq(countries.id, id));

    if (!country) {
      throw new AppError('NOT_FOUND', 'Pays introuvable', 404);
    }

    return country;
  }

  async create(input: CreateCountryDto): Promise<CountryRecord> {
    const [existing] = await db
      .select({ id: countries.id })
      .from(countries)
      .where(eq(countries.code, input.code));

    if (existing) {
      throw new AppError('CONFLICT', 'Ce code pays est déjà utilisé', 409);
    }

    const [country] = await db
      .insert(countries)
      .values({
        name: input.name,
        code: input.code,
      })
      .returning();

    return country;
  }

  async update(id: string, input: UpdateCountryDto): Promise<CountryRecord> {
    await this.findById(id);

    if (input.code) {
      const [existing] = await db
        .select({ id: countries.id })
        .from(countries)
        .where(eq(countries.code, input.code));

      if (existing && existing.id !== id) {
        throw new AppError('CONFLICT', 'Ce code pays est déjà utilisé', 409);
      }
    }

    const [country] = await db
      .update(countries)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(countries.id, id))
      .returning();

    return country;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await db.delete(countries).where(eq(countries.id, id));
  }
}
