import { useCallback, useEffect, useRef, useState } from 'react';
import { PAPER_GRAIN, SHOW_INTRO } from './config';
import { isCaseId } from './content/cases';
import { NAV_LINKS } from './content/nav';
import type { CaseId } from './content/types';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { useLampPreference } from './hooks/useLampPreference';
import { useReducedMotion } from './hooks/useReducedMotion';
import { RevealContext } from './hooks/useRevealOnScroll';
import { CaseFolder, type CaseFolderHandle } from './components/case/CaseFolder';
import { Intro } from './components/intro/Intro';
import { Nav } from './components/nav/Nav';
import { LampOverlay } from './components/overlays/LampOverlay';
import { PaperGrain } from './components/overlays/PaperGrain';
import { CaseHistory } from './components/sections/CaseHistory';
import { Commendations } from './components/sections/Commendations';
import { Contact } from './components/sections/Contact';
import { Desk } from './components/sections/Desk';
import { EvidenceBoard } from './components/sections/EvidenceBoard';
import { Footer } from './components/sections/Footer';
import { Hero } from './components/sections/Hero';
import { TheFile } from './components/sections/TheFile';

type IntroState = 'active' | 'ending' | 'done';

/** Only the literal `?intro=0` disables the intro (docs/app-flow.md §1). */
function introWanted(): boolean {
  return SHOW_INTRO && new URLSearchParams(window.location.search).get('intro') !== '0';
}

/** `#case-003` → `'003'`, matched against the whitelist of case ids. */
function caseFromHash(): CaseId | null {
  const m = /^#case-(\d{3})$/.exec(window.location.hash);
  return m?.[1] && isCaseId(m[1]) ? m[1] : null;
}

const FOLDER_STATE = { caseFolder: true } as const;
const isFolderEntry = (state: unknown) =>
  typeof state === 'object' &&
  state !== null &&
  (state as { caseFolder?: unknown }).caseFolder === true;

export default function App() {
  const [intro, setIntro] = useState<IntroState>(() => (introWanted() ? 'active' : 'done'));
  const [openCaseId, setOpenCaseId] = useState<CaseId | null>(null);
  const { lightsOff, flicker, toggle: toggleLamp } = useLampPreference();
  const reduced = useReducedMotion();

  const heroTabRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const folderRef = useRef<CaseFolderHandle>(null);
  const cardRefs = useRef(new Map<CaseId, HTMLButtonElement>());
  const openRef = useRef<CaseId | null>(null);
  const focusCard = useRef<CaseId | null>(null);
  const deepLink = useRef<CaseId | null>(caseFromHash());

  useEffect(() => {
    openRef.current = openCaseId;
  }, [openCaseId]);

  useBodyScrollLock(intro !== 'done');

  // Reveal targets only start hidden when motion is allowed.
  useEffect(() => {
    document.documentElement.classList.toggle('js-motion', !reduced);
  }, [reduced]);

  const registerCard = useCallback((id: CaseId, el: HTMLButtonElement | null) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  }, []);

  const openCase = useCallback((id: CaseId) => {
    setOpenCaseId(id);
    history.pushState(FOLDER_STATE, '', `#case-${id}`);
  }, []);

  const switchCase = useCallback((id: CaseId) => {
    setOpenCaseId(id);
    history.replaceState(FOLDER_STATE, '', `#case-${id}`);
  }, []);

  const onFolderClosed = useCallback(() => {
    focusCard.current = openRef.current;
    openRef.current = null;
    setOpenCaseId(null);
    if (isFolderEntry(history.state)) history.back();
    else if (caseFromHash())
      history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);

  // Hand focus back to the card once the page is interactive again.
  useEffect(() => {
    if (openCaseId !== null || !focusCard.current) return;
    cardRefs.current.get(focusCard.current)?.focus();
    focusCard.current = null;
  }, [openCaseId]);

  // Browser Back closes the folder; Forward reopens it.
  useEffect(() => {
    const onPop = () => {
      const id = caseFromHash();
      if (id) {
        if (openRef.current === null) setOpenCaseId(id);
        else if (openRef.current !== id) setOpenCaseId(id);
      } else if (openRef.current !== null) {
        folderRef.current?.close();
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // The page renders after the browser tried to follow #section, so jump there once it's showing.
  useEffect(() => {
    if (intro !== 'done') return;
    const id = window.location.hash.slice(1);
    if (!NAV_LINKS.some((l) => l.id === id)) return;
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }),
    );
  }, [intro]);

  // A shared #case-00N link opens that folder once the page is showing.
  useEffect(() => {
    if (intro !== 'done' || !deepLink.current) return;
    setOpenCaseId(deepLink.current);
    deepLink.current = null;
  }, [intro]);

  const onIntroEnding = useCallback(() => setIntro('ending'), []);
  const onIntroDone = useCallback(() => setIntro('done'), []);

  const pageInert = intro !== 'done' || openCaseId !== null;

  return (
    <RevealContext.Provider value={intro === 'done'}>
      <div className="page" inert={pageInert}>
        <Nav lightsOff={lightsOff} onToggleLamp={toggleLamp} />
        <main>
          <Hero tabRef={heroTabRef} cardRef={heroCardRef} />
          <TheFile />
          <EvidenceBoard onOpenCase={openCase} registerCard={registerCard} />
          <Desk />
          <CaseHistory />
          <Commendations />
          <Contact />
        </main>
        <Footer />
      </div>
      {openCaseId && (
        <CaseFolder
          ref={folderRef}
          caseId={openCaseId}
          onSwitch={switchCase}
          onClosed={onFolderClosed}
        />
      )}
      {lightsOff && <LampOverlay flicker={flicker} />}
      {PAPER_GRAIN && <PaperGrain />}
      {intro !== 'done' && (
        <Intro
          heroTabRef={heroTabRef}
          heroCardRef={heroCardRef}
          onEnding={onIntroEnding}
          onDone={onIntroDone}
        />
      )}
    </RevealContext.Provider>
  );
}
