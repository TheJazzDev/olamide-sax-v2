# Olamide Sax — "THE BREATH BETWEEN NOTES" · Version 2
### Cinematic Editorial Luxury, Made Unmistakably Musical

> **Status:** V2 evolution of the approved V1 concept. Concept-only — no code.
> **Evolves:** `olamide-sax-cinematic-concept.md` (V1). V1's foundation is KEPT — the
> "breath" thesis, warm Ink/Bone/Brass palette, high-contrast serif, film-frame layout,
> and breath-paced motion all carry forward. V2 adds **energy, rhythm, kinetic type, a
> signature interaction, and a living-archive media engine** for the abundant real content
> (many gig photos, embedded YouTube videos, published articles) Olamide will supply.
> **Design tension held throughout:** more alive, still elegant. Live performance, not a
> quiet gallery — but never busy, never gimmicky.

---

## 0. What changes from V1 → V2 (at a glance)

| | V1 (approved) | V2 (this doc) |
|---|---|---|
| **Feeling** | Quiet gallery; hush and restraint | Stepping into a **live performance** — rhythm, warmth, energy — while staying elegant |
| **Signature** | (none singled out) | **THE BREATH LINE** — one memorable interaction the brand is known for |
| **Motion** | Slow reveals, breath-paced | Breath-paced **+ rhythm & scroll-velocity response, kinetic type, immersive transitions** |
| **Media** | A few curated moments | **Living archive:** curated cinematic homepage + scalable Media/Gallery/Video/Press archives + a Timeline |
| **Type** | Editorial, still | Editorial **+ kinetic** — headlines that breathe/flow with scroll velocity |
| **Foundation** | Palette, type, frame, grid | **Unchanged** — V2 builds on it |

Restraint rule still governs: **one bold move per viewport.** V2 adds energy through *rhythm
and timing*, not through more elements on screen.

---

## 1. THE SIGNATURE INTERACTION — "The Breath Line"

> The one thing people will remember and associate with Olamide Sax. Not a waveform (that says
> "audio," not *him*) — **breath**, the thing a saxophone is actually played on. It reinforces
> the site's central idea instead of decorating over it.

**What it is:** a single, elegant, aged-brass line that lives on the page from the first moment
to the last. It is drawn, not placed. It responds to the visitor. It carries the whole story.

**Its three acts (the narrative spine):**

**BIRTH — the instrument appears (hero).**
On load, the brass line draws itself onto a dark frame and **assembles into a saxophone
silhouette** — elegant brass-inspired shapes (a curve, keys as points of light, the bell)
converging into the horn. The silhouette holds for a breath, then **dissolves**, leaving behind
the single line. (This is the "Brass Assembly" idea, folded in as Act I.)

**JOURNEY — the line carries the story (the whole scroll).**
That line becomes the **persistent scroll-spine** running down the site. It is simultaneously:
- the **scroll-progress indicator** (how far through the performance you are),
- the **connector between sections** (it threads from one movement to the next, never breaking),
- the **career timeline** (milestones sit as nodes along it),
- the **transition guide** (sections reveal *as the line reaches them*),
- and the **navigation locator** (the menu highlights your current position along the line).

**How it moves (breath, not waveform):**
- Scroll **slowly** → the line flows smooth and even, like controlled breathing.
- **Pause** → it gently settles and holds, a *sustained note* (a slow, almost-still shimmer).
- Scroll **fast** → it tightens and quickens — energy, without ever becoming jagged audio teeth.
- At **milestones** (a performance, an award, a gallery entry) it swells into **graceful peaks
  and curves that echo musical phrasing** — the rise and fall of a played phrase, not a spectrum
  analyzer.

**RESOLUTION — the line comes to rest (booking).**
At the final invitation, the line **resolves into the Olamide Sax wordmark / monogram** — the
performance ends, the signature is signed. The journey completes: *birth → journey → resolution.*

**Why it wins:** visitors won't think "cool waveform." They'll remember *"that elegant line that
felt like the music was breathing with me."* It's tied to the brand's own concept, present
everywhere (so it becomes the signature rather than a one-off trick), and it scales — **every new
milestone Olamide sends is simply a new phrase on the line.**

**Craft & accessibility guardrails:** rendered as a lightweight SVG/canvas path driven by GSAP +
scroll position/velocity (no microphone, no audio analysis). Under `prefers-reduced-motion` it
becomes a **static elegant line with simple node markers** — still the brand motif, no animation.
It never blocks content, never traps scroll, and degrades to nothing gracefully if JS fails.

---

