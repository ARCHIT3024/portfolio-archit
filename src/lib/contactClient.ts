import type { ContactPayload, ContactResponse } from '../../shared/contact';

export const CONTACT_ENDPOINT = '/api/contact';
const TIMEOUT_MS = 10_000;

export type SendResult = 'sent' | 'rate' | 'failed';

/** POST the tip to the same-origin Pages Function. Never throws. */
export async function sendContact(payload: ContactPayload): Promise<SendResult> {
  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 429) return 'rate';
    if (!res.ok) return 'failed';
    const body = (await res.json().catch(() => null)) as ContactResponse | null;
    return body?.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}
