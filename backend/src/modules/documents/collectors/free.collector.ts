import { eq } from 'drizzle-orm';
import type { Collector } from '@school-hub/documents';
import { db } from '@/db';
import { cities, districts, schools, subSchools } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';

/**
 * A free document only needs its school: its text and field values come from
 * the template and from the person issuing.
 */
export class FreeDocumentCollector implements Collector {
  async collect(_params: unknown, ctx: { subSchoolId: string }) {
    const [school] = await db
      .select({ name: subSchools.name, code: subSchools.code, city: cities.name })
      .from(subSchools)
      .innerJoin(schools, eq(schools.id, subSchools.schoolId))
      .innerJoin(districts, eq(districts.id, schools.districtId))
      .innerJoin(cities, eq(cities.id, districts.cityId))
      .where(eq(subSchools.id, ctx.subSchoolId));
    if (!school) throw new AppError('NOT_FOUND', 'École introuvable', 404);
    return { school, fields: {} };
  }
}
