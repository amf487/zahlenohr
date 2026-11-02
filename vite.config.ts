import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` creates a normal multi-file build in dist/ (used for GitHub Pages).
// `npm run build:single` inlines everything into one HTML file in dist-single/, which
// can be sent around and opened offline with a double click.
export default defineConfig(({ mode }) => ({
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    emptyOutDir: true,
  },
  plugins: mode === 'single' ? [viteSingleFile()] : [],
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
}));
