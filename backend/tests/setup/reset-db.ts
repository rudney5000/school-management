import { sql } from 'drizzle-orm';
import { afterAll, beforeEach } from 'vitest';
import { client, db } from '@/db';

beforeEach(async () => {
  const tables = await db.execute<{ tablename: string }>(
    sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  );

  if (tables.length === 0) {
    return;
  }

  const identifiers = tables.map((row) => `"public"."${row.tablename}"`).join(', ');
  await db.execute(sql.raw(`TRUNCATE TABLE ${identifiers} RESTART IDENTITY CASCADE`));
});

afterAll(async () => {
  await client.end();
});
