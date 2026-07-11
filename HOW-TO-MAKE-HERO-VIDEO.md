# How to Rebuild the Hero Video 🎬

The website's cinematic background film is built by a tool that lives in this
folder. You never need the Terminal — three steps and it's on the site.

---

## The 3 steps

### 1 · Add your videos
Drop your `.mp4` files into:

```
assets/videos/source/
```

- Landscape videos, ideally **1080p or better** (low-res footage will look
  soft/blurry and the tool will warn you).

### 2 · Edit `hero-timeline.txt`
It's in this folder — open it with **TextEdit**. List the moments you love,
one per line — a video file and a time:

```
my-new-video.mp4   1:45
my-new-video.mp4   3:20
other-video.mp4    0:30
```

- Time is `minutes:seconds` (like `2:40`) or plain seconds (like `160`).
- **8–14 moments** makes a nice 40–55 second film.
- For each video, the **first moment you list is used earliest** in the film.
- The optional last line picks whose **sound** plays under the film:

```
audio: other-video.mp4
```

### 3 · Double-click `Make Hero Video.command`
(Also in this folder. The very first time, **right-click → Open** — macOS is
cautious about new apps.)

It designs the cut — rotating between your videos, slow dreamy open, lively
finish, cinematic transitions, the natural colour grade — renders it, **puts
it straight on the website**, remasters the sound, and opens the finished film
so you can watch it.

If something's wrong (typo'd filename, a time past the end of a video), it
tells you in plain English. Fix the timeline and double-click again.

---

## Knobs you can turn

### Film slow-motion (how dreamy the video feels)
File: `scripts/hero/plan-shots.py` — find this line:

```python
speed = round(0.64 + (0.96 - 0.64) * t, 2)
```

- `0.64` = speed at the **start** of the film (64% of real speed — dreamy)
- `0.96` = speed at the **end** (96% — almost real time, lively)
- Lower numbers = slower. Example: `0.55` and `0.85` make everything slower.
- Re-run `Make Hero Video.command` afterwards to re-render.

### Music speed & volume
File: `js/heroAudio.js` — the two lines at the top:

```js
const VOLUME = 0.4; // loudness: 0.0 (silent) to 1.0 (full)
const RATE = 0.95;  // speed: 0.9 = 10% slower, 1.0 = normal
```

- Takes effect on the next page reload — **no re-render needed**.

### How long each shot stays on screen
File: `scripts/hero/plan-shots.py` — the pacing arc in `build_plan`:

```python
dur = 4.5 - (4.5 - 3.2) * (t / 0.5)      # opening: 4.5s holds
dur = 3.2 + (5.0 - 3.2) * ((t - 0.5) / 0.5)  # finish: up to 5.0s holds
```

Bigger numbers = longer, calmer shots (and a longer film overall).

---

## If something looks off

| Problem | Fix |
|---|---|
| "There is no video called…" | The filename in `hero-timeline.txt` doesn't match a file in `assets/videos/source/` — the message lists what IS there. |
| "…is only X:XX long" | One of your times is past the end of that video. |
| A transition flashes black | Tell Claude — one transition type needs swapping (never use `circlecrop`). |
| Film looks blurry | That source video is low resolution — use a 1080p version. |
| Want a different look/pacing | Open Claude Code in this folder and just describe it — a skill file (`.claude/skills/hero-video/`) teaches Claude the whole system. |
