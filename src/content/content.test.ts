import { describe, expect, it } from 'vitest';
import { CASES, isCaseId } from './cases';
import { COMMENDATIONS } from './commendations';
import { DESK } from './desk';
import { HISTORY, sortHistory } from './history';
import { NAV_LINKS } from './nav';
import { OWNER_LINKS } from './assets.generated';

describe('content', () => {
  it('Case History: work first, newest first; then education, latest date first', () => {
    expect(sortHistory(HISTORY).map((e) => e.id)).toEqual([
      'edusphere',
      'unstop',
      'vit-btech',
      'iit-mandi-minor',
    ]);
  });

  it('new entries land in the right place automatically', () => {
    const extra = { ...HISTORY[0]!, id: 'new-job', kind: 'work' as const, sortDate: '2027-01' };
    expect(sortHistory([...HISTORY, extra])[0]?.id).toBe('new-job');
  });

  it('nav links all six sections in page order', () => {
    expect(NAV_LINKS.map((l) => l.id)).toEqual([
      'file',
      'evidence',
      'desk',
      'history',
      'commendations',
      'contact',
    ]);
    expect(NAV_LINKS.map((l) => l.num)).toEqual(['02', '03', '04', '05', '06', '07']);
  });

  it('cases follow board order with three images each', () => {
    expect(CASES.map((c) => c.id)).toEqual(['004', '003', '002', '001']);
    for (const c of CASES) expect(c.images).toHaveLength(3);
  });

  it('case ids are matched against a whitelist', () => {
    expect(isCaseId('003')).toBe(true);
    expect(isCaseId('005')).toBe(false);
    expect(isCaseId('<script>')).toBe(false);
  });

  it('desk rotations match the design', () => {
    expect(DESK.map((d) => d.rot)).toEqual([-1.5, 1.2, -0.8, 1.6, -1.2, 0.9, -1.8]);
  });

  it('commendation rotations match the design, with the pending card last', () => {
    expect(COMMENDATIONS.map((c) => c.rot)).toEqual([-0.6, 0.8, -0.4, 0.5, -0.9, 1.6]);
    expect(COMMENDATIONS.at(-1)?.pending).toBeDefined();
  });

  it('owner values replace their TODOs; missing ones stay visible as [ADD …]', () => {
    const learntes = CASES.find((c) => c.id === '002')!;
    expect(learntes.filed).toContain(OWNER_LINKS['learntes-date'] ?? '[ADD DATE]');
  });

  it('Learntes has no live-site link (the site is offline)', () => {
    const learntes = CASES.find((c) => c.id === '002')!;
    expect(learntes.links.map((l) => l.label)).toEqual(['View on GitHub →']);
  });
});
