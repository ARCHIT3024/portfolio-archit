import type { Ref } from 'react';
import { CASE_COPY, caseNum } from '../../content/cases';
import type { CaseFile } from '../../content/types';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { frameLayout } from '../../lib/images';
import { PhotoFrame, Pushpin, Stamp } from '../primitives';
import styles from './CaseCard.module.css';

interface CaseCardProps {
  item: CaseFile;
  dropDelay: number;
  stampDelay: number;
  onOpen: () => void;
  buttonRef: Ref<HTMLButtonElement>;
}

/** An index card pinned to the cork; opens the case folder. */
export function CaseCard({ item, dropDelay, stampDelay, onOpen, buttonRef }: CaseCardProps) {
  const reveal = useRevealOnScroll('drop', dropDelay);
  const cover = item.images[item.cover];
  return (
    <div {...reveal} className={styles.card}>
      <Pushpin className={styles.pin} />
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={`${CASE_COPY.openAria} ${item.name}`}
      >
        <span className={styles.head}>
          <span className={styles.num}>{caseNum(item.id)}</span>
          <Stamp variant="card" rot={item.stampRot} revealDelay={stampDelay}>
            {item.stamp}
          </Stamp>
        </span>
        <span className={styles.name}>{item.name}</span>
        <span className={styles.filed}>{item.filed}</span>
        <span className={styles.cover} style={{ '--cover-w': frameLayout(cover.ratio).coverWidth }}>
          <PhotoFrame slot={cover} variant="cover" sizes="240px" inline />
        </span>
        <span className={styles.open}>{CASE_COPY.openFile}</span>
      </button>
    </div>
  );
}
