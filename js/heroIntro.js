/* ============================================================================
   heroIntro.js — Olamide Sax V3 · cinematic hero entrance (home only)
   ----------------------------------------------------------------------------
   The arrival. A choreographed load sequence:
     1. the ambient video fades up from black,
     2. the award eyebrow rises in,
     3. the NAME arrives letter by letter — the two lines of the signature are
        split into characters and revealed in sequence, so the name assembles
        itself rather than simply appearing,
     4. the roles + Enter cue settle in.

   The name is set in Great Vibes, a CONNECTED script, so the characters are
   never taken out of the text flow (no per-letter inline-block, no x/y offsets
   that would break the joins between letterforms). Each character animates on
   opacity and a soft blur only — the kerning the browser laid out is exactly
   the kerning you see.

   The real text stays readable for assistive tech (splitText.js labels the
   container and hides only the generated spans). Under reduced-motion, no GSAP,
   or no JS at all, nothing is touched — the plain name renders as-is.
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";
import { splitByChars } from "./splitText.js";

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

  // Pre-hide everything that will be choreographed.
  gsap.set(chars, { opacity: 0, filter: "blur(8px)" });
  if (video) gsap.set(video, { opacity: 0, scale: 1.08 });
  if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 20 });
  if (meta) gsap.set(meta, { opacity: 0, y: 18 });
  if (cue) gsap.set(cue, { opacity: 0, y: 12 });

  const tl = gsap.timeline({ delay: 0.15 });

  // 1 · Video fades up from black and eases out of a slight push-in.
  if (video) {
    tl.to(video, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" }, 0);
  }

  // 2 · Award eyebrow rises in.
  if (eyebrow) {
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.35);
  }

  // 3 · The NAME assembles, one letter after another. Unhurried — a signature
  //     is signed, not typed — and the blur burning off as each letter lands
  //     keeps it from reading as a typewriter.
  tl.to(
    chars,
    {
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.75,
      ease: "power2.out",
      stagger: 0.075,
      clearProps: "filter",
    },
    0.6
  );

  const nameEnds = 0.6 + chars.length * 0.075 + 0.75;

  // 4 · Roles + Enter cue settle in once the name has landed.
  if (meta) {
    tl.to(meta, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, nameEnds - 0.5);
  }
  if (cue) {
    tl.to(cue, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, nameEnds - 0.3);
  }

  return () => {
    tl.kill();
    split.revert();
  };
}
