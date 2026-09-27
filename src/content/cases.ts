import { withImage } from './assets';
import { LEARNTES, LINKS } from './links';
import type { CaseFile, CaseId } from './types';

const CASE_FILES: readonly CaseFile[] = [
  {
    id: '004',
    name: 'ShelfSense',
    stamp: 'SOLVED IN 48 HOURS',
    stampRot: -7,
    filed: 'Sep 2026 · Hackathon (iQOO City Battle, Chennai) · Crew of three',
    images: [
      {
        label: 'ShelfSense app: camera view detecting products on a shelf, 9:16 phone screenshot',
        ratio: [9, 16],
      },
      { label: 'ShelfSense reorder / results screen, 9:16 phone screenshot', ratio: [9, 16] },
      { label: 'Team photo at the hackathon, 4:3 (optional)', ratio: [4, 3] },
    ],
    cover: 2,
    brief: [
      "Two days. Three people. One question every store manager asks: what's missing from the shelf? The crew had no internet to lean on. Didn't need it. They built an app that takes one photo of a shelf, names every product on it, checks it against the plan, and writes the reorder before the shopkeeper finishes his tea. Shutter to answer: under a second.",
      "When the model can't be trusted, the app doesn't crash. It switches to manual and keeps working. That's not luck. That's 113 unit tests.",
    ],
    facts: [
      'Fully offline Android app: photographs a shelf, identifies products, compares against the planned layout, drafts a reorder',
      'Two-stage on-device ML: YOLO11n INT8 detector (mAP50 0.889 on 2,935 held-out images, 32 ms GPU inference) + MobileNetV3 embedder with cosine kNN matching (~2 ms per item)',
      '~760 ms from shutter press to labelled results',
      '113 unit tests, zero static-analysis errors, fallback to manual mode on model failure',
      '14-table SQLite schema; exports to XLSX, CSV and PDF; local Wi-Fi server with QR code for file handover',
    ],
    tools: ['Flutter', 'Dart', 'TensorFlow Lite', 'YOLO11n', 'MobileNetV3', 'SQLite'],
    links: [{ label: 'View on GitHub →', href: LINKS.shelfsenseGithub }],
    board: { left: 72, top: 56, rot: -2.2 },
  },
  {
    id: '003',
    name: 'MedScript',
    stamp: 'CLEARED FOR THE CLINIC',
    stampRot: 5,
    filed: 'Jul – Aug 2026 · Solo investigation',
    images: [
      {
        label: 'MedScript dashboard with editable SOAP note cards, 16:10 screenshot',
        ratio: [16, 10],
      },
      { label: 'MedScript live audio recording screen, 16:10 screenshot', ratio: [16, 10] },
      {
        label: 'Architecture diagram: voice → Whisper → LLM → SOAP note → FHIR export, 16:9',
        ratio: [16, 9],
      },
    ],
    cover: 0,
    brief: [
      "Doctors talk. Somebody has to write it all down. Usually it's the doctor, at midnight, when they should be asleep. He decided that wasn't going to be their problem anymore.",
      "MedScript listens to a consultation and hands back a structured clinical note in under three seconds. And when the cloud goes dark, it doesn't panic. It calls in a backup: a model he fine-tuned himself, running locally, waiting for exactly that moment.",
    ],
    facts: [
      'End-to-end voice-to-SOAP-note pipeline with under 3 s latency',
      'Whisper speech-to-text; editable SOAP cards with per-section confidence scoring; PDF export',
      'Dual-path inference: NVIDIA NIM Nemotron-70B in the cloud, with a locally hosted fine-tuned model as fallback',
      'Fine-tuned Mistral-7B-Instruct with QLoRA (4-bit NF4, LoRA rank 8, ~21M trainable parameters) on 500+ synthetic clinical conversation → SOAP note pairs; adapter published on Hugging Face',
      'HL7 FHIR R4 export for Electronic Health Record integration',
    ],
    tools: [
      'Python',
      'FastAPI',
      'Next.js 14',
      'TypeScript',
      'QLoRA',
      'Hugging Face',
      'NVIDIA NIM',
      'OpenAI Whisper',
    ],
    links: [
      { label: 'View on GitHub →', href: LINKS.medscriptGithub },
      {
        label: 'Hugging Face adapter →',
        href: LINKS.medscriptHuggingFace,
        note: '[ADD HUGGING FACE LINK]',
      },
    ],
    board: { left: 696, top: 24, rot: 1.8 },
  },
  {
    id: '002',
    name: 'Learntes',
    stamp: 'DEPLOYED · AWS',
    stampRot: -5,
    filed: `${LEARNTES.date} · Solo investigation`,
    images: [
      { label: 'Learntes homepage in dark mode, 16:10 screenshot', ratio: [16, 10] },
      {
        label: 'Learntes MicroLearn vertical video feed, 9:16 screenshot',
        ratio: [9, 16],
        alt: 'Learntes log-in screen',
      },
      {
        label: 'Learntes leaderboard or certificate verification page, 16:10 screenshot',
        ratio: [16, 10],
        alt: 'Learntes "Two paths. One platform." page: the certification path and the MicroLearn path',
      },
    ],
    cover: 0,
    brief: [
      'Everybody wants to learn. Nobody wants to sit through a three-hour lecture. So he built a place that offers both: full certification courses for the committed, and a snap-scroll feed of five-minute lessons for everyone else.',
      "He threw in ranks, too. Start as a Curious Mind. Put in the hours, and maybe one day they'll call you Grand Master. Then he took the whole operation off his laptop and put it on AWS, where the rest of the world could find it.",
    ],
    facts: [
      '10-page EdTech platform with 17 reusable components',
      'Certification course catalog with search, filtering and sorting; tabbed course pages; video player with progress tracking',
      'TikTok-style MicroLearn feed with likes, saves and category filters',
      '8-tier gamified title progression and a global leaderboard',
      'Certificates with unique credential IDs and a public verification page',
      'Dark and light mode; React Context API for auth, progress and theme state',
      `Deployed on AWS (${LEARNTES.aws})`,
    ],
    tools: ['React 18', 'Vite', 'React Router', 'Context API', 'AWS'],
    // The live site was taken down, so there's no live link (owner's call).
    links: [{ label: 'View on GitHub →', href: LINKS.learntesGithub }],
    board: { left: 120, top: 548, rot: 1.4 },
  },
  {
    id: '001',
    name: 'Sentinel',
    stamp: 'THE FIRST ONE',
    stampRot: 6,
    filed: 'Jan – Mar 2025 · Solo investigation',
    images: [
      { label: 'Pre-disaster satellite image, 1:1', ratio: [1, 1] },
      { label: 'Post-disaster satellite image with damage-class overlay, 1:1', ratio: [1, 1] },
      {
        label: 'Model pipeline diagram: U-Net segmentation → Siamese CNN, 16:9',
        ratio: [16, 9],
      },
    ],
    cover: 1,
    brief: [
      "Every detective has a first case. This was his. A disaster hits. From above, it's rubble and rooftops, and somebody has to decide where help goes first. He built a model to read the damage from space: find every building, compare before and after, and call it — untouched, damaged, or gone.",
      "Twenty-two thousand image pairs. Six kinds of disaster. He taught the machine to tell the difference, and it learned. It's the case that got him hooked.",
    ],
    facts: [
      'Two-stage PyTorch pipeline: U-Net building segmentation → Siamese CNN damage classifier',
      '5-class building damage assessment on the xBD dataset: 22,069+ pre/post-disaster image pairs across 6 disaster types',
      'F1 score: 0.88 (No Damage), 0.82 (Destroyed)',
      'Building-mask gating to suppress false positives; GeoJSON polygon-to-pixel-mask preprocessing',
      'Docker-containerized inference',
    ],
    tools: ['PyTorch', 'OpenCV', 'Docker'],
    links: [{ label: 'View on GitHub →', href: LINKS.sentinelGithub }],
    board: { left: 720, top: 584, rot: -1.6 },
  },
];

/**
 * The four cases, in board order (004 → 001). Prev/next in the folder follows this order.
 * Photos come from `raw-assets/case-<id>-<name>-<n>.*` once processed.
 */
export const CASES: readonly CaseFile[] = CASE_FILES.map((c) => ({
  ...c,
  images: c.images.map((img, j) =>
    withImage(`case-${c.id}-${c.name.toLowerCase()}-${j + 1}`, img),
  ) as unknown as CaseFile['images'],
}));

export const CASE_IDS: readonly CaseId[] = CASES.map((c) => c.id);

export function isCaseId(value: string): value is CaseId {
  return (CASE_IDS as readonly string[]).includes(value);
}

export function caseNum(id: CaseId): string {
  return `CASE ${id}`;
}

/** Folder chrome copy. */
export const CASE_COPY = {
  openFile: 'Open file →',
  openAria: 'Open case file',
  filed: 'Filed:',
  close: 'Close file ✕',
  briefing: 'The Briefing',
  facts: 'The Facts',
  tools: 'Tools recovered at the scene:',
  prev: '← Previous case',
  next: 'Next case →',
  linksLabel: 'Links',
} as const;
