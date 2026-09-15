import { sql } from 'drizzle-orm';
import { afterAll, beforeEach } from 'vitest';
import { client, db } from '@/db';

let resetStatement: string | null = null;

beforeEach(async () => {
  if (resetStatement === null) {
    const tables = await db.execute<{ tablename: string }>(
      sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
    );

    // DELETE rather than TRUNCATE: truncating 45 tables costs ~8s in fsyncs,
    // against ~3ms here. Suspending FK triggers lets the tables go in any order.
    const deletes = tables.map((row) => `DELETE FROM "public"."${row.tablename}";`).join(' ');
    resetStatement = deletes
      ? `SET session_replication_role = replica; ${deletes} SET session_replication_role = origin;`
      : '';
  }

  if (resetStatement) {
    await db.execute(sql.raw(resetStatement));
  }
});

afterAll(async () => {
  await client.end();
});
