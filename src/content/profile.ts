import { withImage } from './assets';
import { LINKS } from './links';
import type { FileRow, NarrativeParagraph } from './types';

export const HERO = {
  tab: 'CASE FILE — KHANDELWAL, A.',
  stamp: 'ACTIVE · DO NOT CLOSE',
  name: 'Archit Khandelwal',
  tagline: 'Tenacious and Shrewd Developer',
  intro:
    'Machine Learning & Cloud Engineer. Last seen near a glowing monitor in Chennai, well after midnight.',
  primaryCta: { label: 'Examine the evidence →', href: '#evidence' },
  secondaryCta: { label: 'Leave a tip', href: '#contact' },
  portrait: withImage('portrait', {
    label: 'Portrait photo of Archit, 4:5, paper-clipped to the folder',
    ratio: [4, 5],
    alt: 'Portrait of Archit Khandelwal',
  }),
  portraitCaption: 'Subject photographed at his desk. Coffee not pictured, but present.',
} as const;

export const THE_FILE = {
  title: 'The File',
  rows: [
    { term: 'Name', detail: 'Archit Khandelwal' },
    { term: 'Known aliases', detail: 'The Night Shift, "Just One More Epoch"' },
    {
      term: 'Occupation',
      detail:
        'CS undergrad at VIT Chennai by day. ML and cloud engineer by night. Mostly by night.',
    },
    { term: 'Record', detail: 'CGPA 8.86. Clean.' },
    { term: 'Fuel', detail: 'Coffee. Black, like a terminal at 3 a.m.' },
    {
      term: 'Known associates',
      detail: 'A playlist, a gaming rig, and a to-do list he forgot to check.',
    },
    { term: 'Status', detail: 'At large. Still coding.', strong: true },
  ] satisfies FileRow[],
  pull: "It was raining the night his file hit my desk. It's always raining when a file this thick shows up.",
  paragraphs: [
    {
      text: "The name's Khandelwal. Archit Khandelwal. College student on paper. On the street, they know him as a developer who doesn't know when to quit, which is bad news if you're a bug.",
    },
    {
      text: "He got into code the way most people get into trouble: he found it interesting, and he couldn't leave it alone. One line led to another. Before long he was in deep. Machine learning deep. The kind of deep where you stop sleeping and start training models.",
    },
    {
      text: "Then came his first model. Everybody remembers their first. His was a job nobody sane takes on first: looking at satellite photos of disaster zones and telling which buildings were still standing. Twenty-two thousand before-and-after image pairs. He fed them in, watched the loss drop like a stone into the harbor, and when the F1 score hit 0.88, he didn't celebrate. He poured another coffee and told it to do better.",
    },
    {
      lead: 'Method of operation.',
      text: "He figures things out. Hand him a broken pipeline, a cryptic error, a problem nobody else wants to touch, and he'll work it until it talks. He gets the job done by any means necessary. Legal means. Mostly documentation.",
    },
    {
      lead: 'Habits.',
      text: 'Night owl. The city sleeps; his cursor blinks. Coffee on the desk, music in the headphones, and when the code finally runs clean, a round of games to celebrate. Or to forget.',
    },
    {
      lead: 'The strangest thing in the file.',
      text: 'He interrogates himself. Every decision he makes gets dragged into a back room, sat under a bare bulb, and questioned. Why that model? Why this approach? Where were you at 2 a.m. when you chose that variable name? Most suspects crack under that kind of pressure. His decisions walk out sharper.',
    },
    {
      lead: 'Known weakness.',
      text: "One blind spot. He can debug a neural network at 4 a.m., but send him out for milk and the trail goes cold. Small errands vanish without a trace. We've stopped asking.",
    },
    {
      lead: "What he's after.",
      text: "Exciting projects, and a world that still has secrets worth uncovering. If you've got a case like that, a problem that won't crack or an idea that needs building, you know where to find him.",
    },
  ] satisfies NarrativeParagraph[],
  closing: "Just don't call before noon.",
} as const;

export const EVIDENCE_COPY = {
  title: 'The Evidence Board',
  subhead: 'Four cases. All solved. Follow the red string.',
  imagePlaceholder: 'IMAGE PLACEHOLDER',
} as const;

export const CONTACT = {
  title: 'Got a case?',
  intro: 'Every good case starts with a tip. Leave yours below. He reads them after dark.',
  rows: {
    direct: 'Direct line',
    base: 'Base of operations',
    baseDetail: 'Chennai, India · IST (UTC+5:30)',
    availability: 'Availability',
    availabilityDetail:
      'Open to internships in Machine Learning, Cloud / DevOps and Full-Stack Engineering.',
    hideouts: 'Known hideouts',
  },
  email: LINKS.email,
  resumeCta: 'Download the full dossier (Résumé) →',
  resumeTodo: '[ADD RÉSUMÉ PDF LINK]',
} as const;

export const CONTACT_FORM = {
  name: 'Your name',
  reach: 'Where he can reach you',
  subject: "What's the case?",
  message: 'Spill it.',
  honeypot: 'Leave this field empty',
  submit: 'Slide it under the door',
  // (proposed) — noir voice, docs/design.md §10
  verifying: 'Checking for tails…',
  sending: 'Sliding it under the door…',
  sent: "Message received. The lamp's on. He'll be in touch.",
  errorGeneric: "The line's dead. Try the direct line:",
  errorRate: 'Too many tips from this line. Try again in an hour.',
  turnstileNote: 'Protected by Cloudflare Turnstile',
} as const;

export const FOOTER = {
  line: 'This file remains open.',
  copyright: '© 2026 Archit Khandelwal · Filed in Chennai',
  linksLabel: 'Footer',
} as const;

export const INTRO = {
  note: "Chennai. 2:47 a.m. The city's asleep. One file isn't.",
  hint: 'Move the light to find his file. Click it to turn the lights on.',
  folderTab: 'CASE FILE — KHANDELWAL, A.',
  folderName: 'Khandelwal, A.',
  folderStamp: 'OPEN',
  folderAria: 'Open the case file',
  skip: 'Skip the intro →',
} as const;
