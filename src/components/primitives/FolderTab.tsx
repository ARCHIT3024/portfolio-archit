import type { ReactNode, Ref } from 'react';
import styles from './FolderTab.module.css';

interface FolderTabProps {
  children: ReactNode;
  variant: 'hero' | 'history' | 'intro';
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** The manila tab sticking up from a folder. */
export function FolderTab({ children, variant, className, ref }: FolderTabProps) {
  return (
    <div ref={ref} className={`${styles.tab} ${styles[variant]} ${className ?? ''}`}>
      {children}
    </div>
  );
}
