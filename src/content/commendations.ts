import type { Commendation } from './types';

export const COMMENDATIONS_COPY = {
  title: 'Commendations',
  subhead: 'Badges earned. One still in the mail.',
} as const;

export const COMMENDATIONS: readonly Commendation[] = [
  {
    id: 'iqoo',
    label: 'Hackathon',
    body: 'iQOO City Battle Chennai, 2026 (ShelfSense)',
    rot: -0.6,
  },
  {
    id: 'sih',
    label: 'Hackathon',
    body: 'Smart India Hackathon 2025, Participant, Clean & Green Technology track',
    rot: 0.8,
  },
  {
    id: 'cp',
    label: 'Competitive Programming',
    body: [
      'HackerRank 5-Star Python',
      'CodeChef Bronze Problem Solver',
      'LeetCode ~100 problems solved',
    ],
    rot: -0.4,
  },
  {
    id: 'udemy',
    label: 'Certification',
    body: 'The Complete Full-Stack Web Development Bootcamp, Udemy (62 hrs), Sep 2026',
    rot: 0.5,
  },
  {
    id: 'cisco',
    label: 'Certification',
    body: 'Networking Basics, Cisco Networking Academy, Jan 2026',
    rot: -0.9,
  },
  {
    id: 'aws',
    label: 'Pending',
    body: 'AWS Certified Cloud Practitioner (CLF-C02), preparation in progress',
    rot: 1.6,
    pending: { stamp: 'PENDING', stampRot: 11 },
  },
];

/** Reveal stagger between commendation cards (0–350ms, step 70). */
export const COMMENDATION_STAGGER_MS = 70;
/** The Pending stamp thumps last. */
export const PENDING_STAMP_DELAY_MS = 700;
