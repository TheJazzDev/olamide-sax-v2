# Olamide Sax Creative Rebuild — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or
> superpowers:executing-plans to implement task-by-task. Steps use `- [ ]` for tracking.
>
> **Verification note:** This is a static presentation site with no test runner. TDD's
> automated red/green loop does not apply; inventing a JS test harness for a GSAP/DOM site
> would be wasteful. Each task instead ends with an explicit **visual/behavioral check** run
> in a browser, plus a commit. That is the honest verification for this work.

**Goal:** Build a premium, award-gallery-caliber static website for Olamide Sax in the
approved **Afro-Futurist Rhythm** direction, using only HTML5, CSS3, vanilla JS (ES modules),
and GSAP.

**Architecture:** Self-contained static site in a new top-level `web/` folder (existing
Next.js app untouched). Modular CSS (design tokens → components) and ES-module JS
(feature-isolated). Content is real HTML for accessibility/SEO; GSAP progressively enhances.
One design system with three tonal modes (Afro-Futurist / Midnight Brass / Quiet Virtuoso).

**Tech Stack:** HTML5, CSS3 (custom properties, grid/flex, clamp), Vanilla JS (ES modules),
GSAP + ScrollTrigger + Observer (self-hosted local copies), inline SVG icons, self-hosted
`@font-face` fonts.

## Global Constraints

- No React, Next.js, Vue, Angular, Tailwind, Bootstrap, jQuery — verbatim from brief.
- No CDN dependencies at runtime; GSAP and fonts are **self-hosted** in `web/assets/`.
- Single committed **dark** visual world; no light theme.
- All colour/type/spacing/radius/shadow/motion expressed as CSS custom properties.
- Mobile-first responsive; moderate mobile text/padding (~60–70% of desktop); test at 375px.
- `prefers-reduced-motion` fully honoured (motion → simple fade/none); visible focus states;
  one `<h1>` per page; semantic landmarks; ARIA on icon controls; alt text.
- Nav + footer are duplicated identical partials in each HTML file (no framework; works from
  `file://`); keep them byte-identical across pages.
- Content is REAL and verbatim where the brief provides it. Missing assets → on-brand,
  clearly `TODO`-commented placeholders. Never delete a section for a missing asset.
- Files stay focused/small (user preference: no large monolith files); split by responsibility.
- Palette tokens (exact): `--indigo #12101F`, `--indigo-deep #0A0912`, `--gold #C9A227`,
  `--gold-light #E8D48B`, `--terra #D2552E`, `--teal #2EC4B6`, `--cream #F3EDE1`, `--dim #8C8578`.

---

## File Structure

```
web/
  index.html                    Home (Afro-Futurist)
  about/index.html              About (Midnight Brass / cinematic)
  artistic-practice/index.html
  performances/index.html
  media/index.html              (Afro-Futurist gallery; data-driven)
  press/index.html              (Quiet Virtuoso)
  contact/index.html            (Quiet Virtuoso)
  partials/
    nav.html                    reference copy of nav markup (source of truth to duplicate)
    footer.html                 reference copy of footer markup
  css/
    reset.css
    variables.css               all design tokens
    typography.css              @font-face + type scale
    layout.css                  container, section rhythm, grid scaffolding
    components.css              buttons, chips, cards, nav, footer, forms, tabs, marquee
    modes.css                   the 3 tonal modes (mode-afro / mode-brass / mode-quiet)
    animations.css              CSS keyframes + reduced-motion fallbacks
    responsive.css              breakpoint overrides
  js/
    main.js                     entry; imports + inits per-page
    utils.js                    $ / $$ selectors, prefersReducedMotion(), on()
    navigation.js               mobile menu toggle, active link, scroll lock
    smoothScroll.js             GSAP-based smooth scroll (guarded)
    reveal.js                   GSAP ScrollTrigger reveals + split-text
    gallery.js                  horizontal pinned gallery (Media/Home)
    tabs.js                     Media tabs + video category filter over data.js
    cursor.js                   custom cursor / hover magnetism
    data.js                     static content (videos/audio/photos/press) + TODO placeholders
  assets/
    images/                     optimised copies of public/images/*
    fonts/                      self-hosted display + body woff2
    vendor/                     gsap.min.js, ScrollTrigger.min.js, Observer.min.js
    icons/                      (icons inlined in markup; folder for source SVGs)
```

