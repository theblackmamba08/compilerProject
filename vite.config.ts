import { defineConfig } from 'vitest/config';

// Le site est servi par GitHub Pages à l'adresse
// https://theblackmamba08.github.io/compilerProject/ : le chemin de base
// doit donc être le nom du dépôt (https://vite.dev/guide/static-deploy).
export default defineConfig({
  base: '/compilerProject/',
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
