#!/usr/bin/env bash
# grade.sh — render the silent master into 4 graded, web-optimized hero loops
# plus a poster JPG for each. Grades: brass (default), teal, moody, natural.
#
# Each grade is an FFmpeg filter chain applied to master.mp4. A faint film
# grain + vignette is added to all (per the "35mm filmed room" concept).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORK="$ROOT/assets/videos/_work"
OUTDIR="$ROOT/assets/videos/grades"
MASTER="$WORK/master.mp4"
mkdir -p "$OUTDIR"

[ -f "$MASTER" ] || { echo "ERROR: no master at $MASTER (run build-cut.sh first)" >&2; exit 1; }

# Shared finishing: faint grain + gentle vignette. Prepended-to per grade.
GRAIN="noise=alls=6:allf=t+u"
VIGNETTE="vignette=PI/5"

# --- grade filter chains ----------------------------------------------------
# BRASS  — warm shadows, golden highlights, crushed blacks, aged-brass identity.
G_brass="curves=r='0/0.03 0.5/0.55 1/1':g='0/0.02 0.5/0.48 1/0.96':b='0/0.04 0.5/0.42 1/0.86',eq=contrast=1.12:saturation=1.05:gamma=0.96"
# TEAL   — orange skin vs teal shadows, punchy blockbuster.
G_teal="curves=b='0/0.06 0.5/0.5 1/0.92':r='0/0 0.5/0.53 1/1',eq=contrast=1.18:saturation=1.12"
# MOODY  — desaturated, cool, crushed blacks, high contrast, film-noir.
G_moody="eq=contrast=1.22:saturation=0.6:gamma=0.9,curves=b='0/0.05 1/0.95'"
# NATURAL — true colors, mild contrast + warmth, safe polish.
G_natural="eq=contrast=1.06:saturation=1.03:gamma=0.99"

encode () {
  local name="$1" grade="$2"
  local out="$OUTDIR/hero-loop--$name.mp4"
  local poster="$OUTDIR/hero-poster--$name.jpg"
  echo "grading: $name"
  ffmpeg -nostdin -v error -i "$MASTER" \
    -vf "${grade},${GRAIN},${VIGNETTE},format=yuv420p" \
    -an -c:v libx264 -preset slow -crf 24 -movflags +faststart \
    -maxrate 4M -bufsize 8M "$out" -y
  # poster: a frame ~1.5s in, same grade
  ffmpeg -nostdin -v error -ss 1.5 -i "$MASTER" -frames:v 1 \
    -vf "${grade},${VIGNETTE}" -q:v 3 "$poster" -y
  printf '  %-8s %s  (%s)\n' "$name" "$(basename "$out")" "$(du -h "$out" | cut -f1)"
}

encode brass   "$G_brass"
encode teal    "$G_teal"
encode moody   "$G_moody"
encode natural "$G_natural"

echo ""
echo "=== grades ready in $OUTDIR ==="
ls -lh "$OUTDIR"
