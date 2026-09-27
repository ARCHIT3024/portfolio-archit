import type { DeskObject } from './types';

export const DESK_COPY = {
  title: "The Detective's Desk",
  subhead: 'Everything he reaches for, laid out under the lamp.',
  hint: '— hover or tap to examine —',
} as const;

export const DESK: readonly DeskObject[] = [
  {
    id: 'type',
    obj: 'The Typewriter',
    cat: 'Languages',
    tags: ['Python', 'C++', 'C', 'JavaScript', 'TypeScript', 'SQL'],
    rot: -1.5,
  },
  {
    id: 'note',
    obj: 'The Case Notebook',
    cat: 'AI / ML',
    tags: [
      'PyTorch',
      'TensorFlow',
      'scikit-learn',
      'Hugging Face (Transformers, PEFT, TRL)',
      'QLoRA / LoRA fine-tuning',
      'OpenAI Whisper',
      'OpenCV',
      'pandas',
      'NumPy',
    ],
    rot: 1.2,
  },
  {
    id: 'phone',
    obj: 'The Rotary Phone',
    cat: 'Cloud & DevOps',
    note: '(for calls to very distant servers)',
    tags: [
      'AWS (EC2, S3, Lambda, IAM, VPC, RDS, ECS, ECR, CloudWatch, CloudFormation)',
      'Docker',
      'Kubernetes',
      'Git',
      'GitHub',
      'Linux / Bash',
    ],
    rot: -0.8,
  },
  {
    id: 'map',
    obj: 'The City Map',
    cat: 'Web & Backend',
    tags: [
      'React 18',
      'Next.js 14',
      'FastAPI',
      'Pydantic',
      'Vite',
      'React Router',
      'Tailwind CSS',
      'Radix UI',
      'PostgreSQL',
      'MySQL',
    ],
    rot: 1.6,
  },
  {
    id: 'radio',
    obj: 'The Pocket Radio',
    cat: 'Mobile',
    tags: ['Flutter', 'Dart', 'Android', 'TensorFlow Lite', 'SQLite'],
    rot: -1.2,
  },
  {
    id: 'rules',
    obj: 'The Rulebook',
    cat: 'Fundamentals',
    tags: ['Data Structures & Algorithms', 'OOP', 'System Design', 'REST API Design', 'DBMS'],
    rot: 0.9,
  },
  {
    id: 'mug',
    obj: 'The Coffee Mug',
    cat: 'Fuel',
    text: 'Black. Refilled often. Not negotiable.',
    rot: -1.8,
  },
];
