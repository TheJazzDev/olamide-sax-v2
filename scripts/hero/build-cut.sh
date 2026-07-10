#!/usr/bin/env bash
# build-cut.sh — assemble the silent cinematic master in a SINGLE ffmpeg pass.
#
# Reads scripts/hero/shots.txt. Each non-comment line:
#     SRC  START  DUR  SPEED
#   SRC=source basename (src-01), START=in seconds, DUR=source seconds at 1x,
#   SPEED=rate (0.5 = half-speed slow-mo, shot lasts DUR/SPEED on screen).
#
# All shots are trimmed on input (-ss/-t), then in ONE filter_complex each is
# scaled/cropped to 1920x1080 and retimed by SPEED, and consecutive shots are
# crossfaded (xfade) — long fades early, short late = "slow build then lift".
# Output: assets/videos/_work/master.mp4 (silent). Single pass = fast + atomic.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC_DIR="$ROOT/assets/videos/source"
WORK="$ROOT/assets/videos/_work"
SHOTS="$ROOT/scripts/hero/shots.txt"
OUT="$WORK/master.mp4"
W=1920; H=1080; FPS=30
XFADE_EARLY=1.3; XFADE_LATE=0.6
mkdir -p "$WORK"
[ -f "$SHOTS" ] || { echo "ERROR: no shot plan at $SHOTS" >&2; exit 1; }

# --- parse shot plan --------------------------------------------------------
SRCS=(); STARTS=(); DURS=(); SPEEDS=(); SCREEN=()
while read -r SRC START DUR SPEED _; do
  case "$SRC" in ''|\#*) continue;; esac
  [ -f "$SRC_DIR/$SRC.mp4" ] || { echo "  skip $SRC (missing)"; continue; }
  SRCS+=("$SRC"); STARTS+=("$START"); DURS+=("$DUR"); SPEEDS+=("$SPEED")
  SCREEN+=("$(awk -v d="$DUR" -v s="$SPEED" 'BEGIN{printf "%.4f", d/s}')")
done < "$SHOTS"
N=${#SRCS[@]}
[ "$N" -ge 1 ] || { echo "ERROR: no shots" >&2; exit 1; }
echo "planning $N shots (single pass)..."

# --- build inputs + per-shot normalize/retime filters -----------------------
inputs=(); fc=""
for ((k=0;k<N;k++)); do
  inputs+=(-ss "${STARTS[$k]}" -t "${DURS[$k]}" -i "$SRC_DIR/${SRCS[$k]}.mp4")
  fc+="[${k}:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},"
  fc+="setpts=(PTS-STARTPTS)/${SPEEDS[$k]},fps=${FPS},format=yuv420p[c${k}];"
done

# --- chain crossfades -------------------------------------------------------
if [ "$N" -eq 1 ]; then
  fc+="[c0]copy[v]"
else
  prev="[c0]"; acc="${SCREEN[0]}"
  for ((k=1;k<N;k++)); do
    frac=$(awk -v k="$k" -v n="$N" 'BEGIN{print (k-1)/(n-1)}')
    fade=$(awk -v e="$XFADE_EARLY" -v l="$XFADE_LATE" -v f="$frac" 'BEGIN{printf "%.3f", e+(l-e)*f}')
    offset=$(awk -v a="$acc" -v f="$fade" 'BEGIN{printf "%.3f", a-f}')
    lbl="[x$k]"; [ "$k" -eq $((N-1)) ] && lbl="[v]"
    fc+="${prev}[c${k}]xfade=transition=fade:duration=${fade}:offset=${offset}${lbl};"
    prev="$lbl"
    acc=$(awk -v a="$acc" -v sc="${SCREEN[$k]}" -v f="$fade" 'BEGIN{printf "%.4f", a+sc-f}')
  done
  fc="${fc%;}"
  echo "estimated master length ~${acc}s"
fi

echo "rendering master (one pass)..."
ffmpeg -nostdin -v warning -stats "${inputs[@]}" -filter_complex "$fc" \
  -map "[v]" -an -c:v libx264 -preset veryfast -crf 22 -pix_fmt yuv420p "$OUT" -y

echo "master -> $OUT"
ffprobe -v error -show_entries format=duration:stream=width,height -of default=noprint_wrappers=1 "$OUT"
du -h "$OUT"
