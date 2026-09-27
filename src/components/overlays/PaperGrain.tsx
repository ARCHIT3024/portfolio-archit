import styles from './PaperGrain.module.css';

/** Fixed paper-grain texture over the whole page (config: PAPER_GRAIN). */
export function PaperGrain() {
  return <div className={styles.grain} aria-hidden="true" />;
}
