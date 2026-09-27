import {
  COMMENDATIONS,
  COMMENDATIONS_COPY,
  COMMENDATION_STAGGER_MS,
  PENDING_STAMP_DELAY_MS,
} from '../../content/commendations';
import type { Commendation } from '../../content/types';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { Label, SectionHeading, Stamp } from '../primitives';
import styles from './Commendations.module.css';

export function Commendations() {
  return (
    <section id="commendations" className={styles.section} aria-labelledby="commendations-title">
      <div className={styles.inner}>
        <SectionHeading
          id="commendations-title"
          title={COMMENDATIONS_COPY.title}
          subhead={COMMENDATIONS_COPY.subhead}
        />
        <ul className={styles.grid}>
          {COMMENDATIONS.map((c, i) => (
            <CommendationCard key={c.id} item={c} delay={i * COMMENDATION_STAGGER_MS} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function CommendationCard({ item, delay }: { item: Commendation; delay: number }) {
  const reveal = useRevealOnScroll<HTMLDivElement>('drop', delay);
  return (
    <li className={styles.slot} style={{ '--rot': `${item.rot}deg` }}>
      <div {...reveal} className={`${styles.card} ${item.pending ? styles.pending : ''}`}>
        <Label>{item.label}</Label>
        {typeof item.body === 'string' ? (
          <p className={styles.body}>{item.body}</p>
        ) : (
          <ul className={`${styles.body} ${styles.list}`}>
            {item.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
        {item.pending && (
          <Stamp
            className={styles.stamp}
            variant="pending"
            rot={item.pending.stampRot}
            revealDelay={PENDING_STAMP_DELAY_MS}
          >
            {item.pending.stamp}
          </Stamp>
        )}
      </div>
    </li>
  );
}
