/* heroIntro.js — cinematic hero entrance (home only): video fade-up, eyebrow
   rise, NAME typed char-by-char with a trailing caret, then meta.
   All chars are in the DOM from the start (visibility only) so the line never
   reflows. The caret hangs off the LAST TYPED CHAR (not the line box, which
   would park it ahead of the text). No GSAP / reduced-motion → plain <h1>. */

import { prefersReducedMotion } from "./utils.js";
import { splitByChars } from "./splitText.js";

/* Seconds between characters. */
const PER_CHAR = 0.11;

/* How long each letter takes to ease on (overlaps the next so the run flows). */
const CHAR_FADE = 0.18;

/* A short beat before "Sax" begins. */
const WORD_GAP = 0.35;

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

  document.documentElement.classList.add("hero-intro-ready");

  const split = splitByChars(title, ".hero__title-line");
  const chars = split.chars;
  if (!chars.length) return;

  // Hidden, but still occupying their space — the line is laid out exactly as
  // it will finally read, so nothing shifts as the letters arrive.
  gsap.set(chars, { visibility: "hidden", opacity: 0 });
  if (video) gsap.set(video, { opacity: 0, scale: 1.08 });
  if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 20 });
  if (meta) gsap.set(meta, { opacity: 0, y: 18 });

  const tl = gsap.timeline({ delay: 0.15 });

  // 1 · Video fades up from black, easing out of a slight push-in.
  if (video) {
    tl.to(video, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" }, 0);
  }

  // 2 · Award eyebrow rises in.
  if (eyebrow) {
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.35);
  }

  // 3 · The name types in (each letter eases on; see PER_CHAR/CHAR_FADE).
  const TYPE_AT = 0.5;

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
      { opacity: 0 },
      {
        opacity: 1,
        visibility: "visible",
        duration: CHAR_FADE,
        ease: "power2.out",
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

  // 4 · Roles settle in once the name has landed.
  if (meta) {
    tl.to(meta, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, nameEnds + 0.15);
  }

  return () => {
    tl.kill();
    chars.forEach((c) => c.classList.remove("is-caret"));
    split.revert();
  };
}
