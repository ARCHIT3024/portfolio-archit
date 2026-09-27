import { useEffect, useState } from 'react';
import type { SectionId } from '../content/types';

/**
 * The section currently in the middle band of the viewport (docs/app-flow.md §3).
 * `null` while the hero (or anything unlisted) is in view.
 */
export function useActiveSection(ids: readonly SectionId[]): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const visible = new Set<SectionId>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = e.target.id as SectionId;
          if (e.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [ids]);

  return active;
}
