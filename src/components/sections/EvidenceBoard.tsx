import { useEffect, useRef } from 'react';
import { BOARD } from '../../config';
import { CASES } from '../../content/cases';
import { EVIDENCE_COPY } from '../../content/profile';
import type { CaseId } from '../../content/types';
import { useViewportMode } from '../../hooks/useViewportWidth';
import { DUR } from '../../lib/motion';
import { CaseCard } from '../case/CaseCard';
import { RedString } from '../case/RedString';
import { SectionHeading } from '../primitives';
import styles from './EvidenceBoard.module.css';

/** Stacked-mode tilt alternates ±0.8°. */
const STACKED_TILT = 0.8;

interface EvidenceBoardProps {
  onOpenCase: (id: CaseId) => void;
  /** Card buttons by case id, so the folder can hand focus back on close. */
  registerCard: (id: CaseId, el: HTMLButtonElement | null) => void;
}

export function EvidenceBoard({ onOpenCase, registerCard }: EvidenceBoardProps) {
  const mode = useViewportMode();
  const board = mode === 'board';
  const frameRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Board mode: scale the fixed 1200×1060 canvas to the frame width.
  useEffect(() => {
    const frame = frameRef.current;
    const el = boardRef.current;
    if (!board || !frame || !el) return;
    const ro = new ResizeObserver(() => {
      el.style.setProperty('--board-scale', String(frame.clientWidth / BOARD.width));
    });
    ro.observe(frame);
    return () => ro.disconnect();
  }, [board]);

  return (
    <section id="evidence" className={styles.section} aria-labelledby="evidence-title">
      <div className={styles.inner}>
        <SectionHeading
          id="evidence-title"
          title={EVIDENCE_COPY.title}
          subhead={EVIDENCE_COPY.subhead}
          tone="dark"
        />
        <div ref={frameRef} className={styles.frame}>
          <div ref={boardRef} className={board ? styles.board : styles.stacked}>
            <div className={styles.canvas}>
              {board && <RedString boardRef={boardRef} />}
              <ul className={styles.cards}>
                {CASES.map((c, i) => {
                  const delay = board ? i * DUR.boardStagger : 0;
                  return (
                    <li
                      key={c.id}
                      className={styles.slot}
                      style={{
                        '--x': `${c.board.left}px`,
                        '--y': `${c.board.top}px`,
                        '--rot': `${board ? c.board.rot : i % 2 ? STACKED_TILT : -STACKED_TILT}deg`,
                      }}
                    >
                      <CaseCard
                        item={c}
                        dropDelay={delay}
                        stampDelay={delay + DUR.boardStampOffset}
                        onOpen={() => onOpenCase(c.id)}
                        buttonRef={(el) => registerCard(c.id, el)}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
