# CV Integration — Curated Portfolio Design

**Date:** 2026-07-15
**Status:** Approved (brainstorming) → ready for plan
**Source:** Olamide Phillips Olaniyan (Olamide Sax) full CV, supplied 2026-07-15

## Goal

Integrate everything meaningful from the full CV into the existing v3 site,
edited into the site's cinematic editorial voice — a **curated portfolio, not
a résumé**. Fold new content into existing pages; add no new pages. Keep
`js/data.js` as the accurate source-of-truth mirror. Omit non-arts Education.

## Guiding principles

- **Curate, don't dump.** A portfolio edits; a résumé lists. Pick the
  significant / press-backed items; present the rest as tight grouped lists,
  never heavy card grids.
- **No fabrication.** Every date and claim traces to the CV verbatim. Where the
  CV is precise (Mar–Jul 2026), use real dates; where it isn't, use
  non-asserting era markers.
- **Site voice.** Cinematic restraint, label-style strips over cards, existing
  component vocabulary (`press-entry`, `press-mention`, `movement`, `genre`,
  `timeline-milestone`, `link-underline`). Match mobile-first responsive tokens.
- **data.js mirrors the HTML.** Pages are hand-authored; `data.js` is the
  documented source of truth (not runtime-rendered for these surfaces). Keep
  both in sync in the same change.

## Already done (prior commits, out of scope here)

- Press ledger: 7 real articles (BBC, 2× Guardian, New Telegraph ×2, The Nation,
  The Star) + Eko Heritage Award. `60666c0`, `8141852`.
- Notable Mentions: darts, ArtBomb, SBC, Black Pride (linked). `8141852`.
- Socials: Instagram / LinkedIn / YouTube / Facebook (canonical URL) across all
  8 pages; TikTok removed. `60666c0`, `8141852`.

## Scope — four sections

### 1. Timeline page (`timeline.html`) — dated, curated spine

Replace undated "Recent Highlights" nodes with a real-dated chronological spine
of ~10–12 curated milestones. Keep the origin arc; anchor recent nodes with the
CV's true dates. Curate to the most significant / press-backed moments so it
reads as a composed spine, not a log.

Milestone set (chronological):

- **2010** — The first rhythm (Yoruba percussion) *(kept)*
- Era markers — *Toward many voices*, *A home for the sound* *(kept, undated origin arc)*
- **Oct 2025** — Nigeria in Doncaster Cultural Day · BME United Doncaster (Black History Month)
- **Mar 2026** — "Mama" premiere (SBC Soapbox Spotlight, Sheffield) · Migration Action Celebration (CAST)
- **Apr 2026** — ÀTÙPÀ (The Spotlight), Black Pride Festival (CAST) · Beyond the Scroll (ArtBomb)
- **May 2026** — Adira Food Pharmacy launch (Sheffield)
- **Jun 2026** — World Record Football Scarf Procession (SBC) · Manchester Africa Day · Collective Routes & Beyond (Doncaster)
- **Jul 2026** — Sharrow Festival (Sound Café Afrobeat ensemble)
- **2026** — Eko Heritage Award — Best Instrumentalist of the Year

Motion: new nodes carry `data-timeline-node`; the Breath Line
(`data-breath-timeline`) animation keys off them automatically — no JS changes.

### 2. Artistic Practice page (`artistic-practice.html`) — Teaching & Facilitation

Fold a **Teaching & Creative Health** block into the existing participatory
region (near "More than performance" / "Where he plays").

- **Teaching** — Music Tutor, Tirosh Koncept (Sheffield, 2026–present):
  saxophone, keyboard, recorder, drum kit; children & young people; framed as
  developing musicianship, confidence, collaborative performance.
- **Creative Health facilitation** — the 7 workshop credits as one elegant
  grouped strip (NOT 7 cards): Singing for Memory (darts), Dance On for
  Parkinson's (Armthorpe), Quirky Choir (darts), Community Drumming (CAST),
  Tuneful Chatter (Grange Lane), Dance On: Strength & Balance (Woodfield),
  ÀTÙPÀ Martini Workshop (Black Pride, 100+ participants).

Reinforces the participatory identity the CV foregrounds (wellbeing, inclusion,
community engagement).

### 3. About page (`about.html`) — Affiliations, Theatre credits, enriched Origin

- **Origin movement enrichment** — weave named Yoruba instruments (Cord, Omele,
  Jembe, Talking Drum, Omele Bata, Iya Ilu Bata) and fuller venue arc (CAST,
  SBC, ArtBomb, Utopia, Manchester Africa Day, Black Pride) into the existing
  cinematic prose. Texture, not a list.
- **Roles & Affiliations strip** — understated label-style list (not cards):
  Founder & Lead Artist (Lammy Wonder Music Entertainment); Resident Pianist
  (RCCG Maranatha Parish, Doncaster); Featured Saxophonist (The Skintones UK,
  Sound Café UK); Artist Collaborator (Stand & Be Counted Theatre); darts &
  Maya Productions Artist Development graduate.
- **Theatre Credits** — compact editorial credits line: Oòdayè (The Cradle) —
  *Adigún*; Mama — *Writer, Composer & Performer*.
- **Education** — omitted (non-arts; not on site).

### 4. data.js sync + build

- Update `performances[]` with real dates (Oct 2025 → Jul 2026) mirroring the
  timeline spine.
- Add documented arrays mirroring new HTML: `teaching`, `facilitation`,
  `affiliations`, `theatreCredits`.
- `bun run build` → regenerate `dist/`.

## Non-goals (YAGNI)

- No new pages, no downloadable PDF CV, no Education section.
- No runtime rendering of `data.js` for these surfaces (pages stay authored).
- No exhaustive performance log — curation over completeness.
- No new JS/motion — reuse existing Breath Line + reveal hooks.

## Verification

- `bun run build` succeeds.
- All new content present in `dist/` (grep verify per section).
- 8 pages × 1440/768/375: 0 horizontal overflow, 0 console errors, 0 404s,
  one `<h1>` each, sticky/pin intact.
- No fabricated dates; every claim traceable to the CV.
- Commit source only (`dist/` gitignored, built on deploy).
