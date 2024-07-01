/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    watch: false,
    globals: true,
    setupFiles: ['./setupTests.ts'],
    environment: 'node',
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      reporter: ['text-summary', 'lcov', 'html'],
      include: ['src/**'],
    },
  },
});
