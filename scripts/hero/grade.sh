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

# Shared WHITE-BALANCE fix (applied FIRST, before any look): the source venue
# has a strong green ambient cast. Pull green out of mids/highlights and add a
# touch of magenta+warmth to neutralize it, so grades start from neutral.
WB="colorbalance=gm=-0.14:gh=-0.10:rm=0.05:rh=0.04:bh=-0.02,eq=saturation=0.97"

# Shared finishing: very faint grain + gentle vignette. Prepended-to per grade.
# Grain kept low (alls=3) — heavy grain balloons file size (hard to compress).
GRAIN="noise=alls=3:allf=t"
VIGNETTE="vignette=PI/5"

# --- grade filter chains ----------------------------------------------------
# BRASS  — warm shadows, golden highlights, crushed blacks, aged-brass identity.
# Warm the highlights (r up, b down), keep g neutral to avoid a green cast,
# and cool/crush the shadows slightly. colorbalance does this cleanly.
G_brass="colorbalance=rs=0.06:gs=-0.02:bs=-0.10:rm=0.06:gm=0.0:bm=-0.06:rh=0.10:gh=0.03:bh=-0.12,eq=contrast=1.12:saturation=1.06:gamma=0.97"
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
    -vf "${WB},${grade},${GRAIN},${VIGNETTE},format=yuv420p" \
    -an -c:v libx264 -preset slow -crf 28 -movflags +faststart \
    -maxrate 1500k -bufsize 3M "$out" -y
  # poster: a frame ~1.5s in, same treatment
  ffmpeg -nostdin -v error -ss 1.5 -i "$MASTER" -frames:v 1 \
    -vf "${WB},${grade},${VIGNETTE}" -q:v 3 "$poster" -y
  printf '  %-8s %s  (%s)\n' "$name" "$(basename "$out")" "$(du -h "$out" | cut -f1)"
}

# Optional arg: render just ONE grade (e.g. `grade.sh natural`) — the site
# ships natural, so the make-hero tool skips the other three. No arg = all 4.
WHICH="${1:-all}"
case "$WHICH" in
  brass)   encode brass   "$G_brass" ;;
  teal)    encode teal    "$G_teal" ;;
  moody)   encode moody   "$G_moody" ;;
  natural) encode natural "$G_natural" ;;
  all)
    encode brass   "$G_brass"
    encode teal    "$G_teal"
    encode moody   "$G_moody"
    encode natural "$G_natural"
    ;;
  *) echo "ERROR: unknown grade '$WHICH' (brass|teal|moody|natural|all)" >&2; exit 1 ;;
esac

echo ""
echo "=== grades ready in $OUTDIR ==="
ls -lh "$OUTDIR"
