import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` creates a normal multi-file build in dist/ (used for GitHub Pages).
// `npm run build:single` inlines everything into one HTML file in dist-single/, which
// can be sent around and opened offline with a double click.
// The version shown in the app comes from package.json. Bump it with every change:
// `npm version patch|minor|major --no-git-tag-version` (and add a line to CHANGELOG.md).
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export default defineConfig(({ mode }) => ({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(version) },
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
