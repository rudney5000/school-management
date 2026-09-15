import path from 'node:path';
import { defineConfig } from 'vitest/config';
import { TEST_DATABASE_URL } from './tests/setup/database-url';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/setup/global-setup.ts'],
    setupFiles: ['tests/setup/reset-db.ts'],
    // Every test file shares the same Postgres database and truncates it
    // between tests, so they must not run concurrently.
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DATABASE_URL,
      JWT_ACCESS_SECRET: 'test-access-secret-not-a-real-secret-0000',
      JWT_REFRESH_SECRET: 'test-refresh-secret-not-a-real-secret-000',
      ALLOWED_ORIGINS: 'http://localhost:5173',
      MINIO_ENDPOINT: 'http://localhost:9000',
      MINIO_ROOT_USER: 'test',
      MINIO_ROOT_PASSWORD: 'test',
      MINIO_BUCKET_NAME: 'test',
      LIVEKIT_URL: 'http://localhost:7880',
      LIVEKIT_API_KEY: 'test',
      LIVEKIT_API_SECRET: 'test',
    },
  },
});
