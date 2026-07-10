#!/usr/bin/env bash
# make-hero.sh — the ONE command that rebuilds the website's hero film.
#
#   hero-timeline.txt  ──►  plan-shots.py  ──►  shots.txt
#                            build-cut.sh  ──►  _work/master.mp4
#                            grade.sh natural ─► grades/hero-loop--natural.mp4
#                            deploy ─────────►  assets/videos/hero-loop.mp4 (+poster)
#                            audio.sh (if an "audio:" line is set)
#
# Made to be run by a NON-TECHNICAL person via "Make Hero Video.command" —
# every failure path prints plain language, and the result opens for review.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HERE="$ROOT/scripts/hero"
QUIET='Late SEI|ffmpeg-devel|streams.videolan|help, upload|swscaler'

echo ""
echo "🎬  Making the hero film from hero-timeline.txt ..."
echo ""

command -v ffmpeg >/dev/null || {
  echo "✗ PROBLEM: ffmpeg isn't installed on this Mac (it does the video work)."
  echo "  Ask Claude to install it, or run:  brew install ffmpeg"
  exit 1
}

# 1 · Plan the cut (validates the timeline; prints friendly errors itself).
PLAN_OUT=$(python3 "$HERE/plan-shots.py")
echo "$PLAN_OUT" | grep -v '^AUDIO_SOURCE=' || true
AUDIO_SOURCE=$(echo "$PLAN_OUT" | sed -n 's/^AUDIO_SOURCE=//p')

# 2 · Cut the master.
echo ""
echo "…cutting (about half a minute)"
bash "$HERE/build-cut.sh" 2>&1 | grep -vE "$QUIET" | grep -vE '^frame=' || true
[ -f "$ROOT/assets/videos/_work/master.mp4" ] || { echo "✗ the cut failed — see messages above."; exit 1; }

# 3 · Grade (natural — the look the site ships).
echo "…grading"
bash "$HERE/grade.sh" natural 2>&1 | grep -vE "$QUIET" | tail -2

# 4 · Put it on the site.
cp "$ROOT/assets/videos/grades/hero-loop--natural.mp4" "$ROOT/assets/videos/hero-loop.mp4"
cp "$ROOT/assets/videos/grades/hero-poster--natural.jpg" "$ROOT/assets/videos/hero-poster.jpg"

# 5 · Sound under the film (only if the timeline asks for it).
if [ -n "$AUDIO_SOURCE" ]; then
  echo "…mastering the sound from $AUDIO_SOURCE"
  bash "$HERE/audio.sh" "$AUDIO_SOURCE" >/dev/null
fi

echo ""
echo "✅  DONE — the new film is live on the site's hero."
echo "    ($(du -h "$ROOT/assets/videos/hero-loop.mp4" | cut -f1) · opening it now so you can watch it)"
open "$ROOT/assets/videos/hero-loop.mp4" 2>/dev/null || true
