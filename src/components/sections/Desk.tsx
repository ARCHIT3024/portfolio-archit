import { useRef, useState, type PointerEvent } from 'react';
import { DESK, DESK_COPY } from '../../content/desk';
import type { DeskId, DeskObject } from '../../content/types';
import { Chip, ChipList, SectionHeading } from '../primitives';
import styles from './Desk.module.css';

/** The Detective's Desk: seven objects under a hanging lamp (docs/app-flow.md §5). */
export function Desk() {
  const [examined, setExamined] = useState<DeskId | null>(null);
  const hoverMouse = useRef(false);

  const onEnter = (id: DeskId) => (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    hoverMouse.current = true;
    setExamined(id);
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    hoverMouse.current = false;
    setExamined(null);
  };
  // Mouse click keeps the hovered card open; touch, pen and keyboard toggle.
  const onToggle = (id: DeskId) => () =>
    setExamined((cur) => (hoverMouse.current ? id : cur === id ? null : id));

  return (
    <section id="desk" className={styles.section} aria-labelledby="desk-title">
      <div className={styles.lamp} aria-hidden="true">
        <span className={styles.cord} />
        <span className={styles.shade} />
        <span className={styles.bulb} />
      </div>
      <div className={styles.inner}>
        <SectionHeading
          id="desk-title"
          title={DESK_COPY.title}
          subhead={DESK_COPY.subhead}
          tone="dark"
          align="center"
        />
        <ul className={styles.grid}>
          {DESK.map((d) => (
            <li key={d.id}>
              <DeskCard
                item={d}
                open={examined === d.id}
                onPointerEnter={onEnter(d.id)}
                onPointerLeave={onLeave}
                onClick={onToggle(d.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface DeskCardProps {
  item: DeskObject;
  open: boolean;
  onPointerEnter: (e: PointerEvent) => void;
  onPointerLeave: (e: PointerEvent) => void;
  onClick: () => void;
}

function DeskCard({ item, open, onPointerEnter, onPointerLeave, onClick }: DeskCardProps) {
  const detailId = `desk-${item.id}-detail`;
  return (
    <button
      type="button"
      className={styles.card}
      style={{ '--rot': `${item.rot}deg` }}
      aria-expanded={open}
      aria-controls={detailId}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
    >
      <span className={styles.tack} aria-hidden="true" />
      <span className={styles.cat}>{item.cat}</span>
      <span className={styles.obj}>{item.obj}</span>
      {item.note && <span className={styles.note}>{item.note}</span>}
      <span className={styles.drawer}>
        <span className={styles.hint} aria-hidden="true">
          {DESK_COPY.hint}
        </span>
        <span id={detailId} className={styles.detail}>
          {item.tags && (
            <ChipList inline>
              {item.tags.map((t) => (
                <Chip key={t} variant="desk" inline>
                  {t}
                </Chip>
              ))}
            </ChipList>
          )}
          {item.text && <span className={styles.text}>{item.text}</span>}
        </span>
      </span>
    </button>
  );
}
