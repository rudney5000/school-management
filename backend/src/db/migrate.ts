import path from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Deliberately reads DATABASE_URL directly instead of the validated env module:
// applying migrations must not depend on MinIO or LiveKit being configured.
const databaseUrl = process.env.DATABASE_URL;

// In the production image the migrations sit next to the app (see Dockerfile),
// which is why this defaults to ./migrations rather than src/db/migrations.
const migrationsFolder = process.env.MIGRATIONS_DIR ?? path.resolve(process.cwd(), 'migrations');

async function main(): Promise<void> {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run migrations');
  }

  const client = postgres(databaseUrl, { max: 1, onnotice: () => {} });

  try {
    await migrate(drizzle(client), { migrationsFolder });
    console.log(`✓ Migrations applied from ${migrationsFolder}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('✗ Migration failed:', error);
  process.exit(1);
});
