#!/usr/bin/env python3
"""
plan-shots.py — turn the human-friendly hero-timeline.txt into scripts/hero/shots.txt.

Encodes the cut recipe approved on 2026-07-10:
  · shots ROTATE across source videos (round-robin, so no two neighbours share
    a source until only one source has moments left),
  · pacing arc: slow open (long holds, heavy slow-mo) -> tighter middle ->
    long "big finish" holds, with playback speed easing 0.64 -> 0.96,
  · cinematic transitions (slices / radial / wind / opens), never the
    blackout ones (circlecrop, rectcrop), first shot fades in, last shot
    arrives on a zoom.

Also validates everything with plain-language errors (the person running this
is not technical): missing files, typo'd times, moments past a video's end.

Usage: python3 plan-shots.py            (from anywhere; paths are script-relative)
Exits non-zero with a friendly message if the timeline can't be used.
"""

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SRC_DIR = ROOT / "assets" / "videos" / "source"
TIMELINE = ROOT / "hero-timeline.txt"
SHOTS_OUT = Path(__file__).resolve().parent / "shots.txt"

# Transition INTO each shot (first is always fade, last always zoomin).
# Curated: readable, elegant, no mid-transition blackout.
TRANSITIONS = [
    "hlslice", "radial", "hrslice", "distance", "horzopen", "vuslice",
    "diagtl", "hblur", "vertopen", "hlwind", "smoothup", "circleopen",
]

MAX_SHOT_DUR = 5.0  # longest source seconds any shot uses


def fail(msg: str):
    print(f"\n✗ PROBLEM: {msg}\n", file=sys.stderr)
    sys.exit(1)


def parse_time(text: str, lineno: int) -> float:
    """Accept M:SS, H:MM:SS or plain seconds."""
    text = text.strip()
    if re.fullmatch(r"\d+(\.\d+)?", text):
        return float(text)
    parts = text.split(":")
    if not (2 <= len(parts) <= 3) or not all(re.fullmatch(r"\d+", p) for p in parts):
        fail(
            f'line {lineno}: I can\'t read the time "{text}". '
            "Use minutes:seconds (like 2:40) or plain seconds (like 160)."
        )
    parts = [int(p) for p in parts]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return parts[0] * 3600 + parts[1] * 60 + parts[2]


def video_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    )
    try:
        return float(out.stdout.strip())
    except ValueError:
        fail(f"{path.name} doesn't look like a playable video (ffprobe can't read it).")


def video_size(path: Path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    )
    try:
        w, h = out.stdout.strip().split(",")[:2]
        return int(w), int(h)
    except ValueError:
        return (0, 0)


def parse_timeline():
    if not TIMELINE.exists():
        fail(f"I can't find the timeline file at {TIMELINE}. It should sit in the project folder.")
    moments = []            # list of (source-name, seconds) in file order
    audio_source = None
    for lineno, raw in enumerate(TIMELINE.read_text().splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.lower().startswith("audio:"):
            audio_source = line.split(":", 1)[1].strip()
            continue
        parts = line.split()
        if len(parts) != 2:
            fail(
                f'line {lineno}: "{line}" — each moment line needs exactly a '
                "video file and a time, like:  src-01.mp4  2:40"
            )
        moments.append((parts[0], parse_time(parts[1], lineno), lineno))
    if len(moments) < 2:
        fail("I need at least 2 moments to build a film. Add more lines to hero-timeline.txt.")
    return moments, audio_source


def validate(moments):
    """Check files + times; returns {source: duration} and warns about quality."""
    durations = {}
    for src, t, lineno in moments:
        path = SRC_DIR / src
        if src not in durations:
            if not path.exists():
                available = ", ".join(sorted(p.name for p in SRC_DIR.glob("*.mp4"))) or "none"
                fail(
                    f'line {lineno}: there is no video called "{src}" in '
                    f"assets/videos/source/. Videos I can see there: {available}."
                )
            durations[src] = video_duration(path)
            w, h = video_size(path)
            if w and w < 1280:
                print(f"  ⚠ {src} is low resolution ({w}x{h}) — it may look soft/blurry on the site.")
        if t >= durations[src]:
            mins, secs = divmod(int(durations[src]), 60)
            fail(
                f"line {lineno}: {src} is only {mins}:{secs:02d} long, "
                f"so there's no moment at {int(t)//60}:{int(t)%60:02d}."
            )
    return durations


def build_plan(moments, durations):
    """Round-robin across sources; pacing arc + transitions per the recipe."""
    order_of_sources = []
    by_source = {}
    for src, t, _ in moments:
        if src not in by_source:
            by_source[src] = []
            order_of_sources.append(src)
        by_source[src].append(t)

    sequence = []  # (src, start)
    while any(by_source.values()):
        for src in order_of_sources:
            if by_source[src]:
                sequence.append((src, by_source[src].pop(0)))

    n = len(sequence)
    shots = []
    for i, (src, start) in enumerate(sequence):
        t = i / max(n - 1, 1)  # 0 -> 1 through the film
        # Pacing arc: 4.5s holds opening -> ~3.2s mid -> 5.0s finish.
        if t <= 0.5:
            dur = 4.5 - (4.5 - 3.2) * (t / 0.5)
        else:
            dur = 3.2 + (5.0 - 3.2) * ((t - 0.5) / 0.5)
        dur = round(min(dur, MAX_SHOT_DUR), 1)
        # Slow-mo eases off through the film: dreamy open, lively finish.
        speed = round(0.60 + (0.90 - 0.64) * t, 2)
        # Keep the shot inside the video (dur is SOURCE seconds).
        if start + dur > durations[src]:
            start = max(0.0, durations[src] - dur - 0.2)
        if i == 0:
            trans = "fade"
        elif i == n - 1:
            trans = "zoomin"
        else:
            trans = TRANSITIONS[(i - 1) % len(TRANSITIONS)]
        shots.append((src, start, dur, speed, trans))
    return shots


def main():
    moments, audio_source = parse_timeline()
    durations = validate(moments)
    if audio_source and not (SRC_DIR / audio_source).exists():
        fail(f'the "audio:" line names "{audio_source}", but that video isn\'t in assets/videos/source/.')

    shots = build_plan(moments, durations)

    lines = [
        "# Shot plan — SRC  START  DUR  SPEED  XTYPE",
        "# GENERATED by plan-shots.py from hero-timeline.txt — edit THAT file,",
        "# not this one. Recipe: rotate sources, slow open -> lift, cinematic",
        "# transitions (no blackout types), natural grade.",
        "#",
    ]
    for src, start, dur, speed, trans in shots:
        base = Path(src).stem
        lines.append(f"{base:<8} {start:<7.6g} {dur:<5} {speed:<6} {trans}")
    SHOTS_OUT.write_text("\n".join(lines) + "\n")

    screen = sum(d / s for _, _, d, s, _ in shots)
    fades = 0.85 * (len(shots) - 1)
    print(f"  plan: {len(shots)} shots from {len(durations)} videos, "
          f"final film ≈ {screen - fades:.0f} seconds")
    # Hand the audio choice to make-hero.sh via stdout marker.
    if audio_source:
        print(f"AUDIO_SOURCE={audio_source}")


if __name__ == "__main__":
    main()