---

### Task 1: Project scaffold, assets, design tokens, base CSS

**Files:**
- Create: `web/css/reset.css`, `web/css/variables.css`, `web/css/typography.css`,
  `web/css/layout.css`, `web/css/animations.css`, `web/css/responsive.css`
- Create: `web/assets/images/` (copied+optimised from `public/images/`),
  `web/assets/fonts/`, `web/assets/vendor/`
- Create: `web/index.html` (temporary token-preview page, replaced in Task 3)

**Interfaces:**
- Produces: CSS custom properties in `:root` (palette tokens above; `--step-0..--step-8`
  type scale via clamp; `--space-*` scale; `--radius-*`; `--shadow-*`; `--ease` tokens;
  `--maxw`), and utility classes `.container`, `.section`, `.eyebrow`, `.u-visually-hidden`.
- Produces: `@font-face` families `"Display"` (heavy wide grotesque) and `"Body"` (humanist
  sans), plus `"Editorial"` (contrast serif, italic) for brass mode.

- [ ] **Step 1: Copy & optimise images**
  Copy `public/images/*` into `web/assets/images/` (keep originals). Downscale to ≤1600px long
  edge for web using `sips`. Keep filenames descriptive (e.g. `portrait.jpg`, `perf.jpg`,
  `hero.jpg`).

- [ ] **Step 2: Acquire self-hosted fonts & GSAP**
  Place woff2 files in `web/assets/fonts/` for a heavy wide grotesque display (Anton/Archivo
  Black family), a humanist body sans, and an italic contrast serif. Place `gsap.min.js`,
  `ScrollTrigger.min.js`, `Observer.min.js` in `web/assets/vendor/`. (If a font/plugin cannot
  be fetched, leave a `TODO` note in `typography.css`/`variables.css` and fall back to a close
  system stack so nothing renders broken.)

- [ ] **Step 3: Write `reset.css`**
  Modern reset: `box-sizing:border-box`, margin zeroing, `img{max-width:100%;display:block}`,
  `body` base, `:focus-visible` visible outline, `@media (prefers-reduced-motion:reduce)` global
  guard, `html{scroll-behavior` left to JS smooth-scroll}.

