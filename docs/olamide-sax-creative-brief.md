# Olamide Sax — Creative Brief & Art Direction

> **Project type:** Creative rebuild (NOT a migration). The existing Next.js site
> (https://www.olamidesax.co.uk/) is used **only** as a source of content, branding,
> and business information. Layout, styling, and UX are reimagined from scratch.
>
> **Stack:** HTML5 · CSS3 · Vanilla JS (ES Modules) · GSAP + free plugins. No React,
> Next.js, Vue, Angular, Tailwind, or Bootstrap.
>
> **Status:** Phase 2 (Creative Direction) — awaiting sign-off before build.

---

## 1. Who this is for

**Olamide Sax** (Olaniyan Olamide Phillips) — a UK-based, Nigerian-born multidisciplinary
music artist: vocalist, saxophonist, keyboardist. Founder & Lead Artist of **Lammy Wonder
Music**. Afro-fusion practice rooted in Yoruba percussion, spanning gospel, African
contemporary, and repertoire performance.

**Primary audiences**
1. **Bookers / event organisers** (weddings, corporate, church, civic, cultural) — need to
   feel his calibre fast and reach a booking path.
2. **Press / cultural programmers** — need credibility, coverage, and a media contact.
3. **Fans / general public** — want to watch, listen, and follow.

**The site's single job:** make a visitor *feel* they've entered the world of a serious
performing artist — then convert that feeling into a booking or a follow.

---

## 2. Creative Vision

**"An electric griot for the modern stage."**

The site is a cinematic, rhythm-driven experience that treats scrolling like a performance
unfolding. It fuses the visual language of Yoruba/African heritage (percussion patterns,
warmth, ceremony) with a bold, contemporary, kinetic digital aesthetic — **Afro-Futurist
Rhythm**. It is loud where it should celebrate, and quiet where it should let his artistry
breathe.

This is not a portfolio template with his content poured in. It is a designed *experience*
with a narrative spine: **Roots → Practice → Stage → Recognition → Booking.**

---

## 3. Moodboard (description)

- Deep indigo-black stage bathed in warm gold spotlight; brass catching light in the dark.
- Yoruba percussion geometry — talking-drum lacing, omele pattern rhythms — abstracted into
  fine line motifs and repeating marks that pulse like a beat.
- Poster typography: enormous, confident, all-caps names filling the frame.
- Film grain and subtle noise over rich colour; a tactile, physical feel — not flat digital.
- Horizontal, gallery-like sequences that move like a reel of live moments.
- Contrast of ceremony and modernity: gold leaf warmth against a cool electric edge.

---

## 4. Visual Language

- **Primary identity: Afro-Futurist Rhythm** — bold, kinetic, celebratory.
- **One design system, three tonal modes** (shared DNA: indigo-black ground, gold
  through-line, grain + pattern motifs) — pacing shifts per page:
  | Mode | Pages | Feel |
  |---|---|---|
  | **Afro-Futurist** (signature) | Home, Media/Gallery, Performances | Loud, kinetic, horizontal, celebratory |
  | **Midnight Brass** (cinematic) | About / biography | Documentary; movements; split-text; warm spotlight |
  | **Quiet Virtuoso** (minimal) | Press, Contact | Restrained; editorial; lets quotes & coverage sit with authority |
- **Balance:** true even blend of heritage + futurist — traditional pattern language meets
  modern kinetic type and digital motion in equal measure.

---

## 5. Typography

Real, self-hosted fonts (inlined as `@font-face`; no CDN dependency).

- **Display:** wide/heavy grotesque, all-caps, poster energy (Anton / Archivo Black family).
  Used huge for names and section titles — the memorable signature of the site.
- **Body:** a clean, warm humanist sans with good rhythm at small sizes (e.g. an open
  grotesque). Set near ~65ch measure; clear type scale via `clamp()`.
- **Accent / utility:** wide-tracked uppercase small caps for eyebrows, labels, and data.
- **Cinematic mode (About):** a high-contrast display serif (italic) is introduced for the
  documentary voice — a deliberate tonal shift, still within the system.

Type is treated as a **design element**: kinetic split-letter reveals, oversized names that
break the grid, and beat-synced micro-motion on the hero.

---

## 6. Color System

CSS custom properties; dark-first (the stage is dark).

| Token | Hex | Role |
|---|---|---|
| `--indigo` | `#12101F` | Primary ground (stage) |
| `--indigo-deep` | `#0A0912` | Deepest black-navy for contrast |
| `--gold` | `#C9A227` | Signature accent / brass through-line |
| `--gold-light` | `#E8D48B` | Pale gold highlight |
| `--terra` | `#D2552E` | Heritage warmth / energy accent |
| `--teal` | `#2EC4B6` | Cool electric accent (the "futurist" edge) |
| `--cream` | `#F3EDE1` | Primary text on dark |
| `--dim` | `#8C8578` | Muted text / captions |

- **Boldness spent in one place:** gold is the constant through-line; terracotta and teal
  are used sparingly as punctuation (a chip, a rule, a caption mark), never evenly spread.
- Neutrals are warm-biased (toward the gold/cream), never pure grey.
- Light-mode is **not** a goal — this design commits to a single dark visual world by intent.
  (Reduced-motion and contrast accessibility are honoured regardless.)

---

## 7. Layout Philosophy

- **Grid-breaking & asymmetric:** oversized type bleeds past margins; images overlap;
  intentional negative space around key moments.
- **Layered depth:** pattern/pattern-parallax back layer, content mid layer, grain top layer.
- **Horizontal moments:** the live gallery and select sequences scroll sideways (pinned),
  contrasting the vertical narrative.
- **Pacing:** loud full-bleed hero → dense kinetic sections → a quiet minimal press/contact
  close. Deliberate loud/quiet rhythm.
- **Mobile-first & responsive:** all scale via `clamp()`/grid/flex; heavy motion degrades to
  tasteful, performant equivalents on small screens (per project mobile standards — moderate
  text/padding on mobile).

---

## 8. Animation Philosophy (GSAP)

Motion **guides attention and tells the story** — never decorates for its own sake. Built on
GSAP + free plugins (ScrollTrigger, ScrollSmoother where licensed-free alternatives suffice,
Observer, plus a split-text approach using free tooling).

Prepared/premium interactions:
- **Cinematic page load** — staged reveal of the hero (grain settle, letters rise, gold sweep).
- **Scroll-driven storytelling** — sections reveal in sequence as narrative beats.
- **Split-text reveals** — headline letters/lines animate in.
- **Pinned sections** — key moments hold while content advances.
- **Horizontal scroll** — the live gallery reel.
- **Layered parallax** — pattern and image depth on scroll.
- **Smooth scrolling** — eased, cinematic scroll feel.
- **Cursor interactions** — a subtle custom cursor / hover magnetism on interactive elements.
- **Micro-interactions** — buttons, chips, links respond with intent.

**Non-negotiables:** 60fps target; `prefers-reduced-motion` fully respected (motion reduces
to simple fades / none); no layout-shift; keyboard and focus states preserved.

---

## 9. User Journey

1. **Arrive** → cinematic load; the name hits like a poster; immediate sense of "a real artist."
2. **Understand** → one-line who/what; primary CTA (Watch / Book) surfaced early.
3. **Connect (story)** → Roots → Practice narrative builds emotional investment.
4. **Believe (proof)** → live gallery + career highlights + press coverage = credibility.
5. **Act** → clear, low-friction booking / contact path; follow on socials.

---

## 10. Storytelling Flow (narrative spine)

**Roots → Practice → Stage → Recognition → Booking**

Each section has a single narrative purpose; no section exists just to hold content.

---

## 11. Section Architecture (pages & sections)

Seven pages (mirrors current IA; reimagined):

- **Home** *(Afro-Futurist)* — cinematic hero · one-line identity + CTA · marquee genre strip ·
  "The Live World" horizontal gallery · Roots teaser · career-highlight feature (Mayor of
  Doncaster) · booking CTA.
- **About** *(Midnight Brass / cinematic)* — biography as numbered "movements" (Origin · Stage ·
  Honour · Present) with split-text and spotlight; portrait as museum print; identity statement.
- **Artistic Practice** — genre world: African Contemporary (primary), Gospel & Instrumental
  Worship, Repertoire; "The Sound" list; performance contexts (church/cultural/civic/private).
- **Performances** — featured highlight (distinguished leaders) · career highlights grid ·
  Lammy Wonder Music + services · testimonial.
- **Media** *(Afro-Futurist gallery)* — tabs: Videos · Audio · Photos, with video categories
  (Saxophone/Vocal/Keyboard). Content-driven from an editable `data.js` (static).
- **Press** *(Quiet Virtuoso)* — featured coverage (real articles), notable mentions, artist
  quote, media-enquiry CTA.
- **Contact** *(Quiet Virtuoso)* — details · social links · booking form (UI + mailto/endpoint
  hook) · "available for" services.

Shared: cinematic **nav** (with mobile full-screen menu) and **footer**.

---

## 12. Content Inventory (audited — real, verbatim where possible)

**Identity/branding**
- Name: Olamide Sax (Olaniyan Olamide Phillips). Roles: Vocalist · Saxophonist · Keyboardist.
- Band: Lammy Wonder Music (Founder & Lead Artist). Location: United Kingdom.
- Email: Olaniyanolamidephillip@gmail.com

**Bio / heritage** — began 2010 in Yoruba percussion (cord/omele, djembe, omele bàtá, talking
drum); evolved into Afro-fusion (sax, vocals, keyboard, live improvisation); 10+ years experience.

**Events / venues / collaborators** — ÀTÙPÀ at CAST (opening sax; theatrical role "Adigun");
ArtBomb (with The Skintone UK); Black History Month, Doncaster (performed for the **Mayor of
Doncaster** & council leaders); BME United Doncaster; Utopia Theatre (open mic); traineeship
with **darts** in partnership with **Maya Productions**; Stand & Be Counted (SBC) Spotlight Show,
Sheffield (before the Lord Mayor).

**Press (real, with URLs)**
- *New Telegraph* — "Olamide Sax Delivers Afro-Fusion Performance At Black And Minority Ethnic
  United Doncaster Event" — https://newtelegraphng.com/olamide-sax-delivers-afro-fusion-performance-at-black-and-minority-ethnic-united-doncaster-event/
- *The Nation* — "Olamide Sax Thrills Guests at Open Mic" (Utopia Theatre, 1 March 2026) —
  https://thenationonlineng.net/olamide-sax-thrills-guests-at-open-mic/
- *New Telegraph* — "Olamide Sax Commands Spotlight Stage in Sheffield, Delivers Stirring
  Performance Before Lord Mayor" — https://newtelegraphng.com/olamide-sax-ignites-the-stage-with-stirring-performance-in-sheffield/

**Music** — Audiomack releases referenced: "Gospel Medley", "Vibes Groove Mixtape".
**Socials** — TikTok @olamidesax · Instagram @olamide.sax · Facebook (Olamide Sax) · YouTube
@olamidesax. (Lammy Wonder Music variants also exist and are used on Contact.)

**Images (local, available)** — 5 photos in `public/images/` (portrait, performance, etc.).

---

## 13. Missing Assets → Placeholder Strategy

Handle gracefully; never remove a section:
- Real video/audio/photo DB content isn't in the repo (was admin-populated at runtime). The
  Media page renders from an editable `data.js` seeded with **known real items** (Audiomack
  releases) + clearly-`TODO`-marked placeholder cards styled to match the design.
- `performances` referenced a missing `olamide-sax-mayor.jpg` → use an existing image or a
  designed placeholder with a `TODO` comment.
- Contact form has no backend today → keep as designed UI with a `mailto:` fallback and a
  documented hook for a form endpoint later.
- All placeholders are visually intentional (on-brand), never broken-looking.

---

## 14. Technical Foundation

- **Structure:** self-contained static site in a new top-level folder (proposed: `web/`),
  leaving the existing Next.js app fully intact for reference. No build step required to view.
- **CSS:** modular — `reset · variables · typography · layout · components · animations ·
  responsive`. All colour/type/spacing/radius/shadow/motion as CSS custom properties.
- **JS:** ES modules — `main · nav · smooth-scroll · reveal(GSAP) · gallery · tabs · cursor ·
  data · utils`. Feature-isolated; no monolith files.
- **GSAP:** loaded as a self-hosted/local dependency (not required at view-time for base
  content — content is real HTML, so the site is accessible/SEO-friendly without JS).
- **Assets:** local images optimised; icons as inline SVG (Lucide set extracted); fonts inlined.
- **A11y:** semantic landmarks, one `<h1>`/page, ARIA on icon controls, keyboard nav, visible
  focus, alt text, reduced-motion.

---

## 15. Out of Scope

- No admin panel, database, or API (site is fully static).
- No React/Next/Tailwind or any framework.
- No light theme (single committed dark visual world).
- No working server-side form processing (UI + mailto now; endpoint hook for later).

---

## 16. Success Criteria

- Could sit credibly in a modern design gallery (award-worthy craft).
- Visitor *feels* the artist's world, not just reads facts.
- Real content throughout; placeholders on-brand and clearly marked.
- Smooth (60fps) motion; fully responsive; accessible; reduced-motion honoured.
- Clear booking/contact conversion path.
- Maintainable, modular code ready for future content and enhancements.
