import type { NavLink } from './types';

/** The single source for Nav, the Case Index menu and the Footer (docs/app-flow.md §3). */
export const NAV_BRAND = 'A.K. · CASE FILE';

export const NAV_LINKS: readonly NavLink[] = [
  { id: 'file', label: 'The File', num: '02' },
  { id: 'evidence', label: 'Evidence Board', num: '03' },
  { id: 'desk', label: 'The Desk', num: '04' },
  { id: 'history', label: 'Case History', num: '05' },
  { id: 'commendations', label: 'Commendations', num: '06' },
  { id: 'contact', label: 'Contact', num: '07' },
];

export const NAV_COPY = {
  menuButton: 'Case Index',
  menuLabel: 'Case index',
  primaryNavLabel: 'Sections',
  lampOff: 'Lights off',
  lampOn: 'Lights on',
} as const;
