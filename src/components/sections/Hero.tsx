import type { Ref } from 'react';
import { HERO } from '../../content/profile';
import { FolderTab, LinkButton, PhotoFrame, Stamp } from '../primitives';
import styles from './Hero.module.css';

interface HeroProps {
  /** The intro morphs its folder onto these two boxes. */
  tabRef?: Ref<HTMLDivElement>;
  cardRef?: Ref<HTMLDivElement>;
}

export function Hero({ tabRef, cardRef }: HeroProps) {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-name">
      <div className={styles.inner}>
        <FolderTab ref={tabRef} variant="hero">
          {HERO.tab}
        </FolderTab>
        <div ref={cardRef} className={styles.card}>
          <div className={styles.copy}>
            <Stamp variant="hero" rot={-4} revealDelay={200}>
              {HERO.stamp}
            </Stamp>
            <h1 id="hero-name" className={styles.name}>
              {HERO.name}
            </h1>
            <p className={styles.tagline}>{HERO.tagline}</p>
            <p className={styles.intro}>{HERO.intro}</p>
            <div className={styles.ctas}>
              <LinkButton variant="primary" href={HERO.primaryCta.href}>
                {HERO.primaryCta.label}
              </LinkButton>
              <LinkButton variant="outline" href={HERO.secondaryCta.href}>
                {HERO.secondaryCta.label}
              </LinkButton>
            </div>
          </div>
          <PhotoFrame
            className={styles.portrait}
            slot={HERO.portrait}
            variant="portrait"
            caption={HERO.portraitCaption}
            clip
            eager
            sizes="(min-width: 760px) 380px, 90vw"
          />
        </div>
      </div>
    </section>
  );
}
