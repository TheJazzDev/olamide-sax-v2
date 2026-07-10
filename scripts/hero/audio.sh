#!/usr/bin/env bash
# audio.sh — master the hero ambience track from src-02's own audio.
#
# src-02.mp4 (artist's own YouTube upload) carries the performance audio the
# site loops UNDER the hero video. This extracts it, normalizes loudness to a
# background-friendly level, and adds edge fades so the <audio loop> seam is
# soft. Output: assets/audio/hero-ambience.m4a (small AAC, ~1.5MB).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="$ROOT/assets/videos/source/src-02.mp4"
OUTDIR="$ROOT/assets/audio"
OUT="$OUTDIR/hero-ambience.m4a"
mkdir -p "$OUTDIR"
[ -f "$SRC" ] || { echo "ERROR: no source at $SRC" >&2; exit 1; }

# 92s track: normalize to -16 LUFS, fade in 1.2s, fade out last 2.6s.
ffmpeg -nostdin -v error -i "$SRC" -vn \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=1.2,afade=t=out:st=89.2:d=2.6" \
  -c:a aac -b:a 128k "$OUT" -y

echo "audio -> $OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
du -h "$OUT"