## 2. Creative Philosophy (evolved)

V1's five principles hold. V2 adds three that inject the musicality:

- **Rhythm is structure.** Section pacing has a *tempo* — held hush, then a build, then a
  release. The site scrolls like a set list, not a slideshow. Whitespace is the rest between
  phrases; density is the crescendo.
- **The visitor is a co-performer.** Their scroll speed *plays* the Breath Line and the type.
  The experience responds — so it feels live and human, not pre-recorded. (No mic, no gimmick —
  scroll velocity and pause are the instrument.)
- **Media is the performance.** As real content arrives in volume, the imagery/video *is* the
  show. The design's job is to frame it like a venue frames a stage — and to keep doing so
  gracefully whether there are 10 pieces or 1,000.

Held tension: **elegant AND alive.** Every energetic idea is bounded by the restraint rule. We
raise the *tempo and warmth*, not the clutter.

---

## 3. Moodboard (evolved)

Everything from V1 (warm jazz-club dark, single spotlight, film grain, brass catching light,
magazine-scale serif) — **plus motion and warmth**:

- The **brass line** threading the dark, alive and breathing — the defining new image.
- A sense of **stage energy**: warm light blooming as a section "hits," a subtle pulse to the
  rhythm of scroll, type that flexes like a held note.
- **Abundant imagery** now part of the mood: a wall of live moments, stills melting into motion,
  a video frame blooming open. Not sparse — *curated abundance*, like a great tour book.
- Heritage warmth a touch more present (Ember/terracotta) — the rhythm of home under the luxury.

Emotional register moves from *"the hush before the show"* (V1) to *"the show itself, shot like a
prestige concert film."*

---

## 4. Color (evolved — same system, one addition)

V1 palette is unchanged — **Ink `#0B0A08` · Umber `#171310` · Bone `#F3EDE3` · Ash `#A39A8C` ·
Brass `#B8863B` · Brass-Light `#D8B87E` · Ember `#7A3B24`.** Rules of restraint still apply (95%
Ink/Bone/Ash; brass ~1 element per viewport; imagery carries color).

V2 additions:
- The **Breath Line owns the Brass.** Brass is now primarily *the line's* color — which makes the
  discipline easier: brass reads as "the through-line," not scattered accents.
- A **"stage-warm" bloom** — a soft radial warm-light glow that intensifies subtly as a section
  becomes active (the spotlight hitting the stage). Very low opacity; it's tempo, not decoration.
- Light "movement" interludes (Bone ground) become **rhythm devices** — a bright breath between
  dark movements, used a little more deliberately than in V1 to create contrast/pace.

---

## 5. Typography — now KINETIC (the big V2 type shift)

V1's type system stays (high-contrast display serif · humanist grotesque body · wide-tracked
label). V2 makes the **serif alive**:

- **Breathing headlines.** Large serif titles subtly respond to scroll velocity — letters drift
  apart slightly and rise like a held note when you pause, and compress/settle when you scroll
  fast. Tracking and weight "breathe." Bounded and slow — elegant, never bouncy. This is the
  editorial-musical fusion, kept restrained (one breathing headline per view).
- **Kinetic reveals with rhythm.** Split-text reveals now have *musical timing* — words arrive in
  a phrased stagger (like notes in a bar) rather than a uniform march, synced to the Breath Line
  reaching the heading.
- **Velocity-aware pacing.** Fast scroll = reveals resolve quicker (the type keeps up); slow
  scroll = they luxuriate. The type feels played, not triggered.
- **Type scale unchanged** from V1 (hero `clamp(3.5rem,14vw,13rem)`, etc.). Still one serif
  soloist per viewport — the kinetic behavior replaces "add more type," not adds to it.

Accessibility: all kinetic type keeps real, selectable text in the a11y tree; under reduced-motion
it sets statically at final size — no breathing, no flow.

---

## 6. Spacing & Layout (evolved for rhythm + abundance)

V1's 12-col editorial grid, 8px rhythm, big section padding, asymmetry, and the **film-frame**
(inset hairline border + corner metadata) all stay. V2 evolves:

- **The frame now carries the Breath Line** as its living left/center spine and progress
  indicator — the frame becomes active, not just decorative.
- **Tempo in the vertical rhythm:** deliberate alternation of *hold* screens (near-empty, one
  line) and *hit* screens (full-bleed media, energy) — the site has dynamics, loud and soft.
- **Media-dense layouts** join the system for the archive pages: editorial mosaics and reels that
  stay on-grid and elegant even when packed. Curated homepage = spacious; archives = richer
  density, same premium quality.
