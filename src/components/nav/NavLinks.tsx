import { NAV_LINKS } from '../../content/nav';
import type { SectionId } from '../../content/types';
import styles from './NavLinks.module.css';

/** The six inline section links (≥ 1100px). */
export function NavLinks({ active }: { active: SectionId | null }) {
  return (
    <ul className={styles.links}>
      {NAV_LINKS.map((link) => (
        <li key={link.id}>
          <a
            href={`#${link.id}`}
            className={styles.link}
            aria-current={active === link.id ? 'location' : undefined}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
