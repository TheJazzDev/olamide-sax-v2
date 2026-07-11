# Olamide Sax V2 — Build Spec

> Turns the approved V2 concept (`olamide-sax-cinematic-concept-v2.md`, built on
> `olamide-sax-cinematic-concept.md`) into concrete build requirements. **Fresh start,
> salvage content only.** Stack: HTML5 · modular CSS · vanilla JS (ES modules) · GSAP.
> No framework, no build step. Branch: `v2-build`. Built into a fresh `v2/` directory
> so V1 stays as reference until V2 replaces it.

## Global Constraints (bind every task)

- **No framework/CDN/Tailwind/build step.** Self-hosted GSAP + fonts. Dark-dominant, committed.
- **Design tokens (V2 palette, exact):** `--ink #0B0A08`, `--umber #171310`, `--bone #F3EDE3`,
  `--ash #A39A8C`, `--brass #B8863B`, `--brass-light #D8B87E`, `--ember #7A3B24`. Warm-biased
  neutrals only, never pure grey/black/white. Brass is primarily the Breath Line's color;
  ~1 brass element per viewport otherwise.
- **Typography:** high-contrast display serif (self-host Fraunces high-optical or similar) as the
  soloist; humanist grotesque body; wide-tracked uppercase label. One serif moment per viewport.
- **Progressive enhancement (non-negotiable):** content fully visible with JS off / GSAP failed /
  reduced-motion on. Never set content to opacity:0 in CSS unless gated behind a JS-added
  `.js-anim-ready` class. Split-text keeps real, selectable text in the a11y tree.
- **`prefers-reduced-motion`:** Breath Line becomes a static elegant line with node markers; no
  kinetic type, no smooth-scroll, no cursor, reveals instant. Fully honoured via matchMedia.
- **A11y:** semantic landmarks, one `<h1>`/page, correct heading order, ARIA on icon controls,
  alt text, visible focus, keyboard-operable (menu, tabs, timeline, forms). No mic / no audio
  capture ever. YouTube embeds facade-loaded (thumbnail → iframe on click).
- **Mobile-first, moderate mobile sizing** (~60–70% desktop), no horizontal body scroll at 375px.
  Frame + Breath Line survive on mobile (line as edge progress spine); kinetic type calms.
- **60fps:** transforms/opacity only; `ScrollTrigger.refresh()` after fonts + images.
- **Data-driven & placeholder-ready:** all media/press content in `v2/js/data.js`; every image/
  video slot is a marked placeholder that inherits design+motion when real content lands.
- **Files stay focused/small** (no monoliths); split by responsibility.
- **Nav/footer** duplicated identical across pages (no build step); flat `.html` pages at `v2/` root.

## Salvaged real content (carry over verbatim — the ONLY thing kept from V1)

- **Identity:** Olamide Sax (Olaniyan Olamide Phillips); Vocalist · Saxophonist · Keyboardist;
  UK-based, Nigerian-born; Founder & Lead Artist, Lammy Wonder Music; email
  olaniyanolamidephillip@gmail.com; United Kingdom.
- **Bio/heritage:** 10+ yrs; began percussionist; 2010 Yoruba percussion (cord/omele, djembe,
  omele bàtá, talking drum) → Afro-fusion (sax/vocals/keyboard/live improvisation).
- **Events:** ÀTÙPÀ at CAST (opening sax; role "Adigun"); ArtBomb (with The Skintone UK); Black
  History Month Doncaster (Mayor + council leaders); BME United Doncaster; Utopia Theatre open mic
  (1 Mar 2026); darts × Maya Productions traineeship; SBC Spotlight, Sheffield (Lord Mayor).