- **Mobile:** frame + Breath Line survive (line runs the edge as a slim progress spine); kinetic
  type calms; media reels become snap-swipe. Still cinematic, calmer tempo.

---

## 7. Information Architecture — the Living Archive (future-proof for abundant content)

**Principle:** *homepage is curated (cinematic first impression); dedicated pages are scalable
archives (10 items or 1,000, same elegance).* Every new photo/video/article is a natural
continuation of the story, never an afterthought or a redesign.

```
HOME (curated — the performance)
  Featured Performance · Featured Video · Featured Gallery ·
  Featured Press Story · "Explore the Archive →"

MEDIA (scalable archives)
  Performances   → by year (2026 · 2025 · 2024 …)
  Gallery        → Photos · Behind the Scenes · Events
  Videos         → Live Performances · Music Videos · Interviews   (embedded YouTube)
  Press          → Articles · Features · Awards
  Timeline       → the career, unfolding along the Breath Line

ABOUT · ARTISTIC PRACTICE · CONTACT   (evolved from current pages)
```

**Scale mechanics (so it never breaks as content grows):**
- **Featured slots** on home are hand-curated pointers into the archives — they stay cinematic
  because they're a fixed, small set.
- Archives use **repeatable elegant slots** (see §9): a video card, a gallery frame, a press entry
  — each a luxury component that tiles gracefully from a handful to hundreds.
- **Year/category grouping + lazy loading** keep large libraries navigable and performant.
- All of it stays **data-driven** (the existing `data.js` model extends to these categories), so
  Olamide's new content drops into structured slots and inherits the design + motion automatically.

---

## 8. Homepage Storyboard (V2 — the performance)

One scroll, paced like a live set, the Breath Line threading throughout:

**Overture / Birth.** Dark, grain settles. The brass line draws and **assembles into the
saxophone silhouette**, holds a beat, dissolves into the scroll-spine. (Signature Act I.)

**I · The Name.** The line arrives at the hero; **OLAMIDE SAX** reveals in kinetic serif,
breathing, synced to the line. Half-lit portrait. One whisper CTA. (Presence first.)

**II · The Statement.** A held hush → one breathing serif line — *"An electric griot, carrying the
rhythm of home onto the world's stages."* — then the one-paragraph truth.

**III · The Roots (light interlude, rhythm shift).** Bone ground. "2010 —" hanging huge; Yoruba
percussion origin; slow-drifting heritage image. The line curves warmly here (heritage phrasing).

**IV · The Craft (pinned movements, more energy).** Saxophone · Voice · Keys — three full-bleed
movements that pin and cross-fade; the Breath Line pulses at each, warm bloom hits. Now with short
looping performance clips behind each (media-forward).

**V · Featured Performance.** A single hand-picked cinematic gig (image → clip), captioned like an
exhibition label; the line peaks into a milestone node. "See all performances →" to the archive.

**VI · Featured Video.** One embedded YouTube moment, framed like a screening — blooms open on
reach. "All videos →".

**VII · The Live Wall (Featured Gallery).** A taste of the venue-walk: stills that cross-fade to
motion as the line advances. "Enter the gallery →".

**VIII · In Their Words (Featured Press).** One large breathing pull-quote + the real press
sources as tracked labels; line steady like a sustained note. "Read the press →".

**IX · Timeline teaser.** A few milestone nodes emerging from the line (the career as composition).
"Follow the whole journey →".

**X · The Invitation / Resolution.** The line **resolves into the wordmark/monogram**; a quiet,
confident *"Bring the breath to your stage."*; one brass CTA to Contact. Footer colophon.

The arc: **birth → presence → truth → roots → craft → proof (perform/video/gallery/press) →
journey → invitation.** Curated, cinematic, and every "Featured" block is a doorway into a
scalable archive.

---

## 9. Component & Style Guide (evolved + new media components)

Keep V1's minimal, precise set (draw-underline links, underline-only forms, collapsed nav →
full-screen overlay, hung captions, film frame). V2 refines and adds the media engine:

- **Breath Line component** — the SVG/canvas spine; API-like states: flow (scroll), settle
  (pause), peak (milestone node), resolve (wordmark). The site's hero component.
- **Video card (YouTube)** — a still/thumbnail framed like a screening; on activate, blooms into
  the embed in place (facade-loads the iframe on click for performance). Tracked meta label
  (Live / Interview / Music Video · date). Tiles into the Videos archive.
- **Gallery frame** — full-bleed or column image with hung caption; in the venue-walk it
  cross-fades still→clip. Behind-the-scenes/events variants. Tiles into the Gallery archive.
