/**
 * Guards the CLAUDE.md design rules: components carry no raw colors or easing curves, the JS
 * easings mirror tokens.css, no raw-HTML escape hatches, and every external link is safe.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EASE } from '../../src/lib/motion';

const ROOT = join(import.meta.dirname, '..', '..');
const SRC = join(ROOT, 'src');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(SRC);
const read = (p: string) => readFileSync(p, 'utf8');
const rel = (p: string) => relative(ROOT, p).replaceAll('\\', '/');

describe('design fidelity', () => {
  it('CSS modules use tokens, not raw colors or easing curves', () => {
    const offenders = files
      .filter((f) => f.endsWith('.module.css'))
      .flatMap((f) =>
        read(f)
          .split('\n')
          .map((line, i) => ({ line, at: `${rel(f)}:${i + 1}` }))
          .filter(({ line }) => /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|cubic-bezier\(/i.test(line))
          .map(({ at, line }) => `${at}  ${line.trim()}`),
      );
    expect(offenders).toEqual([]);
  });

  it('components contain no raw hex colors or cubic-bezier curves', () => {
    const offenders = files
      .filter((f) => /components[\\/].*\.tsx$/.test(f))
      .filter((f) => /#[0-9a-f]{6}\b|cubic-bezier\(/i.test(read(f)))
      .map(rel);
    expect(offenders).toEqual([]);
  });

  it('JS easings mirror the --ease-* tokens', () => {
    const tokens = read(join(SRC, 'styles', 'tokens.css'));
    const map: Record<keyof typeof EASE, string> = {
      outSoft: 'out-soft',
      drop: 'drop',
      morph: 'morph',
      cover: 'cover',
      flap: 'flap',
      exit: 'exit',
      slide: 'slide',
      thump: 'thump',
    };
    for (const [key, name] of Object.entries(map)) {
      const m = new RegExp(`--ease-${name}:\\s*([^;]+);`).exec(tokens);
      expect(m?.[1]?.trim(), name).toBe(EASE[key as keyof typeof EASE]);
    }
  });
});

describe('security rules', () => {
  const code = files.filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes('.test.'));

  it('no raw HTML or eval-alikes in src', () => {
    const bad = code.filter((f) =>
      /dangerouslySetInnerHTML|\.innerHTML|new Function|\beval\(/.test(read(f)),
    );
    expect(bad.map(rel)).toEqual([]);
  });

  it('no Math.random() in layout code', () => {
    expect(code.filter((f) => /Math\.random/.test(read(f))).map(rel)).toEqual([]);
  });

  it('target="_blank" always pairs with rel="noopener noreferrer"', () => {
    for (const f of code) {
      const text = read(f);
      if (text.includes('_blank')) expect(text, rel(f)).toContain('noopener noreferrer');
    }
  });

  it('design/ reference files are never imported', () => {
    expect(code.filter((f) => /design\/reference|support\.js/.test(read(f))).map(rel)).toEqual([]);
  });
});
