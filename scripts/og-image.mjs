#!/usr/bin/env node
/**
 * Renders public/og-image.png (1200×630) from the built hero, so the preview card uses the real
 * fonts and folder. Needs a running preview: `npm run build && npx vite preview --port 4173`.
 * Re-run after the portrait arrives. Set PW_CHANNEL=chrome to use the installed Chrome.
 */
import { chromium } from '@playwright/test';
import { join } from 'node:path';

const url = process.env.OG_URL ?? 'http://localhost:4173/?intro=0';
const out = join(import.meta.dirname, '..', 'public', 'og-image.png');

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  reducedMotion: 'reduce',
});
await page.goto(url, { waitUntil: 'networkidle' });
await page.addStyleTag({
  content: 'header{display:none!important} #top{padding-top:44px!important}',
});
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log(`Wrote ${out}`);
