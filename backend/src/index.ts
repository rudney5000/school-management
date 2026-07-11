import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import {createServer} from "node:http";
import {initSocketServer} from "@/socket/socket";
import path from "node:path";

async function bootstrap(): Promise<void> {

  if (env.NODE_ENV === 'production') {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: path.join(process.cwd(), 'migrations') });
    console.log('✓ Migrations done');
  }

  await db.execute(sql`SELECT 1`);
  console.log('✓ Database connected');

  const app = createApp();
  const httpServer = createServer(app)

  initSocketServer(httpServer)
  const port = process.env.PORT || env.PORT_BACKEND

  httpServer.listen(port, () => {
    console.log(`✓ Server running on port ${port}`);
    console.log(`  Health  → http://localhost:${port}/health`);
    console.log(`  API     → http://localhost:${port}/api`);
    console.log(`  Env     → ${env.NODE_ENV}`);
  });
}

bootstrap().catch((err) => {
  console.error('✗ Failed to start server:', err);
  process.exit(1);
});