#!/usr/bin/env bash
# build-cut.sh — assemble the silent cinematic master from source clips.
#
# Reads a shot plan (scripts/hero/shots.txt). Each non-comment line:
#     SRC  START  DUR  SPEED
#   SRC   = source basename in assets/videos/source (e.g. src-01)
#   START = in-point seconds (float)
#   DUR   = seconds of source to take (float, at 1.0x)
#   SPEED = playback rate (0.5 = half-speed slow-mo → shot lasts DUR/SPEED on screen)
#
# Each shot is trimmed, normalized to 1920x1080 (cover-crop), given a slow
# dolly push (Ken Burns), retimed by SPEED, then all shots are crossfaded
# together into assets/videos/_work/master.mp4 (silent).
#
# The build-then-lift arc lives in shots.txt: early shots slow (0.5x) with
# long fades, later shots near real-time (0.9x) with short fades.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC_DIR="$ROOT/assets/videos/source"
WORK="$ROOT/assets/videos/_work"
SHOTS="$ROOT/scripts/hero/shots.txt"
OUT="$WORK/master.mp4"

W=1920; H=1080; FPS=30
XFADE_EARLY=1.5   # crossfade seconds for the slow opening
XFADE_LATE=0.6    # crossfade seconds for the faster tail

mkdir -p "$WORK"
rm -f "$WORK"/shot-*.mp4

[ -f "$SHOTS" ] || { echo "ERROR: no shot plan at $SHOTS" >&2; exit 1; }

# --- render each shot to a normalized, retimed clip -------------------------
i=0
declare -a DURS   # on-screen duration of each rendered shot
while read -r SRC START DUR SPEED _rest; do
  case "$SRC" in ''|\#*) continue;; esac   # skip blanks/comments
  in="$SRC_DIR/$SRC.mp4"
  [ -f "$in" ] || { echo "  skip $SRC (missing)"; continue; }
  out="$WORK/shot-$(printf '%03d' "$i").mp4"

  # on-screen duration after slow-mo, used later for crossfade offsets
  screen_dur=$(awk "BEGIN{printf \"%.3f\", $DUR/$SPEED}")
  DURS+=("$screen_dur")

  # Slow dolly push: zoom 1.0 -> ~1.06 across the shot (subtle, cinematic).
  zframes=$(awk "BEGIN{printf \"%d\", $screen_dur*$FPS}")
  # setpts retimes to SPEED; scale+crop covers 16:9; zoompan adds the push.
  vf="scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},"
  vf+="setpts=(PTS-STARTPTS)/${SPEED},"
  vf+="zoompan=z='min(zoom+0.0007,1.06)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=${FPS},"
  vf+="fps=${FPS},format=yuv420p"

  echo "  shot $i: $SRC  ${START}s +${DUR}s @${SPEED}x  -> ${screen_dur}s"
  ffmpeg -nostdin -v error -ss "$START" -t "$DUR" -i "$in" \
    -an -vf "$vf" -c:v libx264 -preset medium -crf 18 "$out" -y
  i=$((i+1))
done < "$SHOTS"

N=$i
[ "$N" -ge 1 ] || { echo "ERROR: no shots rendered" >&2; exit 1; }
echo "rendered $N shots"

# --- single shot: just copy -------------------------------------------------
if [ "$N" -eq 1 ]; then
  cp "$WORK/shot-000.mp4" "$OUT"; echo "master -> $OUT"; exit 0
fi

# --- crossfade all shots with xfade -----------------------------------------
# Build a filter_complex chaining xfade between consecutive shots. Fade length
# tapers from XFADE_EARLY to XFADE_LATE across the sequence.
inputs=(); for ((k=0;k<N;k++)); do inputs+=(-i "$WORK/shot-$(printf '%03d' "$k").mp4"); done

fc=""; prev="[0:v]"; acc="${DURS[0]}"
for ((k=1;k<N;k++)); do
  frac=$(awk "BEGIN{print ($k-1)/($N-1)}")
  fade=$(awk "BEGIN{printf \"%.3f\", $XFADE_EARLY+($XFADE_LATE-$XFADE_EARLY)*$frac}")
  offset=$(awk "BEGIN{printf \"%.3f\", $acc-$fade}")
  lbl="[x$k]"; [ "$k" -eq $((N-1)) ] && lbl="[v]"
  fc+="${prev}[$k:v]xfade=transition=fade:duration=${fade}:offset=${offset}${lbl};"
  prev="$lbl"
  acc=$(awk "BEGIN{printf \"%.3f\", $acc+${DURS[$k]}-$fade}")
done
fc="${fc%;}"

echo "joining shots (total ~${acc}s)..."
ffmpeg -nostdin -v error "${inputs[@]}" -filter_complex "$fc" -map "[v]" \
  -an -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p "$OUT" -y

echo "master -> $OUT  (~${acc}s)"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
