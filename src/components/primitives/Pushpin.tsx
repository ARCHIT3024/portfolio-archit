import styles from './Pushpin.module.css';

/** A red pushpin centred 9px above its parent's top edge. Decorative. */
export function Pushpin({ className }: { className?: string }) {
  return <span aria-hidden="true" className={`${styles.pin} ${className ?? ''}`} />;
}
