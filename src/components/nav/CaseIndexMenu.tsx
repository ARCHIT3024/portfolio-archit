import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { NAV_COPY, NAV_LINKS } from '../../content/nav';
import type { SectionId } from '../../content/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { DUR, EASE, settled } from '../../lib/motion';
import styles from './CaseIndexMenu.module.css';

/**
 * "Case Index" disclosure for < 1100px (docs/design.md §8, app-flow.md §3). Not a modal:
 * Esc, an outside click, choosing a link or unmounting (crossing 1100px) closes it.
 */
export function CaseIndexMenu({ active }: { active: SectionId | null }) {
  const [open, setOpen] = useState(false);
  const closingRef = useRef(false);
  const reduced = useReducedMotion();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const close = useCallback(
    async (returnFocus: boolean) => {
      if (closingRef.current) return;
      closingRef.current = true;
      const panel = panelRef.current;
      if (panel && !reduced) {
        await settled(
          panel.animate(
            [
              { opacity: 1, transform: 'none' },
              { opacity: 0, transform: 'translateY(-8px)' },
            ],
            { duration: DUR.menuClose, easing: EASE.exit, fill: 'forwards' },
          ),
        );
      }
      closingRef.current = false;
      setOpen(false);
      if (returnFocus) buttonRef.current?.focus({ preventScroll: true });
    },
    [reduced],
  );

  // Drop in and focus the first link.
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    panel.getAnimations().forEach((a) => a.cancel());
    firstLinkRef.current?.focus({ preventScroll: true });
    if (!reduced)
      panel.animate(
        [
          { opacity: 0, transform: 'translateY(-8px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: DUR.menuOpen, easing: EASE.outSoft },
      );
  }, [open, reduced]);

  // Esc and outside clicks.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void close(true);
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      void close(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close]);

  return (
    <div className={styles.menu}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? void close(true) : setOpen(true))}
      >
        <span className={styles.glyph} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        {NAV_COPY.menuButton}
      </button>
      <div ref={panelRef} id={panelId} className={styles.panel} hidden={!open}>
        <nav aria-label={NAV_COPY.menuLabel}>
          <ol className={styles.list}>
            {NAV_LINKS.map((link, i) => (
              <li key={link.id}>
                <a
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={`#${link.id}`}
                  className={styles.row}
                  aria-current={active === link.id ? 'location' : undefined}
                  onClick={() => void close(true)}
                >
                  <span className={styles.num}>{link.num}</span>
                  <span className={styles.name}>{link.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
