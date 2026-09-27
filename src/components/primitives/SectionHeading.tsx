import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  id: string;
  title: string;
  subhead?: string;
  tone?: 'light' | 'dark';
  align?: 'start' | 'center';
}

/** Section `h2` plus its typewritten subhead. */
export function SectionHeading({
  id,
  title,
  subhead,
  tone = 'light',
  align = 'start',
}: SectionHeadingProps) {
  return (
    <div
      className={`${styles.head} ${styles[tone]} ${styles[align]} ${subhead ? '' : styles.solo}`}
    >
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {subhead && <p className={styles.subhead}>{subhead}</p>}
    </div>
  );
}
