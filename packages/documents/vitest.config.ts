import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    // The first React-PDF render loads the fonts and takes a few seconds.
    testTimeout: 20_000,
  },
});
