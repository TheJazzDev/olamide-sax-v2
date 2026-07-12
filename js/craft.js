/* ============================================================================
   craft.js — Olamide Sax V3 · "The Craft" stacked "cover" scroll
   ----------------------------------------------------------------------------
   Panels are stacked in the same spot; as the user scrolls, each subsequent
   panel slides OVER the previous one (xPercent 100 → 0). Pinned + scrubbed via
   ScrollTrigger, driven by Lenis (smoothScroll.js) so it's smooth + in sync.

   Pacing: a HOLD at the start (linger on panel 1) and at the end (linger on the
   last) before the pin releases — so it doesn't snap away the instant the last
   panel arrives.

   PROGRESSIVE ENHANCEMENT: no GSAP / reduced-motion / mobile → skip entirely;
   the CSS shows the panels as a readable vertical stack.
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

export function initCraft() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  const section = document.querySelector("[data-craft]");
  const viewport = document.querySelector("[data-craft-viewport]");
  const panels = gsap.utils
    ? gsap.utils.toArray("[data-craft-panel]")
    : [...document.querySelectorAll("[data-craft-panel]")];
  if (!section || !viewport || panels.length < 2) return;

  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  if (!gsap || !ScrollTrigger || prefersReducedMotion() || isMobile) return;

  gsap.registerPlugin(ScrollTrigger);
  section.classList.add("is-stacked");

  // Stack order: first panel on the bottom, last on top. Panels after the
  // first START off-screen to the right, then slide in to cover.
  panels.forEach((p, i) => {
    gsap.set(p, {
      zIndex: i,
      xPercent: i === 0 ? 0 : 100,
      transformOrigin: "50% 50%",   // zoom from the centre when covered
    });
  });

  const covers = panels.length - 1; // number of slide-in transitions
  const START_HOLD = 0.35;           // brief linger on panel 1 before covering
  // Total timeline length in "units": a short opening hold + one per cover.
  // No trailing hold — release promptly once the last panel lands.
  const total = START_HOLD + covers;

  // (The DECK's ghost marquee runs on its own clock — pure CSS animation in
  //  craft.css — deliberately NOT tied to this scrub, so it keeps drifting
  //  right even while the visitor pauses mid-section.)

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: viewport,
      pin: true,
      scrub: 1,
      start: "top top",
      // ~0.85 screen-height of scroll per unit → snappy, not over-long.
      end: () => "+=" + window.innerHeight * (total * 0.85),
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  // Brief opening hold (linger on panel 1 before the first cover).
  tl.to({}, { duration: START_HOLD });

  panels.slice(1).forEach((panel, idx) => {
    const prev = panels[idx]; // the panel being covered
    // The incoming panel slides in from the right to cover.
    tl.to(panel, { xPercent: 0, duration: 1 }, ">");
    // The outgoing panel ZOOMS IN (scales up) and fades as the new one covers it
    // — as if it's pushed forward, into the screen, and swallowed. Because the
    // whole timeline is scrubbed, scrolling back up reverses it exactly: the
    // covering panel slides back out to the right and this one zooms back down
    // to its full, settled frame.
    tl.to(prev, { scale: 1.18, opacity: 0.15, duration: 1 }, "<");
  });

  return () => tl.scrollTrigger && tl.scrollTrigger.kill();
}
