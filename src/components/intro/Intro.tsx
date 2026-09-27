import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { INTRO } from '../../content/profile';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { DUR, EASE, fade, settled } from '../../lib/motion';
import { FolderTab } from '../primitives';
import styles from './Intro.module.css';

interface IntroProps {
  heroTabRef: RefObject<HTMLDivElement | null>;
  heroCardRef: RefObject<HTMLDivElement | null>;
  /** The overlay has started leaving (reveals may begin). */
  onEnding: () => void;
  /** The overlay is gone; unmount it. */
  onDone: () => void;
}

/** Read a design token's computed value (keyframes need concrete values). */
const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Beam radius: `max(130px, 20% of the viewport's short side)`. */
const beamRadius = () => Math.max(130, Math.min(window.innerWidth, window.innerHeight) * 0.2);

/**
 * "Find his file" (docs/app-flow.md §2). A flashlight drifts over a dark desk until the
 * visitor moves it; clicking the file turns the lights on and morphs it into the hero folder.
 * Skip, or any key, fades the overlay out.
 */
export function Intro({ heroTabRef, heroCardRef, onEnding, onDone }: IntroProps) {
  const reduced = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const folderRef = useRef<HTMLButtonElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pencilRef = useRef<HTMLDivElement>(null);

  const ending = useRef(false);
  const lightsOn = useRef(false);
  const timers = useRef<number[]>([]);
  const raf = useRef(0);
  const beam = useRef<{ x: number; y: number } | null>(null);
  const userMoved = useRef(false);

  const finish = useCallback(() => {
    cancelAnimationFrame(raf.current);
    onDone();
  }, [onDone]);

  /** Skip / any key: fade the whole overlay out. */
  const endIntro = useCallback(() => {
    timers.current.forEach(clearTimeout);
    if (ending.current) return;
    ending.current = true;
    cancelAnimationFrame(raf.current);
    onEnding();
    const overlay = overlayRef.current;
    if (!overlay || reduced) {
      finish();
      return;
    }
    void settled(fade(overlay, 1, 0, DUR.introSkipFade)).then(finish);
  }, [finish, onEnding, reduced]);

  const drawBeam = useCallback(() => {
    const dark = darkRef.current;
    const p = beam.current;
    if (!dark || !p) return;
    const r = beamRadius();
    dark.style.setProperty('--beam-x', `${p.x}px`);
    dark.style.setProperty('--beam-y', `${p.y}px`);
    dark.style.setProperty('--beam-r', `${r}px`);
    dark.style.setProperty('--beam-r-inner', `${r * 0.55}px`);
  }, []);

  // Idle drift until the pointer takes over; then follow it (rAF, refs only).
  useEffect(() => {
    if (reduced) return;
    const t0 = performance.now();
    const loop = (t: number) => {
      if (ending.current || lightsOn.current) return;
      if (!userMoved.current) {
        const k = (t - t0) / 1000;
        beam.current = {
          x: window.innerWidth * (0.5 + 0.3 * Math.sin(k * 0.8)),
          y: window.innerHeight * (0.45 + 0.22 * Math.sin(k * 1.3 + 1)),
        };
      }
      drawBeam();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    const onPointer = (e: PointerEvent) => {
      userMoved.current = true;
      beam.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [reduced, drawBeam]);

  // Any key ends the intro.
  useEffect(() => {
    const onKey = () => endIntro();
    window.addEventListener('keydown', onKey);
    const pending = timers.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      pending.forEach(clearTimeout);
      cancelAnimationFrame(raf.current);
    };
  }, [endIntro]);

  /** The file morphs into the hero folder, then its cover swings open. */
  const morph = useCallback(() => {
    const overlay = overlayRef.current;
    const scene = sceneRef.current;
    const btn = folderRef.current;
    const tab = tabRef.current;
    const body = bodyRef.current;
    const cover = coverRef.current;
    const heroTab = heroTabRef.current;
    const heroCard = heroCardRef.current;
    if (!overlay || !scene || !btn || !tab || !body || !cover || !heroTab || !heroCard) {
      endIntro();
      return;
    }
    ending.current = true;
    onEnding();
    window.scrollTo({ top: 0, behavior: 'instant' });

    const tr = heroTab.getBoundingClientRect();
    const cr = heroCard.getBoundingClientRect();
    const ts = getComputedStyle(heroTab);
    const from = {
      left: `${btn.offsetLeft}px`,
      top: `${btn.offsetTop}px`,
      width: `${btn.offsetWidth}px`,
      height: `${btn.offsetHeight}px`,
    };
    const to = {
      left: `${cr.left}px`,
      top: `${tr.top}px`,
      width: `${cr.width}px`,
      height: `${cr.bottom - tr.top}px`,
    };
    // A one-off, 850ms morph of an absolutely positioned element inside the fixed overlay:
    // it animates box geometry (as the prototype does) because scaling would smear the type.
    btn.classList.add(styles.morphing ?? '');
    Object.assign(btn.style, from);

    const opts = { duration: DUR.introMorph, easing: EASE.morph, fill: 'forwards' } as const;
    const r0 = '0 8px 8px 8px';
    const r1 = '0 12px 12px 12px';
    btn.animate(
      [
        { ...from, transform: 'rotate(4deg)' },
        { ...to, transform: 'rotate(0deg)' },
      ],
      opts,
    );
    tab.animate(
      [
        {
          padding: '8px 16px 6px',
          fontSize: '11px',
          letterSpacing: '0.14em',
          borderRadius: '8px 8px 0 0',
        },
        {
          padding: ts.padding,
          fontSize: ts.fontSize,
          letterSpacing: ts.letterSpacing,
          borderRadius: '10px 10px 0 0',
        },
      ],
      opts,
    );
    body.animate(
      [
        { borderRadius: r0, boxShadow: token('--shadow-intro-folder') },
        { borderRadius: r1, boxShadow: token('--shadow-folder') },
      ],
      opts,
    );
    cover.animate([{ borderRadius: r0 }, { borderRadius: r1 }], opts);
    [noteRef, ringRef, pencilRef].forEach(
      (p) => p.current && fade(p.current, 1, 0, DUR.introPropsFade),
    );

    timers.current.push(
      window.setTimeout(() => {
        overlay.classList.add(styles.clear ?? '');
        scene.animate([{ backgroundColor: token('--kraft') }, { backgroundColor: 'transparent' }], {
          duration: DUR.introSceneFade,
          easing: 'ease-out',
          fill: 'forwards',
        });
        fade(tab, 1, 0, DUR.introSceneFade, 'linear');
        body.classList.add(styles.clear ?? '');
        body.animate([{ boxShadow: token('--shadow-folder') }, { boxShadow: 'none' }], {
          duration: DUR.introShadow,
          fill: 'forwards',
        });
        Array.from(cover.children).forEach((c) =>
          fade(c, 1, 0, DUR.introSceneFade, 'linear', DUR.introCoverDelay),
        );
        const swing = cover.animate(
          [
            { transform: 'perspective(2200px) rotateY(0deg)', opacity: 1, filter: 'brightness(1)' },
            {
              transform: 'perspective(2200px) rotateY(-95deg)',
              opacity: 1,
              filter: 'brightness(.8)',
              offset: 0.55,
            },
            {
              transform: 'perspective(2200px) rotateY(-160deg)',
              opacity: 0,
              filter: 'brightness(.7)',
            },
          ],
          {
            duration: DUR.introCover,
            delay: DUR.introCoverDelay,
            easing: EASE.cover,
            fill: 'forwards',
          },
        );
        void settled(swing).then(finish);
      }, DUR.introMorph + 30),
    );
  }, [endIntro, finish, heroCardRef, heroTabRef, onEnding]);

  /** Click the file: the lights flicker on, then the morph. */
  const onFolderClick = useCallback(() => {
    if (lightsOn.current || ending.current) return;
    lightsOn.current = true;
    cancelAnimationFrame(raf.current);
    hintRef.current?.classList.add(styles.hidden ?? '');
    const dark = darkRef.current;
    if (reduced || !dark) {
      endIntro();
      return;
    }
    const flicker = dark.animate(
      [
        { opacity: 1 },
        { opacity: 0.25, offset: 0.2 },
        { opacity: 0.8, offset: 0.35 },
        { opacity: 0 },
      ],
      { duration: DUR.introFlicker, easing: 'linear', fill: 'forwards' },
    );
    void settled(flicker).then(() => {
      if (ending.current) return;
      timers.current.push(window.setTimeout(morph, DUR.introPause));
    });
  }, [endIntro, morph, reduced]);

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <div ref={sceneRef} className={styles.scene}>
        <div ref={noteRef} className={styles.note}>
          <p>{INTRO.note}</p>
        </div>
        <div ref={ringRef} className={styles.ring} aria-hidden="true" />
        <div ref={pencilRef} className={styles.pencil} aria-hidden="true" />
        <button
          ref={folderRef}
          type="button"
          className={styles.folder}
          aria-label={INTRO.folderAria}
          onClick={onFolderClick}
        >
          <FolderTab ref={tabRef} variant="intro">
            {INTRO.folderTab}
          </FolderTab>
          <div ref={bodyRef} className={styles.body}>
            <div ref={coverRef} className={styles.cover}>
              <span className={styles.coverName}>{INTRO.folderName}</span>
              <span className={styles.coverStamp}>{INTRO.folderStamp}</span>
            </div>
          </div>
        </button>
      </div>
      <div
        ref={darkRef}
        className={`${styles.dark} ${reduced ? styles.lit : ''}`}
        aria-hidden="true"
      />
      <div ref={hintRef} className={styles.hint}>
        {INTRO.hint}
      </div>
      <button type="button" className={styles.skip} onClick={endIntro}>
        {INTRO.skip}
      </button>
    </div>
  );
}
