/**
 * Contact form contract, shared by the browser form and the Pages Function
 * (docs/security.md §3). Hand-written, no dependencies. The client uses it for UX only;
 * the function re-validates everything.
 */

export const LIMITS = { name: 100, reach: 200, subject: 150, message: 5000 } as const;

/** Largest request body the function will read. */
export const MAX_BODY_BYTES = 10 * 1024;

/** Submissions faster than this after the form rendered are treated as bots. */
export const MIN_FILL_MS = 3000;

export const TURNSTILE_TOKEN_MAX = 2048;

export interface ContactFields {
  name: string;
  reach: string;
  subject: string;
  message: string;
}

export interface ContactPayload extends ContactFields {
  /** Honeypot: must be empty. */
  website: string;
  turnstileToken: string;
  /** `Date.now()` when the form first rendered. */
  startedAt: number;
}

export type ContactErrorCode = 'invalid' | 'challenge' | 'rate' | 'upstream';

export type ContactResponse = { ok: true } | { ok: false; code?: ContactErrorCode };

export type ValidationResult =
  { ok: true; value: ContactPayload } | { ok: false; field: keyof ContactPayload | 'body' };

const KEYS: readonly (keyof ContactPayload)[] = [
  'name',
  'reach',
  'subject',
  'message',
  'website',
  'turnstileToken',
  'startedAt',
];

// C0 controls, DEL, C1 controls, and the Unicode line/paragraph separators.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001F\u007F-\u009F\u2028\u2029]/;
// eslint-disable-next-line no-control-regex
const CONTROL_EXCEPT_LF = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u2028\u2029]/;

function field(value: unknown, max: number, min: number, multiline = false): string | null {
  if (typeof value !== 'string') return null;
  const text = (multiline ? value.replace(/\r\n?/g, '\n') : value).trim();
  if (text.length < min || text.length > max) return null;
  if ((multiline ? CONTROL_EXCEPT_LF : CONTROL).test(text)) return null;
  return text;
}

/** Validate and normalise (trim, CRLF → LF) an untrusted payload. Unknown keys are rejected. */
export function validateContact(input: unknown): ValidationResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input))
    return { ok: false, field: 'body' };
  const obj = input as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!(KEYS as readonly string[]).includes(key)) return { ok: false, field: 'body' };
  }

  const name = field(obj.name, LIMITS.name, 1);
  if (name === null) return { ok: false, field: 'name' };
  const reach = field(obj.reach, LIMITS.reach, 1);
  if (reach === null) return { ok: false, field: 'reach' };
  const subject = field(obj.subject ?? '', LIMITS.subject, 0);
  if (subject === null) return { ok: false, field: 'subject' };
  const message = field(obj.message, LIMITS.message, 1, true);
  if (message === null) return { ok: false, field: 'message' };

  const website = obj.website ?? '';
  if (typeof website !== 'string' || website.length > 500) return { ok: false, field: 'website' };

  const token = obj.turnstileToken;
  if (typeof token !== 'string' || token.length === 0 || token.length > TURNSTILE_TOKEN_MAX)
    return { ok: false, field: 'turnstileToken' };

  const startedAt = obj.startedAt;
  if (typeof startedAt !== 'number' || !Number.isFinite(startedAt) || startedAt <= 0)
    return { ok: false, field: 'startedAt' };

  return {
    ok: true,
    value: { name, reach, subject, message, website, turnstileToken: token, startedAt },
  };
}

/**
 * Honeypot filled, or submitted suspiciously fast. A negative elapsed time means the
 * visitor's clock runs ahead of ours, so the timing check is skipped rather than dropping
 * a real message.
 */
export function looksAutomated(
  payload: Pick<ContactPayload, 'website' | 'startedAt'>,
  now: number,
): boolean {
  if (payload.website.trim() !== '') return true;
  const elapsed = now - payload.startedAt;
  return elapsed >= 0 && elapsed < MIN_FILL_MS;
}

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

/** True when `reach` is a plain email address (safe to use as `reply_to`). */
export function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL.test(value);
}

/** Remove CR/LF (and other controls) from a value bound for an email header. */
export function headerSafe(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]+/g, ' ').trim();
}
