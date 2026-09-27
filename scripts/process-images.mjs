#!/usr/bin/env node
/**
 * Owner asset intake (docs/deployment.md §8).
 *
 *   raw-assets/<name>.{jpg,png,heic,webp,…}  →  public/images/<name>-{480,960,1440}.{avif,webp}
 *   raw-assets/resume.pdf                    →  public/resume.pdf
 *   raw-assets/links.md                      →  links in the manifest
 *
 * Writes src/content/assets.generated.ts, which the content files read, so real images and links
 * replace the placeholders automatically. sharp drops all metadata (EXIF, GPS) by default.
 */
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, basename } from 'node:path';
import sharp from 'sharp';

const ROOT = join(import.meta.dirname, '..');
const RAW = join(ROOT, 'raw-assets');
const OUT = join(ROOT, 'public', 'images');
const MANIFEST = join(ROOT, 'src', 'content', 'assets.generated.ts');
const WIDTHS = [480, 960, 1440];
const IMAGE_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
  '.heic',
  '.heif',
  '.tif',
  '.tiff',
]);

/** Expected image names and their target aspect ratio (w/h), for a friendly warning. */
const EXPECTED = {
  portrait: 4 / 5,
  'case-004-shelfsense-1': 9 / 16,
  'case-004-shelfsense-2': 9 / 16,
  'case-004-shelfsense-3': 4 / 3,
  'case-003-medscript-1': 16 / 10,
  'case-003-medscript-2': 16 / 10,
  'case-003-medscript-3': 16 / 9,
  'case-002-learntes-1': 16 / 10,
  'case-002-learntes-2': 9 / 16,
  'case-002-learntes-3': 16 / 10,
  'case-001-sentinel-1': 1,
  'case-001-sentinel-2': 1,
  'case-001-sentinel-3': 16 / 9,
  'history-edusphere': 16 / 10,
};

/**
 * Diagrams are fitted, never cropped: cutting a diagram loses information. The spare room is
 * transparent, so the frame's paper (--photo-paper) shows through in both lamp modes.
 */
const FIT = new Set(['case-003-medscript-3', 'case-001-sentinel-3']);

const LINK_KEYS = [
  'github',
  'linkedin',
  'shelfsense-github',
  'medscript-github',
  'medscript-huggingface',
  'learntes-github',
  'learntes-date',
  'learntes-aws',
  'sentinel-github',
];

async function processImage(file) {
  const name = basename(file, extname(file)).toLowerCase();
  if (!(name in EXPECTED)) {
    console.warn(`  ? skipping ${basename(file)} (unknown name — see raw-assets/README.md)`);
    return null;
  }
  const input = sharp(join(RAW, file), { failOn: 'error' }).rotate(); // honour EXIF orientation, then drop EXIF
  const meta = await input.metadata();
  const w = meta.autoOrient?.width ?? meta.width;
  const h = meta.autoOrient?.height ?? meta.height;
  const want = EXPECTED[name];
  const off = Math.abs(w / h - want) > 0.02;
  let base, cropW;
  if (FIT.has(name)) {
    // Pad (centred) to the design's aspect ratio instead of cropping.
    cropW = Math.max(w, Math.round(h * want));
    const padH = Math.max(h, Math.round(w / want));
    if (off) console.log(`  ~ ${name}: fitting ${w}×${h} into ${cropW}×${padH}`);
    // sharp always runs extend after resize, so materialise the padded image first.
    const padded = await input
      .clone()
      .ensureAlpha()
      .extend({
        left: Math.floor((cropW - w) / 2),
        right: Math.ceil((cropW - w) / 2),
        top: Math.floor((padH - h) / 2),
        bottom: Math.ceil((padH - h) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    base = sharp(padded);
  } else {
    // Crop to the design's aspect ratio (centre), so frames never letterbox.
    cropW = Math.min(w, Math.round(h * want));
    const cropH = Math.min(h, Math.round(w / want));
    if (off) console.log(`  ~ ${name}: cropping ${w}×${h} to ${cropW}×${cropH}`);
    base = input.clone().extract({
      left: Math.floor((w - cropW) / 2),
      top: Math.floor((h - cropH) / 2),
      width: cropW,
      height: cropH,
    });
  }
  // Never upscale: widths above the source collapse into one file at the source width.
  const widths = [...new Set(WIDTHS.map((width) => Math.min(width, cropW)))];
  for (const width of widths) {
    const resized = base.clone().resize({ width });
    await resized
      .clone()
      .avif({ quality: 55, effort: 5 })
      .toFile(join(OUT, `${name}-${width}.avif`));
    await resized
      .clone()
      .webp({ quality: 78 })
      .toFile(join(OUT, `${name}-${width}.webp`));
  }
  console.log(`  ✓ ${name} (${widths.join(', ')}w)`);
  return [name, widths];
}

function parseLinks(text) {
  const links = {};
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*([a-z-]+)\s*:\s*(.+?)\s*$/.exec(line);
    if (!m || !LINK_KEYS.includes(m[1])) continue;
    const value = m[2];
    if (/^e\.g\./i.test(value) || value.endsWith('...')) continue; // untouched template line
    if (m[1].endsWith('-date') || m[1].endsWith('-aws')) {
      links[m[1]] = value;
    } else if (/^https:\/\/[^\s"'<>]+$/.test(value)) {
      links[m[1]] = value;
    } else {
      console.warn(`  ? links.md: ${m[1]} must be an https:// URL — ignored`);
    }
  }
  return links;
}

async function main() {
  if (!existsSync(RAW)) throw new Error('raw-assets/ not found');
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const files = await readdir(RAW);
  console.log('Images:');
  const images = {};
  for (const f of files) {
    if (IMAGE_EXT.has(extname(f).toLowerCase())) {
      const done = await processImage(f);
      if (done) images[done[0]] = done[1];
    }
  }
  if (Object.keys(images).length === 0) console.log('  (none yet)');

  let resume = false;
  if (files.includes('resume.pdf')) {
    await copyFile(join(RAW, 'resume.pdf'), join(ROOT, 'public', 'resume.pdf'));
    resume = true;
    console.log('Résumé: copied to public/resume.pdf');
    console.warn(
      '  ! Strip PDF metadata (author, producer) and any phone/address before publishing (docs/security.md §6).',
    );
  }

  let links = {};
  if (files.includes('links.md')) {
    links = parseLinks(await readFile(join(RAW, 'links.md'), 'utf8'));
    console.log(`Links: ${Object.keys(links).length} found`);
  }

  const manifest = `// Generated by \`npm run images\` from raw-assets/. Do not edit by hand.
/** Processed image base names → the widths written to public/images/. */
export const PROCESSED_IMAGES: Readonly<Record<string, readonly number[]>> = ${JSON.stringify(images, null, 2)};
export const HAS_RESUME = ${resume};
export const OWNER_LINKS: Readonly<Record<string, string>> = ${JSON.stringify(links, null, 2)};
`;
  await writeFile(MANIFEST, manifest);
  console.log(`Wrote ${MANIFEST.replace(ROOT, '.')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
