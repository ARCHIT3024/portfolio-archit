import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { loadTurnstile, TURNSTILE_SITE_KEY, type TurnstileApi } from '../lib/turnstile';

const TOKEN_WAIT_MS = 15_000;

type Waiter = { resolve: (t: string) => void; reject: (e: Error) => void };

/**
 * Render a Turnstile widget into `container` once `load` turns true (the contact section is
 * near the viewport). `getToken()` resolves with a fresh token, waiting for the challenge if
 * needed; `reset()` asks for a new one after each attempt.
 */
export function useTurnstile(container: RefObject<HTMLElement | null>, load: boolean) {
  const api = useRef<TurnstileApi | null>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const failed = useRef(false);
  const waiters = useRef<Waiter[]>([]);

  const settle = useCallback((value: string | Error) => {
    const pending = waiters.current;
    waiters.current = [];
    for (const w of pending) {
      if (typeof value === 'string') w.resolve(value);
      else w.reject(value);
    }
  }, []);

  useEffect(() => {
    if (!load || !TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    loadTurnstile().then(
      (ts) => {
        const el = container.current;
        if (cancelled || !el || widgetId.current) return;
        api.current = ts;
        widgetId.current = ts.render(el, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: 'interaction-only',
          size: 'flexible',
          theme: 'light',
          action: 'contact',
          callback: (t) => {
            token.current = t;
            settle(t);
          },
          'expired-callback': () => {
            token.current = null;
          },
          'error-callback': () => {
            token.current = null;
            settle(new Error('challenge'));
          },
        });
      },
      () => {
        failed.current = true;
        settle(new Error('challenge'));
      },
    );
    return () => {
      cancelled = true;
      if (api.current && widgetId.current) api.current.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [container, load, settle]);

  const getToken = useCallback((): Promise<string> => {
    if (token.current) return Promise.resolve(token.current);
    if (!TURNSTILE_SITE_KEY || failed.current) return Promise.reject(new Error('challenge'));
    return new Promise<string>((resolve, reject) => {
      const waiter: Waiter = { resolve, reject };
      waiters.current.push(waiter);
      setTimeout(() => {
        waiters.current = waiters.current.filter((w) => w !== waiter);
        reject(new Error('challenge'));
      }, TOKEN_WAIT_MS);
    });
  }, []);

  const hasToken = useCallback(() => token.current !== null, []);

  const reset = useCallback(() => {
    token.current = null;
    if (api.current && widgetId.current) api.current.reset(widgetId.current);
  }, []);

  return { getToken, hasToken, reset };
}
