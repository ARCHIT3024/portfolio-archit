import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type Ref,
} from 'react';
import { CASE_COPY, CASES, caseNum } from '../../content/cases';
import type { CaseId } from '../../content/types';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useViewportMode } from '../../hooks/useViewportWidth';
import { EVIDENCE_ROT } from '../../lib/images';
import { DUR, EASE, playThump, settled } from '../../lib/motion';
import { Chip, ChipList, Label, PhotoFrame, Stamp, TextLink } from '../primitives';
import styles from './CaseFolder.module.css';

export interface CaseFolderHandle {
  /** Play the exit animation, then call `onClosed`. */
  close: () => void;
}

interface CaseFolderProps {
  caseId: CaseId;
  onSwitch: (id: CaseId) => void;
  /** Called once the folder has finished closing. */
  onClosed: () => void;
  ref?: Ref<CaseFolderHandle>;
}

/**
 * The open case file: a modal dialog on desktop, a full-screen sheet below 760px
 * (docs/app-flow.md §4). Focus moves in, is trapped, Esc closes.
 */
export function CaseFolder({ caseId, onSwitch, onClosed, ref }: CaseFolderProps) {
  const reduced = useReducedMotion();
  const mobile = useViewportMode() === 'mobile';
  const index = Math.max(
    0,
    CASES.findIndex((c) => c.id === caseId),
  );
  const current = CASES[index]!;
  const prev = CASES[index - 1];
  const next = CASES[index + 1];

  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const shownId = useRef<CaseId | null>(null);

  useBodyScrollLock(true);
  useFocusTrap(dialogRef, true);

  const close = useCallback(async () => {
    if (closing.current) return;
    closing.current = true;
    const dialog = dialogRef.current;
    if (dialog && !reduced) {
      backdropRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: DUR.backdropOut,
        fill: 'forwards',
      });
      await settled(
        dialog.animate(
          mobile
            ? [{ transform: 'none' }, { transform: 'translateY(100%)' }]
            : [
                { opacity: 1, transform: 'none' },
                { opacity: 0, transform: 'translateY(24px) scale(.98)' },
              ],
          { duration: DUR.folderClose, easing: EASE.exit, fill: 'forwards' },
        ),
      );
    }
    onClosed();
  }, [mobile, onClosed, reduced]);

  useImperativeHandle(ref, () => ({ close: () => void close() }), [close]);

  // Opening, and switching between cases.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const first = shownId.current === null;
    shownId.current = caseId;
    dialog.scrollTop = 0;

    if (first) {
      closeRef.current?.focus({ preventScroll: true });
      const flap = flapRef.current;
      if (reduced || mobile) {
        if (flap) flap.hidden = true;
        if (reduced) return;
      }
      backdropRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: DUR.backdropIn,
        easing: 'ease-out',
      });
      dialog.animate(
        mobile
          ? [{ transform: 'translateY(100%)' }, { transform: 'none' }]
          : [
              { opacity: 0, transform: 'translateY(36px) scale(.97)' },
              { opacity: 1, transform: 'none' },
            ],
        { duration: mobile ? DUR.sheetRise : DUR.folderRise, easing: EASE.outSoft },
      );
      if (flap && !mobile) {
        const swing = flap.animate(
          [
            { transform: 'perspective(1800px) rotateX(0deg)', opacity: 1 },
            { transform: 'perspective(1800px) rotateX(-100deg)', opacity: 0 },
          ],
          { duration: DUR.flap, delay: DUR.flapDelay, easing: EASE.flap, fill: 'both' },
        );
        void settled(swing).then(() => {
          flap.hidden = true;
        });
      }
      if (stampRef.current)
        playThump(stampRef.current, mobile ? DUR.folderStampMobile : DUR.folderStampDesktop);
      return;
    }

    titleRef.current?.focus({ preventScroll: true });
    if (reduced) return;
    dialog.animate(
      [
        { opacity: 0.4, transform: 'translateX(18px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: DUR.switchCase, easing: EASE.outSoft },
    );
    if (stampRef.current) playThump(stampRef.current, DUR.switchStamp);
    // Only the case id should replay the open/switch choreography.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  // Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        void close();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  const num = caseNum(current.id);
  const titleId = `case-title-${current.id}`;

  return (
    <div className={`${styles.overlay} ${mobile ? styles.mobile : ''}`}>
      <div
        ref={backdropRef}
        className={styles.backdrop}
        onClick={() => void close()}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className={styles.folder}
        role="dialog"
        aria-modal="true"
        aria-label={`${num} ${current.name}`}
      >
        <div ref={flapRef} className={styles.flap} aria-hidden="true">
          {num} — {current.name}
        </div>
        <div className={styles.bar}>
          <span className={styles.barLabel}>
            {num} — {current.name}
          </span>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={() => void close()}
          >
            {CASE_COPY.close}
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.titleRow}>
            <div className={styles.titleBlock}>
              <h2 ref={titleRef} id={titleId} className={styles.title} tabIndex={-1}>
                {current.name}
              </h2>
              <div className={styles.filed}>
                {CASE_COPY.filed} {current.filed}
              </div>
            </div>
            <span ref={stampRef} className={styles.stampWrap}>
              <Stamp variant="folder" rot={current.stampRot}>
                {current.stamp}
              </Stamp>
            </span>
          </div>

          <div className={styles.photos}>
            {current.images.map((img, j) => {
              const [w, h] = img.ratio;
              return (
                <PhotoFrame
                  key={img.label}
                  className={styles.photo}
                  slot={img}
                  variant="evidence"
                  clip={j === 0}
                  sizes="(min-width: 760px) 360px, 90vw"
                  style={{
                    '--grow': (w / h).toFixed(3),
                    '--min-w': w < h ? '120px' : '200px',
                    '--rot': `${EVIDENCE_ROT[j] ?? 0}deg`,
                  }}
                />
              );
            })}
          </div>

          <div className={styles.columns}>
            <div className={styles.brief}>
              <h3 className={styles.briefTitle}>{CASE_COPY.briefing}</h3>
              {current.brief.map((p) => (
                <p key={p.slice(0, 24)} className={styles.briefPara}>
                  {p}
                </p>
              ))}
            </div>
            <aside className={styles.facts} aria-labelledby={`${titleId}-facts`}>
              <h3 id={`${titleId}-facts`} className={styles.factsTitle}>
                {CASE_COPY.facts}
              </h3>
              <ul className={styles.factList}>
                {current.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className={styles.factsBlock}>
                <Label className={styles.toolsLabel}>{CASE_COPY.tools}</Label>
                <ChipList>
                  {current.tools.map((t) => (
                    <Chip key={t} variant="facts">
                      {t}
                    </Chip>
                  ))}
                </ChipList>
              </div>
              <ul
                className={`${styles.factsBlock} ${styles.links}`}
                aria-label={CASE_COPY.linksLabel}
              >
                {current.links.map((l) => (
                  <li key={l.label} className={styles.link}>
                    <TextLink href={l.href} className={styles.linkText}>
                      {l.label}
                    </TextLink>
                    {l.note && !l.href && <span className={styles.note}>{l.note}</span>}
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <div className={styles.pager}>
            {prev && (
              <button
                type="button"
                className={`${styles.pageBtn} ${styles.prev}`}
                onClick={() => onSwitch(prev.id)}
              >
                <span className={styles.pageDir}>{CASE_COPY.prev}</span>
                <span className={styles.pageName}>
                  {caseNum(prev.id)} — {prev.name}
                </span>
              </button>
            )}
            <span className={styles.spacer} />
            {next && (
              <button
                type="button"
                className={`${styles.pageBtn} ${styles.next}`}
                onClick={() => onSwitch(next.id)}
              >
                <span className={styles.pageDir}>{CASE_COPY.next}</span>
                <span className={styles.pageName}>
                  {caseNum(next.id)} — {next.name}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
