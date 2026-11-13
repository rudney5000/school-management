import { and, eq, inArray } from 'drizzle-orm';
import type { AssetFile, AssetStore, FileStore } from '@school-hub/documents';
import { db } from '@/db';
import { templateAssets } from '@/db/schema';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Rows in template_assets, bytes in S3. */
export class DrizzleAssetStore implements AssetStore {
  constructor(private readonly files: FileStore) {}

  async listIds(schoolId: string) {
    const rows = await db
      .select({ id: templateAssets.id })
      .from(templateAssets)
      .where(eq(templateAssets.schoolId, schoolId));
    return new Set(rows.map((row) => row.id));
  }

  async load(schoolId: string, ids: readonly string[]) {
    // A malformed id would make Postgres reject the whole uuid query.
    const valid = ids.filter((id) => UUID.test(id));
    const result = new Map<string, AssetFile>();
    if (valid.length === 0) return result;

    const rows = await db
      .select({ id: templateAssets.id, key: templateAssets.s3Key, mime: templateAssets.mime })
      .from(templateAssets)
      .where(and(eq(templateAssets.schoolId, schoolId), inArray(templateAssets.id, valid)));
    await Promise.all(
      rows.map(async (row) => {
        result.set(row.id, { data: await this.files.get(row.key), mime: row.mime });
      }),
    );
    return result;
  }
}
