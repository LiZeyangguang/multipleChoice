import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // Include default patterns under src
    include: ['src/**/*.{test,spec}.?(c|m)js?(x)'],
    globals: true,
  },
});
