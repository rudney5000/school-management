import path from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { TEST_DATABASE_URL } from './database-url';

const migrationsFolder = path.resolve(process.cwd(), 'src/db/migrations');

export default async function setup(): Promise<void> {
  const client = postgres(TEST_DATABASE_URL, { max: 1, onnotice: () => {} });

  try {
    await migrate(drizzle(client), { migrationsFolder });
  } finally {
    await client.end();
  }
}
