import { HIDEOUTS } from '../../content/links';
import { NAV_LINKS } from '../../content/nav';
import { FOOTER } from '../../content/profile';
import { TextLink } from '../primitives';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.line}>{FOOTER.line}</p>
        <nav aria-label={FOOTER.linksLabel}>
          <ul className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className={styles.link}>
                  {link.label}
                </a>
              </li>
            ))}
            {HIDEOUTS.map((h) => (
              <li key={h.label}>
                <TextLink href={h.href} className={styles.link}>
                  {h.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.copyright}>{FOOTER.copyright}</div>
      </div>
    </footer>
  );
}
