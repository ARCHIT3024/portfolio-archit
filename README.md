# Case File — Archit Khandelwal

The portfolio of **Archit Khandelwal**, Machine Learning & Cloud Engineer in Chennai, told as a noir
detective's case file. Find the file by torchlight, follow the red string across the evidence board, open
the case folders and slide a tip under the door.

A single-page React + TypeScript site built with Vite. Everything runs on free tiers: Cloudflare Pages and
Pages Functions, Resend, Turnstile and GitHub Actions.

## What's in the file

- **The intro.** A torch drifts over a dark desk until you take it. Click the file and the lights flicker
  on, then it morphs into the hero folder. Skip it with any key or with `?intro=0`.
- **The evidence board.** Four cases pinned to cork and tied with red string that draws itself as you
  scroll. Below 1000px it stacks.
- **Case folders.** Each case opens as a real modal. It traps focus, closes on Esc and supports prev/next.
  `#case-001`-style links open a folder directly.
- **The desk.** Objects you can examine by mouse, touch or keyboard.
- **Case history and commendations.** Work first, then education.
- **Lights off.** A lamp mode where the pointer carries the light. The site remembers your choice.
- **Case-file cursors.** A magnifier over anything clickable and a torch wherever the pointer is the
  light. Touch and pen keep the system cursors.
- **Contact.** A form checked server-side and protected by Turnstile. It's delivered by Resend.

Every animation has a `prefers-reduced-motion` path. The site is keyboard navigable and uses semantic
landmarks. CI runs axe on both viewports and fails on serious violations.

## Stack

| Layer    | Choice                                                                    |
| -------- | ------------------------------------------------------------------------- |
| UI       | React, TypeScript (strict), Vite                                          |
| Styling  | CSS Modules and design tokens in CSS custom properties                    |
| Motion   | Web Animations API and `requestAnimationFrame`, no animation library      |
| Fonts    | Self-hosted via @fontsource (DM Serif Display, IBM Plex Sans, Special Elite) |
| Backend  | Cloudflare Pages Function (`functions/api/contact.ts`) → Resend           |
| Spam     | Cloudflare Turnstile                                                      |
| Tests    | Vitest and React Testing Library; Playwright with axe (1440×900 and 390×844) |
| CI       | GitHub Actions: audit, lint, typecheck, unit, build, e2e                  |


## Project layout

```
src/
  components/    one component per file, next to its .module.css
    case/        evidence board cards, red string, case folder
    intro/       torch intro
    nav/         nav, Case Index menu, lamp toggle
    overlays/    lamp light, paper grain
    primitives/  stamps, pins, paper clips, folder tabs, index cards, buttons
    sections/    hero, the file, board, desk, history, commendations, contact, footer
  content/       all copy and data, typed (no strings in components)
  hooks/  lib/   pointer, reveal, reduced motion, scroll lock, motion helpers
  styles/        tokens.css (every color, font, shadow, easing), global.css, fonts
functions/api/   contact.ts: Turnstile verify → Resend
shared/          contact validation shared by the client and the function
scripts/         image processing and OG image generation
public/          static files, _headers (CSP and security headers), cursors, images
tests/           e2e (Playwright) and unit tests
```
