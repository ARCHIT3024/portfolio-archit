import { useEffect, useRef, useState, type FormEvent } from 'react';
import { LIMITS, MIN_FILL_MS, type ContactPayload } from '../../../shared/contact';
import { CONTACT, CONTACT_FORM } from '../../content/profile';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTurnstile } from '../../hooks/useTurnstile';
import { sendContact } from '../../lib/contactClient';
import { DUR, EASE, playDrop, settled } from '../../lib/motion';
import { Button, Label } from '../primitives';
import styles from './ContactForm.module.css';

type Status = 'idle' | 'verifying' | 'sending' | 'sent' | 'error';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The ruled-paper tip form (docs/app-flow.md §7). `near` turns true as #contact approaches. */
export function ContactForm({ near }: { near: boolean }) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<'rate' | 'generic'>('generic');
  const reduced = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const turnstile = useTurnstile(widgetRef, near);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // The thank-you note drops in and takes focus.
  useEffect(() => {
    if (status !== 'sent' || !noteRef.current) return;
    if (!reduced) playDrop(noteRef.current);
    noteRef.current.focus({ preventScroll: true });
  }, [status, reduced]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'verifying' || status === 'sending') return;
    const data = new FormData(e.currentTarget);
    const text = (key: string) => String(data.get(key) ?? '');

    setStatus(turnstile.hasToken() ? 'sending' : 'verifying');
    let token: string;
    try {
      token = await turnstile.getToken();
    } catch {
      setError('generic');
      setStatus('error');
      return;
    }
    setStatus('sending');

    // Humans rarely beat the bot timer; if they do, hold the envelope a moment.
    const elapsed = Date.now() - startedAt.current;
    if (elapsed < MIN_FILL_MS) await wait(MIN_FILL_MS - elapsed + 100);

    const payload: ContactPayload = {
      name: text('name'),
      reach: text('reach'),
      subject: text('subject'),
      message: text('message'),
      website: text('website'),
      turnstileToken: token,
      startedAt: startedAt.current,
    };
    const result = await sendContact(payload);
    turnstile.reset();

    if (result === 'sent') {
      const form = formRef.current;
      if (form && !reduced) {
        await settled(
          form.animate(
            [
              { transform: 'rotate(0.6deg)', opacity: 1 },
              { transform: 'translateY(48px) rotate(2deg) scaleY(.96)', opacity: 0 },
            ],
            { duration: DUR.formSlide, easing: EASE.slide, fill: 'forwards' },
          ),
        );
      }
      setStatus('sent');
      return;
    }
    setError(result === 'rate' ? 'rate' : 'generic');
    setStatus('error');
  }

  const busy = status === 'verifying' || status === 'sending';

  return (
    <div>
      <div className="visually-hidden" aria-live="polite">
        {status === 'sending' ? CONTACT_FORM.sending : ''}
        {status === 'verifying' ? CONTACT_FORM.verifying : ''}
      </div>
      {status === 'sent' ? (
        <div ref={noteRef} className={styles.sent} tabIndex={-1} role="status">
          <p>{CONTACT_FORM.sent}</p>
        </div>
      ) : (
        <form ref={formRef} className={styles.form} onSubmit={onSubmit} aria-busy={busy}>
          <Field
            label={CONTACT_FORM.name}
            name="name"
            maxLength={LIMITS.name}
            required
            autoComplete="name"
          />
          <Field
            label={CONTACT_FORM.reach}
            name="reach"
            maxLength={LIMITS.reach}
            required
            autoComplete="email"
          />
          <Field label={CONTACT_FORM.subject} name="subject" maxLength={LIMITS.subject} />
          <label className={styles.field}>
            <span className={styles.label}>{CONTACT_FORM.message}</span>
            <textarea
              className={styles.textarea}
              name="message"
              rows={5}
              maxLength={LIMITS.message}
              required
            />
          </label>
          <div className={styles.honeypot} aria-hidden="true">
            <label>
              {CONTACT_FORM.honeypot}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>
          <div className={styles.challenge}>
            <div ref={widgetRef} />
            <Label className={styles.turnstileNote}>{CONTACT_FORM.turnstileNote}</Label>
          </div>
          {status === 'error' && (
            <p className={styles.error} role="alert">
              {error === 'rate' ? (
                CONTACT_FORM.errorRate
              ) : (
                <>
                  {CONTACT_FORM.errorGeneric}{' '}
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                </>
              )}
            </p>
          )}
          <Button variant="cta" type="submit" className={styles.submit} disabled={busy}>
            {status === 'sending'
              ? CONTACT_FORM.sending
              : status === 'verifying'
                ? CONTACT_FORM.verifying
                : CONTACT_FORM.submit}
          </Button>
        </form>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  maxLength: number;
  required?: boolean;
  autoComplete?: string;
}

function Field({ label, name, maxLength, required, autoComplete }: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        type="text"
        name={name}
        maxLength={maxLength}
        required={required}
        autoComplete={autoComplete}
      />
    </label>
  );
}
