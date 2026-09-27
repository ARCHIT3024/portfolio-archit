import styles from './PaperClip.module.css';

/** A paper clip biting the top edge of a photo. `portrait` is the large double-loop clip. */
export function PaperClip({ variant }: { variant: 'portrait' | 'evidence' }) {
  if (variant === 'evidence') return <span aria-hidden="true" className={styles.evidence} />;
  return (
    <>
      <span aria-hidden="true" className={styles.outer} />
      <span aria-hidden="true" className={styles.inner} />
    </>
  );
}
