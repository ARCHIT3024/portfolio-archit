import { useEffect, useRef, useState } from 'react';
import { HIDEOUTS, LINKS } from '../../content/links';
import { CONTACT } from '../../content/profile';
import { IndexRow, LinkButton, SectionHeading, TextLink } from '../primitives';
import { ContactForm } from './ContactForm';
import styles from './Contact.module.css';

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  // Load Turnstile only when the section is ~600px from the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return (
    <section ref={ref} id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className={styles.inner}>
        <div className={styles.left}>
          <SectionHeading id="contact-title" title={CONTACT.title} />
          <p className={styles.intro}>{CONTACT.intro}</p>
          <dl className={styles.card}>
            <IndexRow term={CONTACT.rows.direct}>
              <a href={`mailto:${CONTACT.email}`} className={styles.mail}>
                {CONTACT.email}
              </a>
            </IndexRow>
            <IndexRow term={CONTACT.rows.base}>{CONTACT.rows.baseDetail}</IndexRow>
            <IndexRow term={CONTACT.rows.availability}>{CONTACT.rows.availabilityDetail}</IndexRow>
            <IndexRow term={CONTACT.rows.hideouts}>
              <span className={styles.hideouts}>
                {HIDEOUTS.map((h, i) => (
                  <span key={h.label} className={styles.hideout}>
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <TextLink href={h.href}>{h.label}</TextLink>
                  </span>
                ))}
              </span>
            </IndexRow>
          </dl>
          <div className={styles.resume}>
            {LINKS.resume ? (
              <LinkButton
                variant="primary"
                href={LINKS.resume}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                {CONTACT.resumeCta}
              </LinkButton>
            ) : (
              <>
                <LinkButton variant="primary" aria-disabled="true" data-todo="link">
                  {CONTACT.resumeCta}
                </LinkButton>
                <span className={styles.todo}>{CONTACT.resumeTodo}</span>
              </>
            )}
          </div>
        </div>
        <ContactForm near={near} />
      </div>
    </section>
  );
}
