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

## Getting started

Requires **Node 22 or newer** (see `.nvmrc`).

```bash
npm ci
npm run dev          # http://localhost:5173
```

Add `?intro=0` to the URL to skip the intro while you work.

### Running the contact form locally

The form needs the Pages Function, so run it through Wrangler instead of the Vite dev server:

```bash
cp .env.example .env.local        # Turnstile site key (the test key always passes)
cp .dev.vars.example .dev.vars    # function secrets; fill in your own Resend key
npm run pages:dev                 # builds, then serves dist/ + functions on :8788
```

`.env.local` and `.dev.vars` are gitignored. Never commit real keys.

## Scripts

| Command                  | What it does                                                           |
| ------------------------ | ---------------------------------------------------------------------- |
| `npm run dev`            | Vite dev server                                                        |
| `npm run build`          | Typecheck and production build to `dist/`                              |
| `npm run preview`        | Serve the production build on :4173                                    |
| `npm run pages:dev`      | Build, then run the site and its functions under Wrangler              |
| `npm run lint`           | ESLint (with jsx-a11y and react-hooks)                                 |
| `npm run typecheck`      | `tsc -b --noEmit`                                                      |
| `npm test`               | Vitest unit and component tests                                        |
| `npm run test:e2e`       | Playwright on desktop and mobile viewports, with axe                   |
| `npm run format`         | Prettier                                                               |
| `npm run images`         | `raw-assets/` → resized AVIF/WebP in `public/images/`, EXIF stripped   |
| `npm run og`             | Regenerate `public/og-image.png` from the built hero (needs `preview`) |

To run Playwright on your installed Chrome instead of downloading Chromium, use
`PW_CHANNEL=chrome npm run test:e2e`.

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

## Images and links

Original photos and screenshots go in `raw-assets/`, named as listed in
[`raw-assets/README.md`](raw-assets/README.md). Then run `npm run images`. The script resizes each image,
converts it to AVIF and WebP, strips metadata (including GPS) and writes the results to `public/images/`.
Originals are never committed. Links are read from `raw-assets/links.md`. The site shows the design's
placeholders for anything that hasn't been supplied.

## Deploying to Cloudflare Pages

Connect the repository in Cloudflare Pages with these settings:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 22

Pages picks up `functions/` automatically. Set these as **encrypted** environment variables in the
Pages project, never in `wrangler.toml` or in a `VITE_*` variable:

| Variable               | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `RESEND_API_KEY`       | Sends the contact email                        |
| `TURNSTILE_SECRET_KEY` | Verifies the Turnstile token server-side       |
| `CONTACT_TO`           | Where tips are delivered                       |

`VITE_TURNSTILE_SITE_KEY` is public and is baked in at build time. `CONTACT_FROM` and `ALLOWED_ORIGIN`
live in `wrangler.toml`. Update `ALLOWED_ORIGIN` and the canonical URL in `index.html` if the project
name or domain changes.

## Security

- A strict Content-Security-Policy and security headers in `public/_headers`.
- No `innerHTML`, `dangerouslySetInnerHTML` or `eval`.
- Every contact field is validated again on the server, the origin is checked and Turnstile is verified
  before anything is sent.
- Secrets exist only in encrypted Pages variables and the local, gitignored `.dev.vars`.
