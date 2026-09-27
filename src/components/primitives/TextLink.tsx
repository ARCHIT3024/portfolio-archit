import type { ReactNode } from 'react';
import styles from './TextLink.module.css';

interface TextLinkProps {
  href: string | null;
  children: ReactNode;
  className?: string;
  /** Open in a new tab (external links). */
  external?: boolean;
}

/**
 * A link that may not exist yet. With `href: null` (the owner hasn't supplied it) the text
 * renders unlinked and marked as a TODO, instead of a dead `#`.
 */
export function TextLink({ href, children, className, external = true }: TextLinkProps) {
  if (href === null) {
    return (
      <span className={`${styles.todo} ${className ?? ''}`} data-todo="link">
        {children}
      </span>
    );
  }
  const ext = external && /^https?:/.test(href);
  return (
    <a
      href={href}
      className={className}
      target={ext ? '_blank' : undefined}
      rel={ext ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  );
}
