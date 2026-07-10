/* ============================================================================
   heroAudio.js — Olamide Sax V3 · ambient sound (on by default, politely)
   Loops the hero ambience track (the artist's own performance audio, mastered
   by scripts/hero/audio.sh) UNDER the film: quiet (volume 0.4) and 5% slow
   (rate 0.95) so it sits with the slow-motion footage.

   SOUND-ON-BY-DEFAULT: browsers forbid audible autoplay before the visitor
   interacts with the page, so we (1) try to autoplay anyway (succeeds for
   returning visitors Chrome already trusts), and (2) otherwise start on the
   FIRST tap / click / keypress anywhere. The .sound-toggle pill then acts as
   mute/unmute and always reflects the true state via play/pause events.
   Page-guarded: no-ops when the markup isn't present (non-home pages).
   ========================================================================== */

import { $, on } from "./utils.js";

const VOLUME = 0.4; // under the page, never over it
const RATE = 0.95;  // 5% slow — matches the film's dreamy pace

export function initHeroAudio() {
  const audio = $("[data-hero-audio]");
  const button = $("[data-sound-toggle]");
  if (!audio || !button) return;

  audio.volume = VOLUME;
  audio.playbackRate = RATE;
  if ("preservesPitch" in audio) audio.preservesPitch = true;

  const setPressed = (playing) => {
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute(
      "aria-label",
      playing ? "Mute ambient sound" : "Play ambient sound"
    );
    const label = $(".sound-toggle__label", button);
    if (label) label.textContent = playing ? "Mute" : "Sound";
  };

  // The user muting is a choice we must respect for the rest of the visit —
  // after that, only the pill (not the first-gesture unlock) restarts audio.
  let userMuted = false;

  const tryPlay = () => audio.play().catch(() => setPressed(false));

  // 1 · Optimistic autoplay (works when the browser already trusts the site).
  tryPlay();

  // 2 · Otherwise: first real interaction anywhere starts the sound.
  const unlock = (e) => {
    // If that first interaction is the pill itself, stand back — its own
    // click handler owns the decision (otherwise we'd start the audio on
    // pointerdown and the click would instantly pause it again).
    if (e.target instanceof Element && e.target.closest("[data-sound-toggle]")) {
      removeUnlockListeners();
      return;
    }
    removeUnlockListeners();
    if (!userMuted && audio.paused) tryPlay();
  };
  const unlockEvents = ["pointerdown", "keydown", "touchend"];
  const removeUnlockListeners = () =>
    unlockEvents.forEach((t) =>
      document.removeEventListener(t, unlock, true)
    );
  unlockEvents.forEach((t) =>
    document.addEventListener(t, unlock, { capture: true, passive: true })
  );

  on(button, "click", (e) => {
    // Don't let this same click ALSO fire the unlock and restart the audio
    // right after we pause it.
    e.stopPropagation();
    removeUnlockListeners();
    if (audio.paused) {
      userMuted = false;
      audio.play().then(() => setPressed(true)).catch(() => setPressed(false));
    } else {
      userMuted = true;
      audio.pause();
      setPressed(false);
    }
  });

  // Keep the pill honest whatever starts/stops playback (autoplay success,
  // OS media keys, tab discard...).
  on(audio, "play", () => setPressed(true));
  on(audio, "pause", () => setPressed(false));
}