- **Press entry** — editorial ledger row (no card): hairline rule, brass source label, serif
  title, date, draw-underline "Read". Feature/standard/award tiers. Tiles into the Press archive.
- **Timeline node** — a point on the Breath Line that expands into a milestone (year, event,
  image, line of copy) as it enters view. The career as a musical composition.
- **Kinetic headline** — the breathing serif behavior, as a reusable treatment.
- **Buttons/links/forms/nav/imagery** — as V1 (draw-underlines, underline-only fields, warm-graded
  grain-unified imagery), now with velocity-aware timing.

Restraint holds: these are *few* components, each perfect, each tiling gracefully at scale.

---

## 10. Animation & Interaction Plan (V2)

Motion is **breath + rhythm**: eased and elegant, but now responsive to the visitor and paced with
dynamics. GSAP + ScrollTrigger + Observer + a light smooth-scroll (the current engine extends to
this). All degrades to static under reduced-motion; content never hidden; 60fps (transform/opacity).

- **Signature (Breath Line):** scroll-position drives its progress; **scroll-velocity** drives its
  flow/tension; pause triggers the settle/sustain; milestone triggers peaks; end triggers the
  wordmark resolve. The spine of all motion.
- **Hero:** brass-assembly title sequence → dissolve → line hands off to kinetic name reveal.
- **Kinetic typography:** velocity-aware breathing headlines + phrased split-text reveals synced
  to the line (§5).
- **Immersive transitions:** ground shifts (Ink↔Bone) as eased scene-fades tied to the line
  crossing a boundary; a subtle warm bloom "hits" as a section becomes active.
- **Pinned Craft movements + camera-dolly parallax** (from V1), now with looping clips.
- **Media storytelling:** venue-walk still→clip cross-fades; YouTube facades that bloom open;
  timeline nodes unfolding along the line.
- **Micro-interactions:** magnetic custom cursor ("VIEW / LISTEN / READ" over media); brass
  draw-underlines; slow image scale + grain/light shift on hover; button brass-wipe fills.
- **Rhythm/dynamics:** deliberate loud/soft pacing so the scroll has tempo — holds and hits.

**Guardrails (non-negotiable, carried from the current build):** full `prefers-reduced-motion`
fallback (Breath Line static, no kinetic type, no smooth-scroll, no cursor); progressive
enhancement (content visible if JS/GSAP fail — never hidden by CSS); split-text keeps real text;
keyboard-first focus; YouTube embeds facade-loaded for performance; no mic / no audio capture ever.

---

## 11. Imagery, Video & Asset Suggestions (V2 — built for abundance)

V1's recommendations stand (hero half-lit portrait, brass/key macros, warm grade + unifying
grain). V2, anticipating volume:

- **Performance photography, dated & tagged** — as Olamide sends recent gigs/events, they slot into
  Performances-by-year and the Gallery. Aim for a few *hero-grade* frames per event (for featured
  slots) plus the wider set (for archives).
- **YouTube videos** — embedded via facade thumbnails; the Videos archive groups Live / Music Video
  / Interview. Provide a clean thumbnail per video (or we derive one) so the grid stays luxurious.
- **Published articles / features / awards** — the Press archive; each needs source, title, date,
  link (and optional pull-quote for featuring on home). Awards get their own tier.
- **Short performance clips (3–10s, silent loops)** — the highest-impact addition: they power the
  Craft movements and the still→clip venue-walk. Even a handful transforms the site from "site" to
  "film."
- **Optional signature audio** — a single held sax note on first interaction (muted default, one
  tasteful toggle) — the ultimate proof for a musician, aligned with the breath idea.
- **Wordmark / monogram** — needed for the Breath Line's *resolution* (the line becomes the
  signature) and the frame/favicon. Worth commissioning a refined mark.

**Content-readiness:** the build stays data-driven with marked placeholder slots, so the flood of
real photos, videos, and articles drops into structured categories and inherits the V2 design and
motion — no redesign as the library grows from a handful to hundreds.

---

### Implementation note (for later — not part of this concept)
When approved, V2 implements on the current standalone `olamide-sax-v2` codebase: reuse the
structure, real content, data-driven model, and the GSAP motion engine; introduce the Breath Line
as a new core component; extend the token/mode system to this palette + kinetic type; and build the
living-archive Media/Gallery/Video/Press/Timeline pages. Still HTML/CSS/vanilla JS/GSAP — no
framework, no build step, all accessibility/reduced-motion/progressive-enhancement guarantees intact.
