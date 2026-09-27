import type { ReactNode } from 'react';
import { Pushpin } from './Pushpin';
import styles from './IndexCard.module.css';

/** Ruled index card with a red top margin, pinned at the top centre. */
export function IndexCard({
  children,
  pinned = true,
  className,
}: {
  children: ReactNode;
  pinned?: boolean;
  className?: string;
}) {
  return (
    <div className={`${styles.wrap} ${className ?? ''}`}>
      {pinned && <Pushpin />}
      <div className={styles.card}>{children}</div>
    </div>
  );
}

/** A LABEL + body row for an index card `dl`. */
export function IndexRow({
  term,
  children,
  strong,
}: {
  term: string;
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <div>
      <dt className={styles.term}>{term}</dt>
      <dd className={`${styles.detail} ${strong ? styles.strong : ''}`}>{children}</dd>
    </div>
  );
}
