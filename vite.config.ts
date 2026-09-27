/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Preload the two primary font files (DM Serif Display 400, IBM Plex Sans 400) once their
 * hashed names are known (docs/architecture.md §6).
 */
function preloadPrimaryFonts(): Plugin {
  const wanted = [
    /dm-serif-display-latin-400-normal.*\.woff2$/,
    /ibm-plex-sans-latin-400-normal.*\.woff2$/,
  ];
  return {
    name: 'preload-primary-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return [];
        return Object.keys(ctx.bundle)
          .filter((file) => wanted.some((re) => re.test(file)))
          .map((file) => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              href: `/${file}`,
              crossorigin: '',
            },
            injectTo: 'head' as const,
          }));
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), preloadPrimaryFonts()],
  build: {
    target: 'es2022',
    rollupOptions: {
      // 404.html is served by Cloudflare Pages for unknown paths.
      input: { main: 'index.html', notFound: '404.html' },
    },
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      'shared/**/*.test.ts',
      'functions/**/*.test.ts',
      'tests/unit/**/*.test.ts',
    ],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    restoreMocks: true,
  },
});
