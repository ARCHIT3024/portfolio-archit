// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildEmail, handleContact, type Env } from './contact';

const ORIGIN = 'https://archit-khandelwal.pages.dev';
const NOW = new Date('2026-09-25T12:00:00Z');

const env: Env = {
  TURNSTILE_SECRET_KEY: 'secret',
  RESEND_API_KEY: 're_test',
  CONTACT_TO: 'owner@example.com',
  CONTACT_FROM: 'Case File <onboarding@resend.dev>',
  ALLOWED_ORIGIN: `${ORIGIN}, https://example.dev`,
};

const body = {
  name: 'Sam Spade',
  reach: 'sam@example.com',
  subject: 'The falcon',
  message: 'Got a job for you.',
  website: '',
  turnstileToken: 'token',
  startedAt: NOW.getTime() - 60_000,
};

function req(
  init: {
    body?: unknown;
    raw?: string;
    method?: string;
    origin?: string | null;
    type?: string;
  } = {},
) {
  const headers = new Headers({
    'Content-Type': init.type ?? 'application/json',
    'CF-Connecting-IP': '203.0.113.9',
  });
  if (init.origin !== null) headers.set('Origin', init.origin ?? ORIGIN);
  const method = init.method ?? 'POST';
  return new Request(`${ORIGIN}/api/contact`, {
    method,
    headers,
    body: method === 'GET' ? undefined : (init.raw ?? JSON.stringify(init.body ?? body)),
  });
}

type FetchCall = { url: string; init?: RequestInit };
let calls: FetchCall[];
let turnstile: { success: boolean; hostname?: string };
let resendOk: boolean;

beforeEach(() => {
  calls = [];
  turnstile = { success: true, hostname: 'archit-khandelwal.pages.dev' };
  resendOk = true;
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      if (url.includes('siteverify')) return Response.json(turnstile);
      if (url.includes('resend')) return new Response('{}', { status: resendOk ? 200 : 500 });
      throw new Error(`unexpected fetch ${url}`);
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const json = async (r: Response) => (await r.json()) as { ok: boolean; code?: string };

describe('POST /api/contact', () => {
  it('sends a valid tip as plain text and answers 202', async () => {
    const res = await handleContact(req(), env, NOW);
    expect(res.status).toBe(202);
    expect(await json(res)).toEqual({ ok: true });
    const email = calls.find((c) => c.url.includes('resend'));
    const sent = JSON.parse(String(email?.init?.body));
    expect(sent.to).toEqual(['owner@example.com']);
    expect(sent.from).toBe(env.CONTACT_FROM);
    expect(sent.reply_to).toBe('sam@example.com');
    expect(sent.html).toBeUndefined();
    expect(sent.text).toContain('Got a job for you.');
  });

  it('accepts any configured origin', async () => {
    turnstile.hostname = 'example.dev';
    const res = await handleContact(req({ origin: 'https://example.dev' }), env, NOW);
    expect(res.status).toBe(202);
  });

  it('rejects the wrong method, content type and origin', async () => {
    expect((await handleContact(req({ method: 'GET' }), env, NOW)).status).toBe(405);
    expect((await handleContact(req({ type: 'text/plain' }), env, NOW)).status).toBe(415);
    expect((await handleContact(req({ origin: 'https://evil.example' }), env, NOW)).status).toBe(
      403,
    );
    expect((await handleContact(req({ origin: null }), env, NOW)).status).toBe(403);
    expect(calls).toHaveLength(0);
  });

  it('rejects oversized bodies', async () => {
    const res = await handleContact(
      req({ body: { ...body, message: 'x'.repeat(12_000) } }),
      env,
      NOW,
    );
    expect(res.status).toBe(413);
  });

  it('rejects malformed JSON and invalid fields without echoing input', async () => {
    const bad = await handleContact(req({ raw: '{not json' }), env, NOW);
    expect(bad.status).toBe(400);
    const invalid = await handleContact(req({ body: { ...body, name: '' } }), env, NOW);
    expect(await json(invalid)).toEqual({ ok: false, code: 'invalid' });
  });

  it('rejects CR/LF header injection attempts', async () => {
    const res = await handleContact(
      req({ body: { ...body, subject: 'hi\r\nBcc: victim@example.com' } }),
      env,
      NOW,
    );
    expect(res.status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it('silently accepts (and drops) honeypot and too-fast submissions', async () => {
    const honey = await handleContact(req({ body: { ...body, website: 'http://spam' } }), env, NOW);
    expect(honey.status).toBe(202);
    const fast = await handleContact(
      req({ body: { ...body, startedAt: NOW.getTime() - 500 } }),
      env,
      NOW,
    );
    expect(fast.status).toBe(202);
    expect(calls).toHaveLength(0);
  });

  it('rejects a failed or foreign Turnstile check', async () => {
    turnstile = { success: false };
    expect((await handleContact(req(), env, NOW)).status).toBe(403);
    turnstile = { success: true, hostname: 'evil.example' };
    const res = await handleContact(req(), env, NOW);
    expect(await json(res)).toEqual({ ok: false, code: 'challenge' });
    expect(calls.some((c) => c.url.includes('resend'))).toBe(false);
  });

  it('answers 502 when Resend fails', async () => {
    resendOk = false;
    const res = await handleContact(req(), env, NOW);
    expect(res.status).toBe(502);
    expect(await json(res)).toEqual({ ok: false, code: 'upstream' });
  });

  it('rate limits by hashed IP when KV is bound', async () => {
    const store = new Map<string, string>();
    const kv = {
      get: async (k: string) => store.get(k) ?? null,
      put: async (k: string, v: string) => void store.set(k, v),
    } as unknown as KVNamespace;
    const limited = { ...env, RATE_LIMIT: kv };
    for (let i = 0; i < 5; i++) expect((await handleContact(req(), limited, NOW)).status).toBe(202);
    const res = await handleContact(req(), limited, NOW);
    expect(res.status).toBe(429);
    for (const key of store.keys()) expect(key).not.toContain('203.0.113.9');
  });

  it('never logs message contents', async () => {
    await handleContact(req(), env, NOW);
    const logged = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(logged).not.toContain('Got a job');
    expect(logged).not.toContain('sam@example.com');
  });
});

describe('buildEmail', () => {
  it('uses a fixed recipient, a safe subject and no reply_to for non-emails', () => {
    const email = buildEmail({ ...body, reach: '+91 98765 43210', subject: '' }, env);
    expect(email.to).toEqual([env.CONTACT_TO]);
    expect(email.subject).toBe('[Portfolio tip] No subject');
    expect('reply_to' in email).toBe(false);
    expect(email.text).toContain('+91 98765 43210');
  });
});
