/* ============================================================================
   heroAudio.js — Olamide Sax V3 · ambient sound (on by default, politely)
   Loops the hero ambience track (the artist's own performance audio, mastered
   by scripts/hero/audio.sh) UNDER the film: quiet, slightly slowed to sit
   with the slow-motion footage.

   SOUND-ON-BY-DEFAULT: browsers forbid audible autoplay before the visitor
   interacts with the page, so we (1) try to autoplay anyway (succeeds for
   returning visitors Chrome already trusts), and (2) otherwise start on the
   FIRST tap / click / keypress anywhere. The .sound-toggle pill then acts as
   mute/unmute (speaker icon + label reflect the true state via play/pause
   events), and the choice PERSISTS in localStorage: a visitor who muted
   stays muted on their next visit; one who chose sound gets it back on
   their first interaction.
   Page-guarded: no-ops when the markup isn't present (non-home pages).
   ========================================================================== */

import { $, on } from "./utils.js";

const VOLUME = 0.4; // loudness: 0.0 (silent) to 1.0 (full)
const RATE = 0.9;   // music speed: 1.0 = normal, 0.9 = 10% slower
const STORAGE_KEY = "olamide-hero-sound"; // "on" | "muted"

/* localStorage can throw (Safari private mode, blocked storage) — never let
   a preference read/write break the page. */
function readPref() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function savePref(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* fine */ }
}

export function initHeroAudio() {
  const audio = $("[data-hero-audio]");
  const button = $("[data-sound-toggle]");
  if (!audio || !button) return;

  audio.volume = VOLUME;
  audio.playbackRate = RATE;
  if ("preservesPitch" in audio) audio.preservesPitch = true;

  const setPressed = (playing) => {
    button.setAttribute("aria-pressed", String(playing));
    // Icon-only control — the accessible name carries the state for AT.
    button.setAttribute(
      "aria-label",
      playing ? "Mute ambient sound" : "Play ambient sound"
    );
  };

  // Muting is a choice we must respect across visits (localStorage) — after
  // it, only the pill (not the first-gesture unlock) restarts audio.
  let userMuted = readPref() === "muted";
  if (userMuted) setPressed(false);

  const tryPlay = () => audio.play().catch(() => setPressed(false));

  // 1 · Optimistic autoplay (works when the browser already trusts the site) — unless this visitor muted us on a previous visit.
  if (!userMuted) tryPlay();

  // 2 · Otherwise: first real interaction anywhere starts the sound.
  const unlock = (e) => {
    // If that first interaction is the pill itself, stand back — its own click handler owns the.
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
      savePref("on");
      audio.play().then(() => setPressed(true)).catch(() => setPressed(false));
    } else {
      userMuted = true;
      savePref("muted");
      audio.pause();
      setPressed(false);
    }
  });

  // Keep the pill honest whatever starts/stops playback (autoplay success, OS media keys, tab discard...).
  on(audio, "play", () => setPressed(true));
  on(audio, "pause", () => setPressed(false));
}
