import type { ElementType, ReactNode } from 'react';
import styles from './Label.module.css';

/** Typewriter label: Special Elite, uppercase, oxblood. */
export function Label({
  as: Tag = 'div',
  children,
  className,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}) {
  return <Tag className={`${styles.label} ${className ?? ''}`}>{children}</Tag>;
}
