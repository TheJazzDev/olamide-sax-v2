# Cinematic Hero Loop — Design Spec

**Date:** 2026-07-10
**Project:** olamide-sax-v3
**Goal:** A ~75s silent, looping, landscape 16:9 cinematic hero background video, cut
from the artist's own YouTube footage, graded to the site's "aged brass / filmed room"
identity, with 3 alternate grades for comparison. Then wired into the hero.

## Context

- Site concept (`docs/olamide-sax-cinematic-concept.md`): "The breath between notes."
  Warm ink `#0B0A08`, bone, **aged brass** accent. Film grain (faint 35mm). Slow camera
  dolly drift. Dark warm room, single warm source, crushed warm shadows. NOT teal-orange.
- Current hero (`index.html`): uses `assets/videos/hero-loop.mp4` — but that file is
  **portrait 1152×2048, 6s**. Hero background needs **landscape 16:9**. This must change.
- FFmpeg 8.0 installed. yt-dlp installed (2026.07.04).
- 4 source videos downloaded to `assets/videos/source/src-01..04.mp4` (all ~1080p landscape).

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Emotional arc | Mixed — slow build then lift |
| Grade | Render ALL 4 (brass / teal-orange / moody / natural); brass = default |
| Live switching | None for now — ship one; keep 4 files so rotation can be added later |
| Footage source | Downloaded from artist's own YouTube (authorized) via yt-dlp |
| Who runs it | Claude runs the whole pipeline; user only reviews & picks winner |
| Timestamps | Run BLIND first (auto-sample); refine with user timestamps later |
| Length | ~75 seconds |

## Pipeline (three stages, Claude-run)

### Stage A — Cut (`scripts/hero/build-cut.sh`)
- Input: `assets/videos/source/src-01..04.mp4`
- Shot plan config: `scripts/hero/shots.txt` — lines of `srcfile start dur speed`.
  If empty/absent, auto-sample evenly across sources.
- Per shot: trim → scale/crop to 1920×1080 → slow-mo (early shots ~0.5x, later ~0.9x =
  the build-then-lift arc) → optional slow Ken Burns push.
- Join with crossfades (xfade): long (~1.5s) early, short (~0.6s) late.
- Strip audio. Output silent master → `assets/videos/_work/master.mp4` (~75s).

### Stage B — Grade + optimize (`scripts/hero/grade.sh`)
From `master.mp4`, render 4 web-ready loops (H.264, +faststart, faint grain + vignette,
target 3–5MB, no audio) + a poster JPG each:
- `hero-loop--brass.mp4`  (DEFAULT — warm shadows, aged-brass highlights, 35mm grain)
- `hero-loop--teal.mp4`
- `hero-loop--moody.mp4`
- `hero-loop--natural.mp4`

### Stage C — Compare + go live
- Preview page (scratchpad) showing all 4 side-by-side for the user to pick.
- Winner copied to `assets/videos/hero-loop.mp4` (+ `hero-poster.jpg`).
- Update `index.html` hero: portrait→landscape framing; confirm autoplay/mute/loop/playsinline;
  verify it plays.

## Non-goals (YAGNI)
- No per-page/per-visit grade rotation yet (files exist to add later).
- No audio.
- No manual frame-by-frame editing — automated recipe only.

## Success criteria
- One graded ~75s landscape loop plays muted+looping in the hero, matching the brass identity.
- User has seen 4 grades and chosen one.
- File is web-optimized (faststart, reasonable size), degrades to poster under reduced motion.
