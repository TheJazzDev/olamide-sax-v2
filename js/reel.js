/* ============================================================================
   reel.js — Olamide Sax V3 · "The Live Wall" auto-drifting reel
   ----------------------------------------------------------------------------
   A continuous horizontal drift that reacts to scroll velocity. The track is
   duplicated so the loop is seamless (when it passes half its width, we wrap).
   Driven by GSAP's ticker (one rAF for the whole site); scroll velocity from
   Lenis (or window scroll) adds speed + direction, easing back to a slow idle
   drift.

   PROGRESSIVE ENHANCEMENT: no GSAP / reduced-motion → do nothing; the CSS
   leaves the reel as a native horizontal-scroll strip.
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

export function initReel() {
  const gsap = window.gsap;
  const reel = document.querySelector("[data-reel]");
  const track = document.querySelector("[data-reel-track]");
  if (!reel || !track) return;
  if (!gsap || prefersReducedMotion()) return;

  reel.classList.add("is-live");

  // Duplicate the items once for a seamless wrap.
  const originals = Array.from(track.children);
  originals.forEach((node) => {
    const clone = node.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  let half = 0;               // width of one full set (wrap point)
  const measure = () => { half = track.scrollWidth / 2; };
  measure();
  window.addEventListener("resize", measure, { passive: true });

  let x = 0;                  // current translate
  const IDLE = 0.35;         // px/frame idle drift (leftward)
  let velocity = 0;          // extra px/frame from scroll
  const setX = gsap.quickSetter(track, "x", "px");

  // Scroll velocity → reel speed + direction. Prefer Lenis' velocity if present.
  const lenis = window.__lenis || null;
  let lastScrollY = window.scrollY;
  if (lenis) {
    lenis.on("scroll", ({ velocity: v }) => { velocity = v * 3.2; });
  } else {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        velocity = (y - lastScrollY) * 1.6;
        lastScrollY = y;
      },
      { passive: true }
    );
  }

  gsap.ticker.add(() => {
    // Idle drift + scroll velocity; velocity eases back toward 0.
    x -= IDLE + velocity;
    velocity *= 0.9;                 // decay so it returns to the idle drift
    // Seamless wrap in both directions.
    if (half > 0) {
      if (x <= -half) x += half;
      else if (x > 0) x -= half;
    }
    setX(x);
  });
}
