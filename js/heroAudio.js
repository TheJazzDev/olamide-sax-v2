/* ============================================================================
   heroAudio.js — Olamide Sax V3 · ambient sound toggle
   Plays/pauses the hero ambience track (the artist's own performance audio,
   mastered by scripts/hero/audio.sh) from the fixed .sound-toggle pill.
   Audio never autoplays — browsers block it and the visitor should choose.
   Page-guarded: no-ops when the markup isn't present (non-home pages).
   ========================================================================== */

import { $, on } from "./utils.js";

export function initHeroAudio() {
  const audio = $("[data-hero-audio]");
  const button = $("[data-sound-toggle]");
  if (!audio || !button) return;

  const setPressed = (playing) => {
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute(
      "aria-label",
      playing ? "Mute ambient sound" : "Play ambient sound"
    );
    const label = $(".sound-toggle__label", button);
    if (label) label.textContent = playing ? "Mute" : "Sound";
  };

  on(button, "click", () => {
    if (audio.paused) {
      // play() returns a promise; if the browser refuses (rare, since this
      // is a user gesture), stay visually muted rather than lying.
      audio
        .play()
        .then(() => setPressed(true))
        .catch(() => setPressed(false));
    } else {
      audio.pause();
      setPressed(false);
    }
  });

  // If the OS/browser pauses us (e.g. another app grabs audio focus, or the
  // tab is discarded), keep the pill honest.
  on(audio, "pause", () => setPressed(false));
  on(audio, "play", () => setPressed(true));
}
