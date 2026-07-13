/* ============================================================================
   heroIntro.js — Olamide Sax V3 · cinematic hero entrance (home only)
   ----------------------------------------------------------------------------
   The arrival:
     1. the ambient video fades up from black,
     2. the award eyebrow rises in,
     3. the NAME is TYPED — character by character, with a blinking caret
        trailing the last letter,
     4. the roles + Enter cue settle in.

   TYPEWRITER, done so the layout never moves
   ------------------------------------------
   Every character is in the DOM from the start and merely becomes visible in
   sequence. Nothing is inserted or removed as it types, so the line never
   reflows and the kerning is set once, at load, and never disturbed.

   The caret is a CSS pseudo-element hanging off the LAST TYPED CHARACTER, so it
   sits exactly at the typing position with nothing to measure. (Hung off the
   line box instead, it would park at the end of the full line — ahead of the
   text — which gives the game away immediately.)

   The real text stays readable for assistive tech (splitByChars labels the
   container and hides only the generated spans). With no JS, no GSAP, or under
   reduced-motion, the plain <h1> renders untouched.
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";
import { splitByChars } from "./splitText.js";

/* Seconds between characters. Unhurried — a name is signed, not hammered out. */
const PER_CHAR = 0.26;

/* How long each individual letter takes to arrive. Giving a letter a real (if
   brief) fade is what makes this read as SMOOTH rather than as a stutter: a bare
   visibility flip pops, and a run of pops is a strobe, not a typewriter. It
   overlaps the next letter's start, which is exactly what a hand does. */
const CHAR_FADE = 0.34;

/* An extra beat before the second word begins, so "Sax" lands as its own
   deliberate line rather than running straight on from "Olamide". */
const WORD_GAP = 0.75;

/* Real typing is not a metronome. A little variance in the gap between letters —
   deterministic, seeded off the index, so it is identical on every load — keeps
   the rhythm human without ever looking like a glitch. */
const jitter = (i) => 1 + Math.sin(i * 2.399) * 0.18;

export function initHeroIntro() {
  const gsap = window.gsap;
  const hero =
    document.querySelector('[data-animate="hero"]') ||
    document.querySelector(".hero");
  const title = document.querySelector('[data-animate="hero-title"]');
  if (!hero || !title) return;

  // Progressive enhancement: no motion → leave everything visible as-is.
  if (!gsap || prefersReducedMotion()) return;

  const video = hero.querySelector(".hero__video");
  const eyebrow = hero.querySelector(".hero__eyebrow");
  const meta = hero.querySelector(".hero__meta");
  const cue = hero.querySelector(".hero__cue");

  document.documentElement.classList.add("hero-intro-ready");

  const split = splitByChars(title, ".hero__title-line");
  const chars = split.chars;
  if (!chars.length) return;

  // Hidden, but still occupying their space — the line is laid out exactly as
  // it will finally read, so nothing shifts as the letters arrive.
  gsap.set(chars, { visibility: "hidden", opacity: 0, yPercent: 22 });
  if (video) gsap.set(video, { opacity: 0, scale: 1.08 });
  if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 20 });
  if (meta) gsap.set(meta, { opacity: 0, y: 18 });
  if (cue) gsap.set(cue, { opacity: 0, y: 12 });

  const tl = gsap.timeline({ delay: 0.15 });

  // 1 · Video fades up from black, easing out of a slight push-in.
  if (video) {
    tl.to(video, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" }, 0);
  }

  // 2 · Award eyebrow rises in.
  if (eyebrow) {
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.35);
  }

  /* 3 · THE NAME IS TYPED.
         Each letter EASES in rather than snapping on. That is the whole
         difference between a typewriter and a strobe: a bare visibility flip is
         a hard edge, and ten hard edges in a row read as a stutter. A short fade
         (CHAR_FADE), overlapping the next letter's start, smooths the run
         without costing it any of its rhythm. */
  const TYPE_AT = 0.7;

  let at = TYPE_AT;
  let prevLine = chars[0].parentElement;

  chars.forEach((ch, i) => {
    // crossing onto the second word: the hand pauses before starting it
    const line = ch.parentElement;
    if (line !== prevLine) {
      at += WORD_GAP;
      prevLine = line;
    }

    tl.fromTo(
      ch,
      { opacity: 0, yPercent: 22 },
      {
        opacity: 1,
        yPercent: 0,
        visibility: "visible",
        duration: CHAR_FADE,
        ease: "power3.out",
        onStart: () => {
          // the caret always trails the character being typed
          if (i > 0) chars[i - 1].classList.remove("is-caret");
          ch.classList.add("is-caret");
        },
      },
      at
    );

    at += PER_CHAR * jitter(i);
  });

  const nameEnds = at;

  // The caret lingers a beat after the last letter, then goes.
  tl.call(
    () => chars.forEach((c) => c.classList.remove("is-caret")),
    null,
    nameEnds + 0.9
  );

  // 4 · Roles + Enter cue settle in once the name has landed.
  if (meta) {
    tl.to(meta, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, nameEnds + 0.15);
  }
  if (cue) {
    tl.to(cue, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, nameEnds + 0.35);
  }

  return () => {
    tl.kill();
    chars.forEach((c) => c.classList.remove("is-caret"));
    split.revert();
  };
}