- [ ] **Step 4: Write `variables.css`**
  Define all tokens from Global Constraints: palette, warm-biased neutrals, type scale
  (`--step-*` clamp values matching the brief's mobile-first scale), spacing scale, radii,
  shadows (incl. gold glow), easing (`--ease-out: cubic-bezier(.16,1,.3,1)`), `--maxw:1300px`.

- [ ] **Step 5: Write `typography.css`**
  `@font-face` for Display/Body/Editorial (self-hosted, `font-display:swap`). Base body type,
  heading defaults, `text-wrap:balance` on headings, `.eyebrow` (wide-tracked uppercase caps).

- [ ] **Step 6: Write `layout.css`, `animations.css`, `responsive.css`**
  `layout.css`: `.container` (max-width + responsive padding), `.section` rhythm (clamp
  vertical padding), grid helpers. `animations.css`: keyframes (marquee, beat-pulse, grain,
  spotlight drift) + reduced-motion neutralisation. `responsive.css`: sm/md/lg/xl overrides.

- [ ] **Step 7: Temporary token-preview `index.html`**
  Minimal page linking all CSS, showing swatches + type scale + a display headline, to verify
  tokens/fonts render.

- [ ] **Step 8: Visual check**
  Open `web/index.html`. Confirm: display font is the heavy wide grotesque; palette swatches
  match hex values; type scale steps read distinctly; reduced-motion (OS setting) disables the
  demo keyframe. Confirm no console errors and no horizontal body scroll at 375px.

- [ ] **Step 9: Commit**
  `git add web/ && git commit -m "feat(web): scaffold, assets, design tokens, base CSS"`

---

### Task 2: Nav + footer partials and shared components

**Files:**
- Create: `web/partials/nav.html`, `web/partials/footer.html`
- Create: `web/css/components.css`
- Create/Modify: `web/js/utils.js`, `web/js/navigation.js`, `web/js/main.js`

**Interfaces:**
- Consumes: tokens/utilities from Task 1.
- Produces: `utils.js` exports `$(sel,root)`, `$$(sel,root)`, `on(el,evt,fn)`,
  `prefersReducedMotion()`. `navigation.js` exports `initNavigation()`. `main.js` imports and
  calls per-page inits. Nav markup class contract: `.site-nav`, `.site-nav__logo`,
  `.site-nav__links`, `.site-nav__cta`, `.nav-toggle`, `.mobile-menu`, `.mobile-menu[data-open]`.
- Produces: component classes consumed by all pages: `.btn`, `.btn--gold`, `.btn--ghost`,
  `.chip`, `.card`, `.marquee`, `.tabs`, `.form-field`, `.icon` (inline SVG sizing).

- [ ] **Step 1: Author nav partial**
  Semantic `<header><nav>`: logo (inline SVG music mark + wordmark), 7 links (Home, About,
  Artistic Practice, Performances, Media, Press, Contact), "Book Now" CTA, mobile toggle
  button with `aria-label`/`aria-expanded`, and full-screen `.mobile-menu` overlay. Extract
  needed Lucide icons as inline SVG.

- [ ] **Step 2: Author footer partial**
  Brand blurb, social links (TikTok/Instagram/Facebook/YouTube — real URLs from brief, inline
  SVG icons, `aria-label`s), quick links, contact (email/location), Lammy Wonder Music +
  "Book for Events" CTA, bottom bar with dynamic year via small inline script or JS.

- [ ] **Step 3: Write `components.css`**
  Style buttons/chips/cards/nav/footer/forms/tabs/marquee using tokens. Nav: fixed, blurred
  indigo, gold active state. Mobile menu: full-screen indigo overlay, staggered link entrance
  (CSS), rotate-on-hover close. Hover/focus states on all interactive elements.

- [ ] **Step 4: Write `utils.js` + `navigation.js` + `main.js`**
  `navigation.js`: toggle `.mobile-menu[data-open]`, set `aria-expanded`, lock body scroll,
  close on link click / Escape, focus management, mark active link by pathname. `main.js`:
  import inits, run `initNavigation()` on DOMContentLoaded.

- [ ] **Step 5: Wire partials into the temp index**
  Paste nav + footer markup into `web/index.html`; link `main.js` as `<script type="module">`.

- [ ] **Step 6: Visual + behavioral check**
  Desktop: nav fixed/blurred, active link gold, hover states work. Mobile (375px): toggle opens
  full-screen menu, `aria-expanded` flips, body scroll locks, Escape + link-click close it,
  focus is trapped/returned, footer year is current. Keyboard-only nav reaches every control
  with visible focus. No console errors.

- [ ] **Step 7: Commit**
  `git add web/ && git commit -m "feat(web): nav + footer partials, shared components, nav JS"`

---

### Task 3: Home page (Afro-Futurist signature) — static build

**Files:**
- Create: `web/index.html` (replaces temp), `web/css/modes.css` (add `.mode-afro`)
- Modify: `web/css/components.css` (marquee/gallery-card specifics if needed)

**Interfaces:**
- Consumes: Task 1 tokens, Task 2 nav/footer + components.
- Produces: DOM hooks for motion (Task 6/7): `[data-animate]` values `hero-title`, `fade`,
  `chips`, `gallery`, `feature`, `cta`; `.mode-afro` root class; `.hero-gallery` scroller;
  `.marquee__track`; `#gallery` section id.

- [ ] **Step 1: Build Home markup (real content)**
  Sections in narrative order: cinematic hero (kicker "Afro-Fusion · Gospel · Live
  Improvisation", `<h1>OLAMIDE SAX</h1>`, sub "Vocalist · Saxophonist · Keyboardist", lede
  from brief, Watch/Book CTAs, portrait) → genre marquee strip (Gospel/Afrobeat/Highlife/
  Worship) → "The Live World" horizontal gallery (ÀTÙPÀ at CAST, Black History Month, Utopia
  Theatre — real images/placeholders) → Roots teaser (Yoruba percussion → Afro-fusion) →
  career-highlight feature (Mayor of Doncaster) → booking CTA. One `<h1>`; semantic sections.

- [ ] **Step 2: Write `.mode-afro` in `modes.css`**
  Indigo ground, layered percussion-pattern back layer, grain overlay, gold/terracotta/teal
  punctuation. Hero grid asymmetry; oversized display type; marquee + gallery styling.

- [ ] **Step 3: Add `data-animate` hooks & `TODO` asset comments**
  Tag animatable elements; add `<!-- TODO: replace with real ÀTÙPÀ photo -->` etc. where images
  are placeholders.

- [ ] **Step 4: Visual check (static, no GSAP yet)**
  Open Home. Confirm: hero reads as a poster, real copy present, marquee animates (CSS),
  horizontal gallery scrolls, all placeholders on-brand, responsive at 375/768/1280, no
  horizontal body overflow, nav/footer identical to Task 2.

- [ ] **Step 5: Commit**
  `git add web/ && git commit -m "feat(web): home page (Afro-Futurist) static build"`

**→ CHECKPOINT: review Home before continuing.**

---

### Task 4: About (Midnight Brass) + Artistic Practice + Performances

**Files:**
- Create: `web/about/index.html`, `web/artistic-practice/index.html`,
  `web/performances/index.html`
- Modify: `web/css/modes.css` (add `.mode-brass`)

**Interfaces:**
- Consumes: Tasks 1–2; mode system. Produces: `.mode-brass` (cinematic), `[data-animate]`
  incl. `split` (split-text) and `movement`; consistent section ids.

- [ ] **Step 1: About markup + `.mode-brass`**
  Biography as numbered "movements" (Origin · Stage · Honour · Present) using real bio + events
  from brief (Yoruba percussion origin; ÀTÙPÀ/ArtBomb/Utopia; Mayor of Doncaster; Lammy Wonder
  present). Portrait as museum print; identity statement; italic Editorial serif for headings.
  `.mode-brass` in `modes.css`: warm spotlight, grain, brass glow, serif display.

- [ ] **Step 2: Artistic Practice markup**
  African Contemporary (primary) + "The Sound" list; Gospel & Instrumental Worship; Repertoire;
  performance contexts (church/cultural/civic/private). Real copy from source.

- [ ] **Step 3: Performances markup**
  Featured highlight (distinguished leaders / Mayor) with image or `TODO` placeholder for the
  missing `olamide-sax-mayor.jpg`; career-highlights grid; Lammy Wonder Music + services;
  testimonial (real quote from source). `data-animate` hooks throughout.

- [ ] **Step 4: Visual check**
  Open all three. About feels cinematic/documentary (serif, movements); the other two coherent
  within the system. Real content verbatim; placeholders marked. Responsive; one `<h1>` each;
  nav/footer identical. No console errors / overflow.

- [ ] **Step 5: Commit**
  `git add web/ && git commit -m "feat(web): about (brass) + artistic-practice + performances"`

---

### Task 5: Media (data-driven gallery) + Press + Contact (Quiet Virtuoso)

**Files:**
- Create: `web/media/index.html`, `web/press/index.html`, `web/contact/index.html`
- Create: `web/js/data.js`, `web/js/tabs.js`
- Modify: `web/css/modes.css` (add `.mode-quiet`), `web/js/main.js` (page-scoped init)

**Interfaces:**
- Consumes: Tasks 1–2. Produces: `data.js` exports `videos[]`, `audio[]`, `photos[]`, `press[]`
  (each item `{id,title,platform/source,url,...}`); `tabs.js` exports `initMedia()` rendering
  cards + video category filter (all/SAXOPHONE/VOCAL/KEYBOARD); `.mode-quiet`.

- [ ] **Step 1: Write `data.js`**
  Seed real items: audio = Audiomack "Gospel Medley", "Vibes Groove Mixtape"; press = the 3
  real articles (New Telegraph ×2, The Nation) with titles/sources/URLs/excerpts from brief.
  Add 2–3 clearly-`TODO`-commented placeholder videos/photos so grids render.

- [ ] **Step 2: Media markup + `tabs.js`**
  Hero; sticky tabs (Videos/Audio/Photos) with counts; video category filter chips; grid
  containers. `initMedia()` renders from `data.js`, handles tab + category switching and empty
  states; reads `?category=` query param (deep-link from Home skills, if retained).

- [ ] **Step 3: Press markup (`.mode-quiet`)**
  Featured coverage rendered from `data.js` `press[]` as `<article>`s (source, title, excerpt,
  date, "Read Article" link); notable mentions; artist quote; media-enquiry CTA. `.mode-quiet`
  in `modes.css`: restrained, gold thread, generous whitespace.

- [ ] **Step 4: Contact markup**
  Details, social links (real Lammy Wonder/Olamide URLs), booking form (name/email/subject/
  message) as designed UI with `mailto:` fallback + documented endpoint hook (no backend);
  "available for" services.

- [ ] **Step 5: Visual + behavioral check**
  Media: tabs switch, category filter works, counts correct, empty states show, real audio +
  press render, placeholders marked. Press/Contact feel minimal/editorial. Form is keyboard
  accessible with labels + visible focus; submit falls back to mailto. Responsive; one `<h1>`
  each; nav/footer identical. No console errors.

- [ ] **Step 6: Commit**
  `git add web/ && git commit -m "feat(web): media (data-driven) + press + contact (quiet)"`

**→ CHECKPOINT: all 7 pages exist statically before adding the GSAP motion layer.**

---

### Task 6: GSAP motion foundation — smooth scroll, reveals, split-text, cursor

**Files:**
- Create: `web/js/smoothScroll.js`, `web/js/reveal.js`, `web/js/cursor.js`
- Modify: `web/js/main.js` (init motion, guarded by reduced-motion)

**Interfaces:**
- Consumes: `web/assets/vendor/gsap*.js`; `[data-animate]` hooks from Tasks 3–5;
  `prefersReducedMotion()` from utils. Produces: `initSmoothScroll()`, `initReveals()`
  (ScrollTrigger fade/`fade`, `split` letter/line reveals, `movement` staged reveals),
  `initCursor()`.

- [ ] **Step 1: Load GSAP locally**
  Add `<script src="../assets/vendor/gsap.min.js">` + ScrollTrigger + Observer to each page
  (relative paths correct per folder depth), before `main.js` module. Verify `window.gsap`.

- [ ] **Step 2: `smoothScroll.js`**
  GSAP + Observer/ScrollTrigger-based eased smooth scroll (or a lightweight lerp fallback if
  ScrollSmoother isn't free-licensed). Guard: **skip entirely** if `prefersReducedMotion()`.

- [ ] **Step 3: `reveal.js`**
  ScrollTrigger reveals for `[data-animate="fade"]`; split-text (split into lines/letters,
  stagger up) for `hero-title`/`split`; staged `movement` reveals for About. Reduced-motion:
  set final state immediately, no animation.

- [ ] **Step 4: `cursor.js`**
  Subtle custom cursor + hover magnetism on `.btn`, links, cards. Disabled on touch/coarse
  pointers and reduced-motion. Never hides the native cursor for keyboard users.

- [ ] **Step 5: Wire into `main.js` and verify across pages**
  Init in order: nav → smoothScroll → reveals → cursor. Ensure ScrollTrigger refresh after
  fonts/images load.

- [ ] **Step 6: Visual + behavioral check**
  Each page: cinematic load + scroll reveals feel smooth (~60fps, check devtools), split-text
  fires on hero, smooth scroll eased, cursor magnetism on interactives. Toggle OS reduced-motion:
  everything degrades to instant/final state, content fully visible, no jank. No console errors.

- [ ] **Step 7: Commit**
  `git add web/ && git commit -m "feat(web): GSAP motion foundation — scroll, reveals, cursor"`

---

### Task 7: Signature scroll set-pieces — pinned sections, parallax, horizontal gallery

**Files:**
- Create: `web/js/gallery.js`
- Modify: `web/js/reveal.js` (pin/parallax helpers), `web/js/main.js`

**Interfaces:**
- Consumes: GSAP + hooks. Produces: `initGallery()` (horizontal pinned scroll on
  `.hero-gallery`/Media gallery), parallax on `[data-parallax]`, pinned narrative moments on
  `[data-pin]`.

- [ ] **Step 1: Horizontal pinned gallery (`gallery.js`)**
  Pin "The Live World" and translate the track on scroll (ScrollTrigger scrub). Falls back to
  native horizontal scroll if reduced-motion or narrow viewport.

- [ ] **Step 2: Parallax + pinned moments**
  Layered parallax on pattern/image `[data-parallax]`; pin the career-highlight/feature moment
  briefly while copy advances. Mobile: reduce/disable pin to avoid scroll-jacking small screens.

- [ ] **Step 3: Visual + behavioral check**
  Home + Media: horizontal gallery pins and scrubs smoothly; parallax adds depth without jank;
  pinned moment releases cleanly; nothing traps scroll on mobile; reduced-motion falls back to
  plain scroll. 60fps check. No overflow / console errors.

- [ ] **Step 4: Commit**
  `git add web/ && git commit -m "feat(web): pinned + parallax + horizontal gallery set-pieces"`

**→ CHECKPOINT: full experience assembled.**

---

### Task 8: Cross-cutting polish — a11y, performance, responsive, meta, favicons

**Files:**
- Modify: all `web/**/index.html` (`<head>` meta, favicons, lazy/priority images), CSS/JS as
  needed.
- Create: `web/README.md` (how to run/serve, how to edit `data.js`, where placeholders live).

**Interfaces:** Consumes everything. Produces: production-ready site.

- [ ] **Step 1: Head/meta/SEO per page**
  Per-page `<title>`/`<meta description>` (from source metadata), Open Graph/Twitter tags,
  favicons/manifest (reuse `public/*` icons), `lang="en"`, canonical.

- [ ] **Step 2: Image performance**
  `loading="lazy"` on below-fold images; `fetchpriority="high"` on hero; width/height or
  aspect-ratio to prevent CLS; confirm optimised sizes.

- [ ] **Step 3: Accessibility pass**
  Heading order per page (one `<h1>`), ARIA on all icon-only controls, alt text everywhere,
  keyboard traversal of every page incl. mobile menu + tabs + form, visible focus, colour
  contrast of cream/gold on indigo meets AA for text.

- [ ] **Step 4: Responsive sweep**
  375 / 768 / 1024 / 1280 / 1536: no horizontal body scroll, moderate mobile type/padding,
  motion set-pieces degrade sensibly. Fix `responsive.css` as needed.

- [ ] **Step 5: `web/README.md`**
  Document: serve with any static server (`npx serve web` or open index), edit content in
  `js/data.js`, replace `TODO` placeholder assets, the three tonal modes, and the GSAP layer.

- [ ] **Step 6: Final full verification**
  Walk all 7 pages desktop + mobile, reduced-motion on/off, keyboard-only. Confirm success
  criteria from the brief (gallery-caliber, feels like the artist's world, real content, smooth
  motion, accessible, clear booking path). Note anything deferred.

- [ ] **Step 7: Commit**
  `git add web/ && git commit -m "chore(web): a11y, performance, responsive, meta, README polish"`

---

## Self-Review

**Spec coverage:** hero/story/sections → Tasks 3–5; 3 tonal modes → Tasks 3(afro)/4(brass)/5(quiet);
typography/color/tokens → Task 1; GSAP animation catalogue (load, scroll-story, split-text,
pinned, horizontal, parallax, smooth scroll, cursor, micro-interactions) → Tasks 6–7; content
inventory + placeholders → Tasks 3–5 + `data.js` (Task 5); a11y/perf/responsive/reduced-motion →
Task 8 + honoured throughout; static/no-framework/no-admin → whole plan. All brief sections map
to a task.

**Placeholder scan:** No "TBD/implement later" in tasks; asset placeholders are an explicit,
intended deliverable (clearly-marked, on-brand) per the brief, not plan gaps.

**Type consistency:** Init function names consistent (`initNavigation`, `initSmoothScroll`,
`initReveals`, `initCursor`, `initGallery`, `initMedia`); `data.js` array names
(`videos/audio/photos/press`) consistent between Task 5 producer and consumers; `data-animate`
token values reused verbatim across Tasks 3–7; class contracts (`.mode-afro/brass/quiet`,
`.mobile-menu[data-open]`) consistent.
