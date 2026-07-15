# EPK Page — Design Spec

**Date:** 2026-07-15
**Status:** Approved → building directly (no implementation-plan step)

## Goal

A dedicated booker-facing **Electronic Press Kit** at `/epk.html`, in the
site's cinematic style, pulling booking-relevant highlights into one scannable
page. The page **content itself is downloadable** (like danloops.com/epk), via
browser print-to-PDF now and a Drive/Dropbox asset-pack link once supplied.

## Page structure (top → bottom)

1. **Masthead** — hero press photo + name + positioning line (Afro-Fusion
   Artist · Multi-Instrumentalist · Participatory Artist · Creative
   Facilitator). Two download actions live here.
2. **Bio** — a **short bio** (1–2 sentence, ready-to-quote, written by us from
   existing CV/About prose, no new facts) AND a **long bio** (full paragraph),
   clearly separated so a promoter can grab either.
3. **At a glance** — quick-facts strip: 10+ years live performance; saxophone /
   vocals / keys / percussion; Eko Heritage Award — Best Instrumentalist 2026;
   based Doncaster / Sheffield, UK.
4. **Selected press** — 3–4 pulled quotes / outlets (BBC, The Guardian, New
   Telegraph, The Star) with links. Reuse press content already on the site.
5. **Performance highlights** — tight curated list (World Record procession,
   ÀTÙPÀ, Manchester Africa Day, Sharrow, etc.).
6. **Booking & contact** — email (olaniyanolamidephillip@gmail.com), phone
   (+44 7350 166053, click-to-call `tel:`), socials (IG/YouTube/LinkedIn/FB),
   and "Based in Doncaster / Sheffield, UK" (NO full home address — privacy).

## Downloads (both mechanisms)

- **"Download EPK (PDF)"** — a button that calls `window.print()`. A **print
  stylesheet** (`@media print`) hides nav / footer / cursor / decorative frame
  and lays out bio + press + contact cleanly so the saved PDF is branded and
  readable. Self-contained, works immediately, always matches the live page.
- **"Full press pack"** — button linking to a Drive/Dropbox folder for hi-res
  photos + PDF. **Shown as "available on request" / placeholder until the user
  supplies the link** — NO dead link / 404. TODO marker in the HTML.
- **"Download press photo"** — links to the best existing hi-res gallery image
  (already in `assets/`), so at least one real photo download works now.

## Site integration

- `epk.html` follows the existing page skeleton: same `<head>` block, favicon,
  OG/Twitter meta (title/description for EPK), nav + footer markup, CSS cascade
  order. Hand-authored HTML like the other pages.
- **Nav (cross-cutting):** add an **"EPK"** item to the menu overlay AND the
  footer explore list on **all 9 pages** (8 existing + new). Menu currently has
  8 items; becomes 9.
- Reuse existing content (bio/press/performances) — keep consistent with
  About/Press/Timeline; no new facts, no fabrication.
- New CSS in a dedicated block (e.g. `css/epk.css` or appended to `pages.css`)
  for EPK-specific layout + the print stylesheet.
- Reveal hooks: reuse registered `SECTION_HOOKS` names where they fit; register
  a new one only if needed.

## Non-goals (YAGNI)

- No PDF file authored by us (print-to-PDF covers it; asset-pack PDF is the
  user's to provide via the Drive link).
- No home address, no new contact channels beyond the CV's.
- No new JS beyond the print trigger + (if needed) one reveal-hook name.

## Verification

- `bun run build` succeeds; `epk.html` minifies into `dist/`.
- EPK reachable from nav on all 9 pages; 9 nav items consistent everywhere.
- Print preview (or print CSS inspection) shows a clean branded PDF layout.
- No dead download link (press-pack is a labelled placeholder).
- 1 `<h1>`, balanced tags, 0 console errors / 404s at 1440/768/375 (live check
  if browser extension available; else structural verification).
- Commit source only (`dist/` gitignored).
