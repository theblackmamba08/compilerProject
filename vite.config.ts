import { defineConfig } from 'vitest/config';

// Adresse principale : https://wordwizard.cabrelfosso.com/ (Cloudflare Pages), servie à la racine.
// Le miroir GitHub Pages (https://theblackmamba08.github.io/compilerProject/) est construit
// avec BASE_PATH=/compilerProject/ dans .github/workflows/deploy.yml.
// Voir https://vite.dev/guide/static-deploy
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
