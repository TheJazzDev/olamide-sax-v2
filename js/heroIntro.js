/* ============================================================================
   heroIntro.js — Olamide Sax V3 · cinematic hero entrance (home only)
   ----------------------------------------------------------------------------
   The "wow" arrival. A choreographed load sequence:
     1. the ambient video fades up from black,
     2. the award eyebrow rises in,
     3. the NAME reveals with a MASK-WIPE — each line rises from behind a
        clipped edge (overflow-hidden mask + yPercent 100→0),
     4. the roles + Enter cue settle in.

   Each title line is wrapped in an overflow:hidden mask at runtime so the rise
   reads as letters emerging from behind an edge. The original text stays intact
   for accessibility (we only wrap, never destroy). Under reduced-motion / no
   GSAP, everything is shown in its final state (heroIntro bails, and the CSS
   pre-state is gated behind html.hero-intro-ready).
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

export function initHeroIntro() {
  const gsap = window.gsap;
  const hero =
    document.querySelector('[data-animate="hero"]') ||
    document.querySelector(".hero");
  const title = document.querySelector('[data-animate="hero-title"]');
  if (!hero || !title) return;

  // Progressive enhancement: no motion → leave everything visible as-is.
  if (!gsap || prefersReducedMotion()) return;

  // Wrap each title line in a mask so the rise looks like it emerges from
  // behind a clipped edge.
  const lines = Array.from(title.querySelectorAll(".hero__title-line"));
  lines.forEach((line) => {
    if (line.parentElement.classList.contains("hero__mask")) return;
    const mask = document.createElement("span");
    mask.className = "hero__mask";
    line.parentNode.insertBefore(mask, line);
    mask.appendChild(line);
  });

  // Signal CSS to apply the pre-hidden state (gated so JS-off never hides it).
  document.documentElement.classList.add("hero-intro-ready");

  const video = hero.querySelector(".hero__video");
  const eyebrow = hero.querySelector(".hero__eyebrow");
  const meta = hero.querySelector(".hero__meta");
  const cue = hero.querySelector(".hero__cue");

  gsap.set(lines, { yPercent: 115 });
  if (video) gsap.set(video, { opacity: 0, scale: 1.08 });
  if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 20 });
  if (meta) gsap.set(meta, { opacity: 0, y: 18 });
  if (cue) gsap.set(cue, { opacity: 0, y: 12 });

  const tl = gsap.timeline({ delay: 0.15 });

  // 1 · Video fades up from black + eases from a slight zoom.
  if (video) {
    tl.to(video, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" }, 0);
  }
  // 2 · Award eyebrow rises in.
  if (eyebrow) {
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.35);
  }
  // 3 · THE NAME — mask-wipe, line by line, with weight.
  tl.to(
    lines,
    {
      yPercent: 0,
      duration: 1.15,
      ease: "power4.out",
      stagger: 0.14,
    },
    0.55
  );
  // 4 · Roles + Enter cue settle in after the name lands.
  if (meta) {
    tl.to(meta, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 1.35);
  }
  if (cue) {
    tl.to(cue, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 1.55);
  }

  return () => tl.kill();
}
