# Olamide Sax — "THE BREATH BETWEEN NOTES"
### A Cinematic Digital Experience · Creative Concept & Design System

> **Status:** New creative direction (full pivot). Concept-only — no code.
> **Benchmark craft:** Trionn, Kononenko Group — restrained editorial luxury, oversized
> type, aggressive whitespace, imagery-as-hero, cinematic-subtle motion.
> **Prior build:** the Afro-Futurist site becomes salvage — structure, real content, the
> GSAP motion engine, and the modular HTML/CSS/JS architecture carry forward; the *visual
> identity* is replaced by this concept.

---

## 1. Creative Concept & Design Philosophy

**The idea: "The breath between notes."**

A saxophone is played on breath. The most powerful moments in live music aren't the loudest —
they're the held silences, the intake before a phrase, the space a single note is allowed to
ring into. This site is built on that principle: **restraint as luxury, silence as
sophistication, motion as breath.**

Where a portfolio *lists* what an artist does, this experience makes you *feel* the artist's
presence before you read a single fact. The visitor doesn't browse pages — they move through a
**cinematic sequence**, paced like a performance: a hush, a first note, a build, a peak, a
resolve. Every scroll is a beat. Every section is a movement. The design gets out of the way so
the music, the imagery, and the story carry the emotion.

**Philosophy in five lines:**
- **Storytelling over layout.** The homepage is a single narrative arc, not a stack of boxes.
- **Emotion over decoration.** No ornament that doesn't carry feeling. Whitespace is the primary
  material.
- **Editorial, not corporate.** Think a prestige magazine profile or a film title sequence —
  not a services grid.
- **Motion is breath.** Slow, eased, intentional. Nothing bounces. Things *arrive*.
- **Culturally rooted luxury.** Quiet-luxury minimalism, but unmistakably a Nigerian-British
  artist's world — warmth in the neutrals, brass in the accent, heritage in the details.

