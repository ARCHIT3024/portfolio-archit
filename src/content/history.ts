import { withImage } from './assets';
import { LINKS } from './links';
import type { HistoryEntry } from './types';

export const HISTORY_COPY = {
  title: 'Case History',
  subhead: 'Closed folders, newest on top.',
  educationLabel: 'Education',
} as const;

/** Unordered on purpose: `sortHistory` puts work first, then education, each newest first. */
export const HISTORY: readonly HistoryEntry[] = [
  {
    id: 'iit-mandi-minor',
    kind: 'education',
    sortDate: '2026-08',
    tab: 'Aug 2026',
    title: 'Minor in Software Development 2.0 — IIT Mandi',
    meta: 'Aug 2026',
  },
  {
    id: 'edusphere',
    kind: 'work',
    sortDate: '2026-02',
    tab: 'Feb – Mar 2026',
    title: 'Freelance Full-Stack Developer — EduSphere',
    meta: 'Feb – Mar 2026',
    metaLink: { label: 'edusphereofficial.in', href: LINKS.edusphere },
    body: {
      text: 'A startup came in with a list of demands and a deadline. He walked out with a live EdTech site serving real users: 13 responsive pages, a 70+ course catalog with search and filtering, 3-step registration, and Google Maps and WhatsApp integrations.',
    },
    chips: ['React', 'TypeScript', 'Tailwind CSS v4', 'Radix UI', 'React Router v7'],
    image: withImage('history-edusphere', {
      label: 'EduSphere homepage screenshot, 16:10',
      ratio: [16, 10],
    }),
  },
  {
    id: 'vit-btech',
    kind: 'education',
    sortDate: '2028-05',
    tab: 'Expected May 2028',
    title: 'B.Tech, Computer Science & Engineering — VIT Chennai',
    meta: 'Expected May 2028 · CGPA 8.86 / 10',
    body: {
      lead: 'Coursework on record:',
      text: 'Data Structures & Algorithms, System Design, DBMS, Cloud Computing & Deployment, Generative AI & Applications, Programming Fundamentals.',
    },
  },
  {
    id: 'unstop',
    kind: 'work',
    sortDate: '2025-04',
    tab: 'Apr 2025 – May 2026',
    title: 'Campus Ambassador — Unstop',
    meta: 'Apr 2025 – May 2026',
    body: {
      text: 'Thirteen months working the campus beat at VIT Chennai, rounding up students for hackathons and coding competitions. Participation went up. Nobody asked how.',
    },
  },
];

const KIND_ORDER = { work: 0, education: 1 } as const;

export function sortHistory(entries: readonly HistoryEntry[]): HistoryEntry[] {
  return [...entries].sort(
    (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || b.sortDate.localeCompare(a.sortDate),
  );
}
