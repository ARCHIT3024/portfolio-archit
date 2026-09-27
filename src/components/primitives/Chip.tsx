import type { ReactNode } from 'react';
import styles from './Chip.module.css';

interface ChipProps {
  children: ReactNode;
  variant: 'desk' | 'facts' | 'history';
  /** Render as a `span` (inside a button, where lists aren't allowed). */
  inline?: boolean;
}

export function Chip({ children, variant, inline }: ChipProps) {
  const Tag = inline ? 'span' : 'li';
  return <Tag className={`${styles.chip} ${styles[variant]}`}>{children}</Tag>;
}

interface ChipListProps {
  children: ReactNode;
  className?: string;
  label?: string;
  inline?: boolean;
}

/** A wrapping row of chips (a list, so screen readers count them). */
export function ChipList({ children, className, label, inline }: ChipListProps) {
  const Tag = inline ? 'span' : 'ul';
  return (
    <Tag className={`${styles.list} ${className ?? ''}`} aria-label={label}>
      {children}
    </Tag>
  );
}
