#!/usr/bin/env bash
# audio.sh — master the hero ambience track from a source video's own audio.
#
# Usage: audio.sh [source-file.mp4]     (default: src-02.mp4)
# Extracts the audio, normalizes loudness to a background-friendly level, and
# adds edge fades so the <audio loop> seam is soft.
# Output: assets/audio/hero-ambience.m4a (small AAC).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="$ROOT/assets/videos/source/${1:-src-02.mp4}"
OUTDIR="$ROOT/assets/audio"
OUT="$OUTDIR/hero-ambience.m4a"
mkdir -p "$OUTDIR"
[ -f "$SRC" ] || { echo "ERROR: no source at $SRC" >&2; exit 1; }
HAS_AUDIO=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_type -of csv=p=0 "$SRC" 2>/dev/null || true)
[ -n "$HAS_AUDIO" ] || { echo "ERROR: $(basename "$SRC") has no sound in it — pick a different video on the audio: line." >&2; exit 1; }

# Fade in 1.2s; fade out over the last 2.8s (computed from actual duration).
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC")
FADE_OUT_START=$(awk -v d="$DUR" 'BEGIN{printf "%.2f", (d>4 ? d-2.8 : d*0.6)}')

ffmpeg -nostdin -v error -i "$SRC" -vn \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=1.2,afade=t=out:st=${FADE_OUT_START}:d=2.6" \
  -c:a aac -b:a 128k "$OUT" -y

echo "audio -> $OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
du -h "$OUT"