- **Press (real, verbatim):** New Telegraph — "Olamide Sax Delivers Afro-Fusion Performance At
  Black And Minority Ethnic United Doncaster Event"
  (https://newtelegraphng.com/olamide-sax-delivers-afro-fusion-performance-at-black-and-minority-ethnic-united-doncaster-event/);
  The Nation — "Olamide Sax Thrills Guests at Open Mic"
  (https://thenationonlineng.net/olamide-sax-thrills-guests-at-open-mic/); New Telegraph —
  "Olamide Sax Commands Spotlight Stage in Sheffield, Delivers Stirring Performance Before Lord
  Mayor" (https://newtelegraphng.com/olamide-sax-ignites-the-stage-with-stirring-performance-in-sheffield/).
- **Music:** Audiomack — "Gospel Medley", "Vibes Groove Mixtape" (URLs TODO).
- **Socials:** TikTok @olamidesax · Instagram @olamide.sax · Facebook (share URL) · YouTube
  @olamidesax. (Contact also uses Lammy Wonder variants.)
- **Images:** the 5 existing photos may be reused as placeholders in `v2/assets/images/` until
  real event photography arrives.

## Signature: The Breath Line (the defining component)

A single brass SVG/canvas path, driven by GSAP + scroll position/velocity (NO audio/mic):

- **Birth:** draws on load, assembles into a saxophone silhouette, dissolves into the spine.
- **Journey:** persistent scroll-spine — progress indicator, section connector, timeline, transition
  guide, nav locator. Flows on slow scroll, settles/sustains on pause, peaks at milestones.
- **Resolution:** resolves into the Olamide Sax wordmark/monogram at the booking CTA.
- **Reduced-motion:** static elegant line + node markers, no animation. Never blocks/traps scroll.

## Information Architecture (fresh IA)

Flat pages at `v2/` root:

- `index.html` — curated homepage (Featured Performance/Video/Gallery/Press + Explore Archive).
- `media.html` — archive hub → Performances (by year) · Gallery · Videos · Press tabs/sections.
- `gallery.html` — Photos · Behind the Scenes · Events (scalable grid / venue-walk).
- `press.html` — Articles · Features · Awards (editorial ledger).
- `timeline.html` — career milestones unfolding along the Breath Line.
- `about.html` — bio as movements (evolved).
- `artistic-practice.html` — genres/practice (evolved).
- `contact.html` — booking form (mailto + endpoint hook) + details + socials.

(Media may host Performances/Videos as sections OR they split into their own pages — the plan
decides; the IA above is the target. Timeline is its own page AND teased on home.)

## File Structure (fresh)

```
v2/
  index.html · media.html · gallery.html · press.html · timeline.html ·
  about.html · artistic-practice.html · contact.html
  partials/   nav.html · footer.html
  css/        reset · tokens · typography · layout · frame · components ·
              breath-line · media · motion · responsive
  js/         main · nav · smoothScroll · breathLine · reveal(kinetic) ·
              timeline · gallery · videos · tabs · cursor · contact · data · utils
  assets/     images/ (placeholders) · fonts/ (self-host) · vendor/ (gsap+plugins) · icons/
  README.md
```

## Build Phases → Tasks (subagent-driven, review-gated)

**Phase A — Foundation (screens + system)**

1. Scaffold + tokens (V2 palette) + typography + reset + layout grid + the film-frame + base CSS;
   self-host fonts + GSAP; placeholder assets. Temp preview page.
2. Nav + footer partials + shared components (buttons, links, labels, forms, cards) + nav JS.

**Phase B — Pages (semantic HTML screens, static first)** 3. Homepage (curated) — all featured sections + hero shell for the Breath Line + Explore Archive.
**[CHECKPOINT]** 4. Media + Gallery + Videos archives (scalable, data-driven) + Press (editorial). 5. Timeline + About + Artistic Practice + Contact. **[CHECKPOINT — all pages exist static]**

**Phase C — GSAP engine (the experience)** 6. Motion foundation: smooth scroll, kinetic-typography reveals, cursor, progressive-enhancement +
reduced-motion plumbing (the `.js-anim-ready` gate). 7. **The Breath Line** — birth (assembly) → journey (scroll-spine, velocity, peaks, nav locator) →
resolution (wordmark). The signature. **[CHECKPOINT]** 8. Media interactions + immersive transitions + pinned Craft movements + timeline-node unfolds +
still→clip / YouTube-facade blooms.

**Phase D — Polish** 9. A11y pass, performance (lazy/facade), responsive sweep, meta/favicons, README. Final review.

## Out of scope

No backend/DB/admin. No real media (placeholders until Olamide supplies). No framework. Real
content population is a later, separate pass (drop into `data.js` + marked slots).

## Verification

Static site, no test runner — each task verifies with concrete browser checks (render + behavior),
reduced-motion + JS-off/GSAP-fail visibility, no-horizontal-scroll at 375px, and honest screenshots
at checkpoints. Same review-gate discipline as the V1 build.