**Differentiator (the one thing they'll remember):** a hero where the artist's name is revealed
one breath at a time, and a scroll experience where the saxophone imagery and typography move at
different speeds — as if you're moving *through* a space where he's playing, not looking at a
webpage about him.

---

## 2. Moodboard Description

Close your eyes and see:

- A **dark, warm room** — not black, but the deep brown-black of a jazz club after hours,
  lit by a single warm source. Brass catches the light.
- **Film grain** over everything, faint — the texture of 35mm, of something shot rather than
  rendered. A tactile, analog softness.
- A **single spotlight** falling across a figure mid-performance, eyes closed, the rest of the
  frame falling to shadow. High-contrast, cinematic, Roger Deakins lighting.
- **Enormous, quiet typography** — a high-contrast serif set at magazine-cover scale, given
  acres of space, letters you could frame.
- **Negative space that feels intentional**, like the margins of a fine art book. Content sits
  in the frame; it doesn't fill it.
- **Slow horizontal drift** — imagery that moves like a slow camera dolly, not a slideshow.
- Textural details: the **keys of a saxophone**, the grain of brass, a bead of light on lacquer,
  a hand on the neck of the horn, breath fogging in stage light.
- A palette of **warm ink, bone, and aged brass** — no bright colors, nothing digital-feeling.
  It should feel *printed* and *filmed*, never "designed in a browser."

Reference emotional register: the opening of a prestige music documentary; the title sequence of
a film; the first spread of a Kinfolk/Cereal-magazine profile; the hush of a concert hall as the
lights dim.

---

## 3. Color Palette & Rationale

A **minimal, warm, high-contrast** system. Neutrals are warm-biased (never cold grey), the accent
is aged brass (never bright gold), and color is used with extreme discipline — the imagery
provides the color, the system stays quiet.

| Token | Value | Role & rationale |
|---|---|---|
| **Ink** | `#0B0A08` | Primary ground. A warm near-black (brown/green undertone), not pure black — reads as a filmed room, not a UI. |
| **Umber** | `#171310` | Secondary surface / layered panels. Adds depth without contrast noise. |
| **Bone** | `#F3EDE3` | Primary text on dark; primary ground for "light" movements. Warm off-white like aged paper — never `#FFF`. |
| **Ash** | `#A39A8C` | Muted text, captions, metadata. Warm grey with a bone bias. |
| **Brass** | `#B8863B` | THE accent. Aged, desaturated brass — the color of a well-played sax, not shiny gold. Used for one word, one line, one hover — never filled areas. |
| **Brass-Light** | `#D8B87E` | Highlight brass for small glows / hover lifts. Rare. |
| **Ember** | `#7A3B24` | Deepest warm shadow tone / rare secondary accent for heritage moments. Terracotta-brown, ties to Nigerian earth. |

**Rules of restraint (the whole point):**
- **95% of every screen is Ink + Bone + Ash.** Brass appears on ~1 element per viewport.
- Neutrals are all warm — a cold grey anywhere breaks the "filmed" feeling instantly.
- Two "movements" invert to a **Bone ground with Ink text** (an editorial light interlude), so the
  dark isn't monotonous — a gallery or the bio can breathe in light. Otherwise dark-dominant.
- No gradients-as-decoration. Only a single, soft radial "spotlight" glow (Brass at ~6% on Ink)
  and film grain. That's the entire "effects" budget.

Rationale: quiet-luxury sites (Kononenko) let imagery carry color and keep the system monochrome.
We do the same but warm it and add one heritage-true accent (aged brass = the instrument itself),
so it's luxurious *and* his — not generic studio-neutral.

---

## 4. Typography

Type **is** the design here (Trionn's oversized editorial hierarchy is the reference). A
high-contrast display serif carries the emotion; a quiet grotesque handles function; a wide-tracked
mono/caps label adds editorial structure.

- **Display — high-contrast serif** (e.g. *Canela*, *Ogg*, *PP Editorial New*, or open
  alternative *Fraunces* at high optical size). Used HUGE (clamp up to ~12–16vw), light/regular
  weight, tight leading, generous letter-spacing at large sizes. This is the artist's voice: the
  name, the movement titles, the pull-quotes. High stroke contrast = elegance + a nod to the
  brass/sax curve.
- **Body / UI — refined humanist grotesque** (e.g. *Suisse Intl*, *Neue Haas Grotesk*, or open
  *Archivo*/*Inter-tight alternative*). Quiet, legible, ~62–68ch measure, comfortable leading.
  Never competes with the serif.
- **Label / meta — wide-tracked uppercase** (the body grotesque at small size, `letter-spacing:
  .28em`, or a mono like *Söhne Mono*). For eyebrows, section indices, captions, dates,
  "Movement I / II". Adds the editorial "filed and dated" precision that makes it feel curated.

**Type system:**
- Hero name: `clamp(3.5rem, 14vw, 13rem)`, serif, light, tracked.
- Movement titles: `clamp(2.25rem, 7vw, 6rem)`, serif.
- Pull-quotes: `clamp(1.75rem, 4.5vw, 3.5rem)`, serif italic.
- Body: `clamp(1rem, 1.15vw + .8rem, 1.25rem)`, grotesque.
- Labels: `.72rem–.82rem`, uppercase, `+.28em` tracking.
- **Rule:** one serif moment per viewport, maximum. The serif is a soloist; don't let it play over
  itself.

---

## 5. Spacing & Layout System

**A 12-column editorial grid with a strict vertical rhythm and deliberately broken margins.**

- **Grid:** 12 columns, generous gutters (`clamp(16px, 2vw, 32px)`), max content width ~1440px,
  but content rarely spans full width — it lives in 5–8 column measures with the rest as air.
- **Baseline / rhythm:** an 8px base unit; a modular vertical scale (`8 · 16 · 24 · 40 · 64 · 104
  · 168`). Section padding is large: `clamp(96px, 14vh, 220px)` top/bottom — sections breathe.
- **Asymmetry is the rule.** Text blocks sit off-center (columns 2–7, or 6–11). Images bleed off
  one edge. Captions hang in the margin. Nothing is centered except deliberate "title-card"
  moments.
- **The frame:** a persistent thin margin around the whole viewport (like a gallery mat / film
  frame) — a hairline Ash border inset ~24–40px, with fixed corner metadata (location, "EST.",
  the current section index). This single device instantly signals "curated experience," not
  "webpage."
- **Whitespace as content:** at least one near-empty "hold" screen between major movements — a
  single line of type in a sea of Ink. The pause before the next note.
- **Mobile:** the 12-col collapses to a 4-col; margins tighten to ~16px but stay present (the frame
  survives); type scales down but stays oversized-for-mobile (the drama is the point);
  asymmetry relaxes to a strong single-column rag with hung labels.

---

## 6. Homepage Storyboard (the narrative arc)

The homepage is **one scroll, seven movements** — paced like a set. Each has a single job.

**◦ Preload / Overture (0–100%).** Black. Film grain settles. A thin brass line draws itself
across the frame as assets load; a percentage or a single word ("Breathe") holds. On complete,
the line becomes the top frame-border and the curtain lifts.

**I · The Name (hero).** Ink room, single spotlight glow. The name **OLAMIDE SAX** reveals one
word at a time, as if on breath — each line rising from a mask, slow, eased. Beneath, a single
quiet label: *Vocalist · Saxophonist · Keyboardist — UK / Nigeria.* No buttons crowding the frame;
one whisper-CTA ("Enter / Scroll") and a portrait that holds in shadow, only half-lit. **This is
the thesis: presence before information.**

**II · The Statement (who he is, in one breath).** A near-empty hold screen → one oversized serif
line, set in the margin-grid: *"An electric griot — carrying the rhythm of home onto the world's
stages."* Below, in small grotesque, the one-paragraph truth (Nigerian-born, UK-based,
multidisciplinary, Lammy Wonder Music). Whitespace does the work.

**III · The Roots (heritage, cinematic).** A light-ground *interlude* (Bone). Editorial split:
oversized "2010 —" hanging in the margin, body copy on the Yoruba percussion origin (cord/omele,
djembe, omele bàtá, talking drum → Afro-fusion). A slow-drifting image of hands/drums. The one
place Ember (heritage terracotta) appears.

**IV · The Craft (what he does — as movements, not a services grid).** Three full-bleed
"movements" that pin and cross-fade as you scroll: **Saxophone · Voice · Keys.** Each = one
cinematic image + one serif word + one line of copy. No cards. You scroll *through* his
disciplines like scenes.

**V · Live (the proof — horizontal gallery).** The section turns and scrolls **horizontally**: a
slow dolly through live moments — ÀTÙPÀ at CAST, before the Mayor of Doncaster, Utopia Theatre,
Sheffield's Lord Mayor. Each frame captioned in hung margin labels (venue · date). Imagery-as-hero;
the reel *is* the credibility.

**VI · In Their Words (press / recognition).** Back to Ink. A single rotating pull-quote in large
serif italic, with the three real press sources (New Telegraph, The Nation) as small tracked
labels beneath. Restraint = authority.

**VII · The Invitation (booking, emotional close).** Not a loud CTA band — a quiet, confident
title card: *"Bring the breath to your stage."* One line on availability (weddings, civic, worship,
corporate, UK-wide), one Brass link to Contact. The frame's brass line draws closed. Footer as a
calm colophon (nav, socials, Lammy Wonder Music, EST./location metadata).

**The journey:** hush → presence → truth → origin → craft → proof → voice → invitation. The
visitor leaves having *felt* an artist, then finds the booking path exactly when the emotion peaks.

---

## 7. Desktop & Mobile Layout Concepts

**Desktop (the cinema):**
- Persistent inset **frame** with fixed corner metadata (top-left: OLAMIDE SAX · top-right:
  section index "I / VII" · bottom-left: UK / NIGERIA · bottom-right: current year "EST.").
- Nav: minimal — a wordmark and a single "Menu" trigger that opens a **full-screen editorial
  overlay** (large serif links, a background live image, a line of contact). No cluttered top bar.
- Content lives in the 12-col grid, asymmetric, with images bleeding off edges and captions hung
  in margins. A custom cursor: a small Bone dot that grows into a "VIEW / LISTEN" label over
  interactive imagery.
- Generous, filmic vertical pacing; horizontal break for the Live reel.

**Mobile (the intimate cut):**
- The frame survives (tighter inset). Metadata reduces to two corners.
- One strong column; oversized serif stays dramatic (hero name still ~18vw). Asymmetry expressed
  through hung labels and off-baseline captions rather than columns.
- The horizontal Live reel becomes a **swipeable** slow carousel with snap.
- Menu overlay is full-screen, thumb-reachable, large tap targets.
- Motion budget reduces (see §8) but the *reveals and pacing* remain — mobile still feels
  cinematic, just calmer. No parallax that fights touch-scroll.

---

## 8. Animation & Interaction Plan (GSAP)

Motion = **breath**: slow, eased (`power3/power4.out`, ~0.8–1.4s), always *arriving*, never
bouncing. Built for GSAP + ScrollTrigger + a lightweight smooth-scroll. Everything degrades to
static under `prefers-reduced-motion`, and content is never hidden if motion fails.

**Hero reveals:**
- Preloader: brass line draws (`drawSVG`-style via stroke) + grain fade; word hold; curtain lift.
- Name: **split-text by word/line**, masked, staggered rise on breath (long eases, slight delay
  between words — the "held breath"). Portrait fades up from shadow, slight scale settle.

**Scroll storytelling:**
- Section reveals: masked line-rises for serif titles; soft fade+rise for body; captions arrive
  last (the editorial "beat").
- **Pinned "Craft" movements:** each discipline pins and cross-fades to the next as you scroll —
  image scale/opacity + word swap. Scrubbed, cinematic.
- **Parallax as camera dolly:** imagery moves slightly slower than text (subtle, ≤12% offset) — the
  "moving through a space" feeling. Never dizzying.

**Galleries:**
- Live reel: **horizontal scroll** (pinned, scrubbed translate) on desktop; snap-swipe on mobile.
  Frames scale up slightly as they enter center ("in focus"), captions cross-fade.

**Section transitions:**
- Ground shifts (Ink → Bone → Ink) are eased background transitions, not hard cuts — like a film
  fading between lit and shadowed scenes. The inset frame line animates its length as a scroll
  progress indicator.

**Hover & micro-interactions:**
- Custom cursor: Bone dot → grows to "VIEW"/"LISTEN"/"READ" over media; magnetic pull on links/CTAs.
- Links: brass underline draws in from left; serif letters get a whisper of tracking on hover.
- Images: slow scale (1.0→1.04) + a faint grain/light shift on hover. Nothing snappy.
- Buttons: fill wipes in brass from one edge; label color crossfades. One motion, done well.

**Performance & a11y:** transforms/opacity only (60fps); `ScrollTrigger.refresh()` after fonts +
images; full `prefers-reduced-motion` fallback (instant final states, no smooth-scroll, no cursor);
keyboard-first focus states preserved; split-text keeps real text in the a11y tree.

---

## 9. Component & Style Guide

Minimal set, each executed with precision (quiet-luxury = few components, perfect).

- **Buttons / links:**
  - *Primary ("Book" / "Enter"):* text + a thin brass underline that draws on hover, or a
    ghost-outline that fills brass from one edge. No rounded pills, no shadows. Uppercase-tracked or
    small serif.
  - *Text link:* Bone with brass draw-underline; generous hit area.
  - *Whisper CTA:* tiny tracked label + a hairline, for "Scroll / Enter".
- **Cards (used sparingly — mostly we avoid cards for full-bleed movements):**
  - *Press item:* no box — a hairline top rule, a tracked source label (brass), a serif title, an
    Ash date, a draw-underline "Read". Editorial ledger, not a card.
  - *Live frame:* full-bleed image + hung margin caption (venue · date). Border only the frame line.
- **Forms (Contact):**
  - Underline-only fields (no boxes): Bone label above, a hairline Ash underline that lights brass on
    focus, generous vertical space. Select styled as the same underline. Submit = the primary
    draw-underline button. Calm, editorial, print-like.
- **Navigation:**
  - Collapsed by default: wordmark + "Menu". Full-screen overlay: large serif links (hover = brass
    draw + slight tracking), a live image bleed, contact line, socials as tracked labels. Closes on
    link/Escape; focus-trapped.
- **Imagery treatment:**
  - Warm grade, gentle contrast, faint grain overlay to unify sources. Duotone-toward-Ink for
    secondary images so mixed-quality assets feel intentional. Full-bleed or generous-column; always
    with a hung caption. Never a tidy uniform grid — asymmetric, editorial placement.
- **Structural devices:** the inset frame; hung margin captions; movement indices ("I / VII",
  "Movement II"); the drawing brass progress line. These encode the "curated film" feeling and must
  be used consistently.

---

## 10. Imagery, Video & Asset Suggestions

The concept lives or dies on imagery — it carries the color and the emotion. Recommendations for
the shoot / sourcing (all current placeholders marked in the build for swap):

**Photography (priority):**
- A **hero portrait**: half-lit, eyes-closed-mid-phrase, single warm source, deep shadow, shot
  vertical for the hero and horizontal for section bleeds. This one image sets the whole tone.
- **Detail macros:** sax keys, brass grain, light on lacquer, hand on the neck, reed/mouthpiece,
  breath in stage light. These become the texture of the "Craft" movements.
- **Live frames:** high-contrast stage moments (the real ÀTÙPÀ/CAST, Mayor of Doncaster, Utopia,
  Sheffield events) — motion-blur and atmosphere welcome; authenticity over polish.
- **Heritage frame:** hands on Yoruba percussion / drums for the Roots interlude.
- Grade everything warm; a light grain pass unifies mixed sources.

**Video (high impact, optional but transformative):**
- A **5–10s hero loop:** slow, near-still — breath, a held note, light shifting on brass. Muted,
  autoplay, subtle. Even a short clip elevates the hero from "site" to "film."
- **Movement clips:** 3–4s silent loops per discipline (sax / voice / keys) behind the pinned
  Craft section.
- A **signature audio moment** (optional, user-triggered): a single held sax note on first
  interaction — sound as the ultimate proof for a musician. Muted by default, one tasteful toggle.

**Supporting assets:**
- A refined **wordmark/monogram** (an "OS" or a minimal sax-key mark) for the frame + favicon.
- A **grain texture** (PNG/CSS) and a soft spotlight glow — the only "effects."
- Optional: a downloadable **EPK / press kit** (PDF) linked from Press — bookers expect it.

**Asset-readiness note:** the build reuses the existing modular structure and GSAP engine, and
every image slot is a marked placeholder — so as real photography/video arrives, it drops into the
same slots and inherits the motion. Concept can be implemented incrementally as assets land.

---

### Implementation note (for later — not part of this concept)
When approved, this rebuilds on the existing salvage: keep the 7-page structure, real content,
`data.js`, the GSAP motion engine, and the modular CSS/JS; replace tokens (this palette/type),
`modes.css` (this frame + editorial system), and re-choreograph. No framework — HTML/CSS/vanilla
JS/GSAP, as before.
