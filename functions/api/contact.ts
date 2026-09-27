/**
 * POST /api/contact — Cloudflare Pages Function (docs/security.md §3, deployment.md §5).
 * Gate: method → content type → size → origin → validation → honeypot/timing → Turnstile →
 * optional KV rate limit → Resend (plain text). Logs only status and code.
 */
import {
  headerSafe,
  isEmail,
  looksAutomated,
  MAX_BODY_BYTES,
  validateContact,
  type ContactErrorCode,
  type ContactPayload,
} from '../../shared/contact';

export interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
  /** Comma-separated list of allowed origins, e.g. the pages.dev host plus a custom domain. */
  ALLOWED_ORIGIN: string;
  /** Optional per-IP rate limit. */
  RATE_LIMIT?: KVNamespace;
}

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND = 'https://api.resend.com/emails';
const UPSTREAM_TIMEOUT_MS = 10_000;
const RATE_MAX = 5;
const TURNSTILE_TEST_SECRET = '1x0000000000000000000000000000000AA';
const RATE_WINDOW_S = 3600;

function reply(
  status: number,
  body: { ok: boolean; code?: ContactErrorCode | string },
  extra?: HeadersInit,
): Response {
  console.log(JSON.stringify({ route: 'contact', status, code: body.code ?? 'ok' }));
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extra,
    },
  });
}

const fail = (status: number, code: ContactErrorCode | string, extra?: HeadersInit) =>
  reply(status, { ok: false, code }, extra);

function allowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

/** Read at most `limit` bytes of the body; `null` if it is larger. */
async function readBody(request: Request, limit: number): Promise<string | null> {
  const declared = Number(request.headers.get('Content-Length') ?? '0');
  if (declared > limit) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    all.set(c, at);
    at += c.byteLength;
  }
  return new TextDecoder().decode(all);
}

async function verifyTurnstile(
  token: string,
  ip: string | null,
  env: Env,
  hostnames: string[],
): Promise<boolean> {
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetch(SITEVERIFY, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; hostname?: string };
    if (data.success !== true) return false;
    // Cloudflare's always-pass test secret doesn't report our hostname; real keys must.
    if (env.TURNSTILE_SECRET_KEY === TURNSTILE_TEST_SECRET) return true;
    return typeof data.hostname === 'string' && hostnames.includes(data.hostname);
  } catch {
    return false;
  }
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** True when this IP is over the limit. Stores only a salted hash, expiring within the hour. */
async function overRateLimit(kv: KVNamespace, ip: string, now: Date): Promise<boolean> {
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(0, 13);
  const key = `rl:${await sha256Hex(`${ip}|${day}`)}:${hour}`;
  const count = Number((await kv.get(key)) ?? '0');
  if (count >= RATE_MAX) return true;
  await kv.put(key, String(count + 1), { expirationTtl: RATE_WINDOW_S });
  return false;
}

export function buildEmail(p: ContactPayload, env: Env) {
  const subject = `[Portfolio tip] ${headerSafe(p.subject || 'No subject').slice(0, 100)}`;
  const text = [
    `Name: ${p.name}`,
    `Reach: ${p.reach}`,
    `Subject: ${p.subject || '(none)'}`,
    '',
    p.message,
    '',
    '— Sent from the case file contact form',
  ].join('\n');
  return {
    from: env.CONTACT_FROM,
    to: [env.CONTACT_TO],
    subject,
    text,
    ...(isEmail(p.reach) ? { reply_to: headerSafe(p.reach) } : {}),
  };
}

async function sendEmail(p: ContactPayload, env: Env): Promise<boolean> {
  try {
    const res = await fetch(RESEND, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildEmail(p, env)),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function handleContact(
  request: Request,
  env: Env,
  now = new Date(),
): Promise<Response> {
  if (request.method !== 'POST') return fail(405, 'method', { Allow: 'POST' });

  const type = request.headers.get('Content-Type') ?? '';
  if (!/^application\/json(\s*;|$)/i.test(type)) return fail(415, 'type');

  const origins = allowedOrigins(env);
  const origin = request.headers.get('Origin');
  if (!origin || !origins.includes(origin)) return fail(403, 'origin');

  const raw = await readBody(request, MAX_BODY_BYTES);
  if (raw === null) return fail(413, 'size');

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, 'invalid');
  }
  const result = validateContact(json);
  if (!result.ok) return fail(400, 'invalid');
  const payload = result.value;

  // Bots get a cheerful 202 and nothing else.
  if (looksAutomated(payload, now.getTime())) return reply(202, { ok: true });

  const ip = request.headers.get('CF-Connecting-IP');
  const hostnames = origins.map((o) => new URL(o).hostname);
  if (!(await verifyTurnstile(payload.turnstileToken, ip, env, hostnames)))
    return fail(403, 'challenge');

  if (env.RATE_LIMIT && ip && (await overRateLimit(env.RATE_LIMIT, ip, now)))
    return fail(429, 'rate');

  if (!(await sendEmail(payload, env))) return fail(502, 'upstream');
  return reply(202, { ok: true });
}

export const onRequest: PagesFunction<Env> = ({ request, env }) => handleContact(request, env);
