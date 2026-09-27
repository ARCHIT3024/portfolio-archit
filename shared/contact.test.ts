import { describe, expect, it } from 'vitest';
import {
  headerSafe,
  isEmail,
  LIMITS,
  looksAutomated,
  MIN_FILL_MS,
  validateContact,
} from './contact';

const valid = {
  name: 'Sam Spade',
  reach: 'sam@example.com',
  subject: 'The falcon',
  message: 'Line one\nLine two',
  website: '',
  turnstileToken: 'tok',
  startedAt: 1_700_000_000_000,
};

describe('validateContact', () => {
  it('accepts a well-formed tip and trims it', () => {
    const r = validateContact({ ...valid, name: '  Sam Spade  ' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.name).toBe('Sam Spade');
  });

  it('treats subject as optional', () => {
    const { subject: _omit, ...rest } = valid;
    const r = validateContact(rest);
    expect(r.ok && r.value.subject).toBe('');
  });

  it.each([
    ['name', ''],
    ['name', 'x'.repeat(LIMITS.name + 1)],
    ['reach', '   '],
    ['reach', 'x'.repeat(LIMITS.reach + 1)],
    ['subject', 'x'.repeat(LIMITS.subject + 1)],
    ['message', ''],
    ['message', 'x'.repeat(LIMITS.message + 1)],
  ])('rejects bad %s', (field, value) => {
    const r = validateContact({ ...valid, [field]: value });
    expect(r).toEqual({ ok: false, field });
  });

  it('rejects CR/LF and other controls in single-line fields', () => {
    expect(validateContact({ ...valid, subject: 'hi\r\nBcc: evil@x.com' }).ok).toBe(false);
    expect(validateContact({ ...valid, name: 'a\u0000b' }).ok).toBe(false);
    expect(validateContact({ ...valid, reach: 'a\u2028b' }).ok).toBe(false);
  });

  it('allows newlines in the message but normalises CRLF', () => {
    const r = validateContact({ ...valid, message: 'a\r\nb' });
    expect(r.ok && r.value.message).toBe('a\nb');
    expect(validateContact({ ...valid, message: 'a\tb' }).ok).toBe(false);
  });

  it('rejects unknown keys, non-objects and wrong types', () => {
    expect(validateContact({ ...valid, to: 'attacker@x.com' })).toEqual({
      ok: false,
      field: 'body',
    });
    expect(validateContact(null).ok).toBe(false);
    expect(validateContact([valid]).ok).toBe(false);
    expect(validateContact({ ...valid, name: 42 }).ok).toBe(false);
    expect(validateContact({ ...valid, turnstileToken: '' }).ok).toBe(false);
    expect(validateContact({ ...valid, startedAt: 'now' }).ok).toBe(false);
  });
});

describe('looksAutomated', () => {
  const now = valid.startedAt + 60_000;
  it('flags a filled honeypot', () => {
    expect(looksAutomated({ website: 'http://spam', startedAt: valid.startedAt }, now)).toBe(true);
  });
  it('flags submissions faster than the minimum fill time', () => {
    expect(looksAutomated({ website: '', startedAt: now - MIN_FILL_MS + 1 }, now)).toBe(true);
    expect(looksAutomated({ website: '', startedAt: now - MIN_FILL_MS }, now)).toBe(false);
  });
  it('does not drop a message because the visitor clock runs ahead', () => {
    expect(looksAutomated({ website: '', startedAt: now + 30_000 }, now)).toBe(false);
  });
});

describe('isEmail / headerSafe', () => {
  it('recognises plain addresses only', () => {
    expect(isEmail('sam@example.com')).toBe(true);
    expect(isEmail('+91 98765 43210')).toBe(false);
    expect(isEmail('@sam on telegram')).toBe(false);
    expect(isEmail('a@b.c, evil@x.com')).toBe(false);
  });
  it('strips CR/LF from header values', () => {
    expect(headerSafe('hi\r\nBcc: x@y.z')).toBe('hi Bcc: x@y.z');
  });
});
