import { useEffect, useRef } from 'react';
import { NAV_BRAND, NAV_COPY, NAV_LINKS } from '../../content/nav';
import type { SectionId } from '../../content/types';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useNavInline } from '../../hooks/useViewportWidth';
import { CaseIndexMenu } from './CaseIndexMenu';
import { LampToggle } from './LampToggle';
import { NavLinks } from './NavLinks';
import styles from './Nav.module.css';

const SECTION_IDS: readonly SectionId[] = NAV_LINKS.map((l) => l.id);

interface NavProps {
  lightsOff: boolean;
  onToggleLamp: () => void;
}

export function Nav({ lightsOff, onToggleLamp }: NavProps) {
  const inline = useNavInline();
  const active = useActiveSection(SECTION_IDS);
  const ref = useRef<HTMLElement>(null);

  // Expose the nav height for scroll-margin-top on sections.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--nav-h', `${el.offsetHeight}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header ref={ref} className={styles.nav}>
      <a href="#top" className={styles.brand}>
        {NAV_BRAND}
      </a>
      <div className={styles.right}>
        {inline ? (
          <nav aria-label={NAV_COPY.primaryNavLabel}>
            <NavLinks active={active} />
          </nav>
        ) : (
          <CaseIndexMenu active={active} />
        )}
        <LampToggle lightsOff={lightsOff} onToggle={onToggleLamp} />
      </div>
    </header>
  );
}
