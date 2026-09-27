import { THE_FILE } from '../../content/profile';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { IndexCard, IndexRow, SectionHeading } from '../primitives';
import styles from './TheFile.module.css';

export function TheFile() {
  const reveal = useRevealOnScroll('drop');
  return (
    <section id="file" className={styles.section} aria-labelledby="file-title">
      <div className={styles.inner}>
        <SectionHeading id="file-title" title={THE_FILE.title} />
        <div className={styles.layout}>
          <div className={styles.cardSlot}>
            <div {...reveal}>
              <IndexCard>
                <dl className={styles.rows}>
                  {THE_FILE.rows.map((row) => (
                    <IndexRow key={row.term} term={row.term} strong={row.strong}>
                      {row.detail}
                    </IndexRow>
                  ))}
                </dl>
              </IndexCard>
            </div>
          </div>
          <div className={styles.narrative}>
            <p className={styles.pull}>{THE_FILE.pull}</p>
            {THE_FILE.paragraphs.map((p) => (
              <p key={p.text.slice(0, 24)} className={styles.para}>
                {p.lead && <strong className={styles.lead}>{p.lead}</strong>}
                {p.lead && ' '}
                {p.text}
              </p>
            ))}
            <p className={styles.closing}>{THE_FILE.closing}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
