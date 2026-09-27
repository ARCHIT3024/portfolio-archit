import { HISTORY, HISTORY_COPY, sortHistory } from '../../content/history';
import type { HistoryEntry } from '../../content/types';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { Chip, ChipList, FolderTab, PhotoFrame, SectionHeading, TextLink } from '../primitives';
import styles from './CaseHistory.module.css';

/** Tabs step right by position; reveals stagger by position. */
const TAB_STEP_PCT = 12;
const TAB_MAX_PCT = 70;
const REVEAL_STEP_MS = 80;

const ENTRIES = sortHistory(HISTORY);

export function CaseHistory() {
  return (
    <section id="history" className={styles.section} aria-labelledby="history-title">
      <div className={styles.inner}>
        <SectionHeading
          id="history-title"
          title={HISTORY_COPY.title}
          subhead={HISTORY_COPY.subhead}
        />
        <div className={styles.stack}>
          {ENTRIES.map((entry, i) => (
            <HistoryFolder key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HistoryFolder({ entry, index }: { entry: HistoryEntry; index: number }) {
  const reveal = useRevealOnScroll<HTMLElement>('drop', index * REVEAL_STEP_MS);
  const offset = index * TAB_STEP_PCT;
  const withImage = !!entry.image;
  return (
    <article
      {...reveal}
      className={`${styles.folder} ${index === 0 ? styles.first : ''}`}
      style={{
        '--tab-offset': `${offset}%`,
        '--tab-max': `${Math.min(TAB_MAX_PCT, 100 - offset)}%`,
      }}
      aria-labelledby={`history-${entry.id}`}
    >
      <FolderTab variant="history" className={styles.tab}>
        {entry.tab}
      </FolderTab>
      <div className={`${styles.card} ${withImage ? styles.withImage : ''}`}>
        <div className={styles.text}>
          {entry.kind === 'education' && (
            <span className={styles.edu}>{HISTORY_COPY.educationLabel}</span>
          )}
          <h3 id={`history-${entry.id}`} className={styles.title}>
            {entry.title}
          </h3>
          <div className={styles.meta}>
            {entry.meta}
            {entry.metaLink && (
              <>
                {' · '}
                <TextLink href={entry.metaLink.href}>{entry.metaLink.label}</TextLink>
              </>
            )}
          </div>
          {entry.body && (
            <p className={styles.body}>
              {entry.body.lead && <span className={styles.lead}>{entry.body.lead}</span>}
              {entry.body.lead && ' '}
              {entry.body.text}
            </p>
          )}
          {entry.chips && (
            <ChipList className={styles.chips}>
              {entry.chips.map((c) => (
                <Chip key={c} variant="history">
                  {c}
                </Chip>
              ))}
            </ChipList>
          )}
        </div>
        {entry.image && (
          <PhotoFrame
            className={styles.shot}
            slot={entry.image}
            variant="history"
            sizes="(min-width: 760px) 440px, 90vw"
          />
        )}
      </div>
    </article>
  );
}
