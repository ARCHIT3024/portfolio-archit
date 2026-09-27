import { NAV_COPY } from '../../content/nav';
import styles from './LampToggle.module.css';

export function LampToggle({ lightsOff, onToggle }: { lightsOff: boolean; onToggle: () => void }) {
  return (
    <button type="button" className={styles.toggle} aria-pressed={lightsOff} onClick={onToggle}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{lightsOff ? NAV_COPY.lampOn : NAV_COPY.lampOff}</span>
    </button>
  );
}
