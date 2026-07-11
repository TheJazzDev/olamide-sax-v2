/* ============================================================================
   marquee.js — Olamide Sax V3 · "Stages & Recognition" drifting credits band
   ----------------------------------------------------------------------------
   A continuous horizontal drift of venue / festival / award names. The track is
   duplicated so the loop is seamless (when it passes half its width, we wrap).
   Driven by GSAP's ticker (one rAF for the whole site); scroll velocity from
   Lenis (or window scroll) nudges the speed + direction, easing back to a slow
   idle drift.

   PROGRESSIVE ENHANCEMENT: no GSAP / reduced-motion → do nothing; the CSS leaves
   the credits as a static, wrapping list of the same names (fully readable).
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

export function initMarquee() {
  const gsap = window.gsap;
  const marquee = document.querySelector("[data-marquee]");
  const track = document.querySelector("[data-marquee-track]");
  if (!marquee || !track) return;
  if (!gsap || prefersReducedMotion()) return;

  // Flag the section so CSS switches from the wrapping fallback to a single row.
  const section = marquee.closest(".credits") || marquee;
  section.classList.add("is-live");

  // Duplicate the items once for a seamless wrap.
  Array.from(track.children).forEach((node) => {
    const clone = node.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  let half = 0;                 // width of one full set (wrap point)
  const measure = () => { half = track.scrollWidth / 2; };
  measure();
  window.addEventListener("resize", measure, { passive: true });

  let x = 0;                    // current translate
  const IDLE = 0.4;            // px/frame idle drift (leftward)
  let velocity = 0;            // extra px/frame from scroll
  const setX = gsap.quickSetter(track, "x", "px");

  // Scroll velocity → marquee speed + direction. Prefer Lenis' velocity.
  const lenis = window.__lenis || null;
  let lastScrollY = window.scrollY;
  if (lenis) {
    lenis.on("scroll", ({ velocity: v }) => { velocity = v * 3.0; });
  } else {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        velocity = (y - lastScrollY) * 1.5;
        lastScrollY = y;
      },
      { passive: true }
    );
  }

  gsap.ticker.add(() => {
    x -= IDLE + velocity;
    velocity *= 0.9;                   // decay back toward the idle drift
    if (half > 0) {
      if (x <= -half) x += half;
      else if (x > 0) x -= half;
    }
    setX(x);
  });
}
