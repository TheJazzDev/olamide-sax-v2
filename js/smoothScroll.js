/* ============================================================================
   smoothScroll.js — Olamide Sax V3 · Lenis smooth-scroll (GSAP-synced)
   ----------------------------------------------------------------------------
   Replaces the hand-rolled wheel-lerp (which only smoothed wheel input and
   fought ScrollTrigger) with Lenis — the smooth-scroll library used by
   Awwwards-grade sites. Lenis eases the NATIVE scroll position (no transform
   wrapper), so position:fixed / sticky / anchors all keep working, and it
   gives real momentum on wheel, keyboard, drag and touch.

   Integration (the standard, battle-tested pattern):
     • Lenis is driven by GSAP's ticker (one rAF loop for the whole site).
     • ScrollTrigger.update() runs on every Lenis scroll, so reveals + pins
       stay perfectly locked to scroll position (this is the "in sync" fix).
     • gsap.ticker.lagSmoothing(0) so heavy frames don't cause a jump.

   Disabled under prefers-reduced-motion (native scroll is used instead).
   Exposes the instance as `window.__lenis` so other modules (anchor links,
   horizontal Craft) can drive it.

   Requires: assets/vendor/lenis.min.js loaded before main.js (window.Lenis),
   plus gsap + ScrollTrigger (window.gsap / window.ScrollTrigger).
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

export function initSmoothScroll() {
  // No smooth-scroll when the user asked for reduced motion — native scroll.
  if (prefersReducedMotion()) return;

  const Lenis = window.Lenis;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // Progressive enhancement: if any dependency is missing, fall back to the
  // browser's native scroll (the site stays fully usable).
  if (!Lenis || !gsap) return;

  const lenis = new Lenis({
    duration: 1.05,           // eased glide length (higher = smoother/longer)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.2,
    // Let native touch scrolling handle coarse pointers (smoother on mobile).
    syncTouch: false,
  });

  window.__lenis = lenis;

  // Keep ScrollTrigger locked to Lenis' scroll position — THIS is what makes
  // reveals and pins feel perfectly in sync.
  if (ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    // On refresh (fonts/images/resize), make sure ScrollTrigger re-measures.
    ScrollTrigger.addEventListener &&
      ScrollTrigger.addEventListener("refresh", () => lenis.resize());
  }

  // Drive Lenis from GSAP's single ticker (one rAF for the whole site).
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // gsap ticker time is in seconds; Lenis wants ms
  });
  gsap.ticker.lagSmoothing(0);

  // Smooth-scroll in-page anchor links (#id) through Lenis.
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el, { offset: 0 });
  });

  return () => {
    lenis.destroy();
    window.__lenis = null;
  };
}
