import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';
import { db } from './db';
import { sql } from 'drizzle-orm';

async function bootstrap(): Promise<void> {
  await db.execute(sql`SELECT 1`);
  console.log('✓ Database connected');

  const app = createApp();

  app.listen(env.PORT_BACKEND, () => {
    console.log(`✓ Server running on port ${env.PORT_BACKEND}`);
    console.log(`  Health  → http://localhost:${env.PORT_BACKEND}/health`);
    console.log(`  API     → http://localhost:${env.PORT_BACKEND}/api`);
    console.log(`  Env     → ${env.NODE_ENV}`);
  });
}

bootstrap().catch((err) => {
  console.error('✗ Failed to start server:', err);
  process.exit(1);
});