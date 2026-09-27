import { HAS_RESUME } from './assets.generated';
import { ownerLink } from './assets';
import type { LinkRef } from './types';

/**
 * External links. Owner-supplied ones come from raw-assets/links.md via `npm run images`
 * (docs/deployment.md §8) and are `null` until they arrive. Never invent them.
 */
export const LINKS = {
  email: 'archit.khandelwal3024@gmail.com',
  github: ownerLink('github'),
  linkedin: ownerLink('linkedin'),
  resume: HAS_RESUME ? '/resume.pdf' : null,
  edusphere: 'https://edusphereofficial.in',
  shelfsenseGithub: ownerLink('shelfsense-github'),
  medscriptGithub: ownerLink('medscript-github'),
  medscriptHuggingFace: ownerLink('medscript-huggingface'),
  learntesGithub: ownerLink('learntes-github'),
  sentinelGithub: ownerLink('sentinel-github'),
};

/** Learntes details the owner fills in via links.md; the design's [ADD …] TODOs until then. */
export const LEARNTES = {
  date: ownerLink('learntes-date') ?? '[ADD DATE]',
  aws: ownerLink('learntes-aws') ?? '[ADD SERVICE, e.g. S3 + CloudFront / Amplify / EC2]',
};

export const HIDEOUTS: readonly LinkRef[] = [
  { label: 'GitHub', href: LINKS.github },
  { label: 'LinkedIn', href: LINKS.linkedin },
];
