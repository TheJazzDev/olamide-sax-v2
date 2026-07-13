# Hero Handwriting Animation — Design

**Date:** 2026-07-13
**Branch:** gsap-engine
**Replaces:** the SVG-mask signature draw in `js/heroIntro.js`

## Problem

The current hero "writes" the name by masking filled Great Vibes text with a fat
S-curve path stitched together from each glyph's bounding box. The mask path and
the letterforms are unrelated shapes, so:

- ink blooms in places the nib never travelled (the brief forbids this),
- the nib does not trace real strokes — it wanders through boxes,
- there are no pen lifts, so the stroke order is not a human's,
- it is fragile enough that mobile was disabled outright (commit `1ad8afe`) in
  favour of a plain fade-up.

## Core principle

**One path is both the ink and the pen's route.**

Every stroke of "Olamide Sax" is a hand-authored SVG path. Its `stroke` is the
visible ink, revealed by animating `stroke-dashoffset` from `length → 0`. The nib
is positioned each frame by `path.getPointAtLength(progress × length)` on that
same path.

Ink cannot appear ahead of the nib because ink and nib are the same geometry
sampled at the same instant. This single structural change is what fixes the
current version.

## Decisions taken

| Decision | Choice |
|---|---|
| Path source | Hand-authored by Claude, in-repo, iterated on visually |
| Ink style | The stroke **is** the ink — a new calligraphic wordmark, not Great Vibes |
| Hand | Cropped fingertips + a shaded fountain pen, mostly out of frame |
| Duration | ~6–7s desktop, ~5s mobile |
| Skip | Any scroll / click / keypress snaps the timeline to its end state |
| Mobile | Full animation (the hand-authored path is resolution-independent) |
| Plugins | **None.** GSAP core only. No DrawSVG, no MotionPath. |

Great Vibes remains available to the rest of the site; it simply no longer draws
the hero name.

### Trade-off accepted

The hero wordmark changes. Hand-authored calligraphy will not be
pixel-identical to Great Vibes. This is a conscious change, approved during
brainstorming.

## Stroke decomposition

The name is a **sequence of strokes with lifts between them**, in true writing
order. Lifts are dead time: the nib travels, no ink is laid.

| # | Stroke | Ink | Note |
|---|---|---|---|
| 1 | `O` | yes | capital, one confident counter-clockwise loop |
| 2 | travel → `l` | no | lift, glide, descend |
| 3 | `lamide` | yes | one connected cursive flow (the long stroke) |
| 4 | travel → above `i` | no | |
| 5 | `i` dot | yes | a short tap — the most human beat in the piece |
| 6 | travel → `Sax` | no | the large inter-word move |
| 7 | `S` | yes | capital, its own stroke |
| 8 | travel → `a` | no | small hop |
| 9 | `ax` | yes | connected |
| 10 | `x` cross-bar | yes | short decisive stroke (preceded by a small lift) |

During a lift the pen group translates **and** rises: a small `y` offset, a
slight scale-up, and a softer/larger contact shadow — reading as "off the page".
No dashoffset animates during a lift. The pen never teleports and never draws
without contact.

## Speed as a human, not a machine

Three layers:

1. **Per-stroke easing.** Long flowing strokes use `power1.inOut` (accelerate out
   of the start, decelerate into the end). Short decisive marks (the i-dot, the
   x-bar) use `power2.out`. Lifts use `power2.inOut`.
2. **Micro-jitter.** A low-frequency noise offset (~0.5–1px) on the nib position
   plus a ±2° wrist rotation that follows stroke curvature. Not enough to notice;
   enough that the eye stops reading it as a machine.
3. **Pauses.** 60–140ms holds at the end of each word and before the i-dot. Dead
   air is what a real hand does.

## Ink quality

- **Pressure variation.** SVG cannot vary stroke width along one path, so each
  ink stroke is drawn as **two paths in lockstep**: a thin hairline and a thicker
  downstroke-weighted path, each with its own dash animation on identical
  progress. Weight builds where a nib would press.
- **Ink bleed.** A subtle `feGaussianBlur` + `feComposite` so edges are not
  laser-sharp.
- `stroke-linecap: round`, `stroke-linejoin: round`.
- Warm off-black ink, not pure black.
- **No glow. No sparkle.**

## Pen and hand

A single SVG group with the **nib tip at origin `(0,0)`**, so translating the
group puts the nib exactly on the writing point.

- **Fountain pen**, gradient-shaded (not flat fills): brushed-gold nib with slit
  and breather hole, lacquered dark barrel with a specular highlight running its
  length, a gold band.
- **Only the fingertips** — index and thumb pad meeting at the grip, cropped hard
  by the bottom of the frame. Soft gradient shading, warm skin, no outlines, a
  soft-focus falloff on the far edge to read as shallow depth of field.
- **Contact shadow** under the nib that tightens and darkens on contact, softens
  and spreads on lift. This detail carries most of the "it is touching the page"
  illusion.

## Camera and light

- A very slow `scale: 1.02 → 1.00` over the sequence, applied to the hero title
  group only (not the video).
- A barely-there warm light-pool gradient that follows the nib, as if a practical
  light sits over the writing hand.

Both are subtle enough to be felt, not seen. The camera is otherwise static.

## Architecture

```
js/signature/
  signature.js         — public initSignature(); orchestrates, returns a timeline
  signaturePath.js     — hand-authored stroke data (pure data, no logic)
  signaturePen.js      — builds the pen+hand SVG; exposes place(x, y, rot, contact)
  signatureTimeline.js — builds the GSAP timeline from the stroke data
```

`heroIntro.js` keeps owning the video / eyebrow / meta / cue choreography and
calls `initSignature()` for the name, sequencing the rest against its completion.

**Deleted from `heroIntro.js`:** `buildSignatureLine`, `createWritingHand`,
`penPointAt`, and the entire mobile fade-up branch.

### Stroke data shape

`signaturePath.js` exports an ordered array. Each entry is either an ink stroke
or a lift:

```js
{ type: "ink",  d: "M …", ease: "power1.inOut", dur: 1.4, hold: 0.1 }
{ type: "lift", to: [x, y], ease: "power2.inOut", dur: 0.35, arc: 40 }
```

The timeline builder consumes this list in order and needs no knowledge of the
letterforms. Re-authoring the calligraphy means editing one data file.

## Degradation and performance

- **No JS / no GSAP / reduced-motion:** the `<h1>` renders as plain text (Great
  Vibes, as today). Nothing is touched. The SVG is injected only when we are
  actually going to animate.
- **Skip:** any scroll, click, or keypress calls `timeline.progress(1)` for an
  instant finished state.
- **60fps:** per frame the only work is one `getPointAtLength` (with the total
  length pre-cached) and one `gsap.set` transform on the pen group. Ink is pure
  `stroke-dashoffset`. No layout, no reflow. `will-change: transform` on the pen
  group only.
- **Mobile:** identical path data, viewBox-scaled; ~5s; pen scaled down so it does
  not cover the name.

## Accessibility

The real name text is preserved in a visually-hidden span for assistive tech, as
today. The injected SVG carries `aria-hidden="true"`.

## Build order

1. Author the stroke path data and render it **statically**.
2. **Review gate:** show the static wordmark to the user. Do not animate
   letterforms that have not been approved.
3. Build the pen/hand SVG.
4. Build the timeline; tune pacing.
5. Wire into `heroIntro.js`; delete the old code.
6. Verify on desktop and at 375px.
