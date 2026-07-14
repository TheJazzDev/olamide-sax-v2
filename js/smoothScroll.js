/* smoothScroll.js — Lenis smooth-scroll, driven by GSAP's ticker and synced to
   ScrollTrigger.update() on every scroll (keeps reveals/pins locked). Eases the
   native scroll position so fixed/sticky/anchors keep working. Exposes the
   instance as window.__lenis. Disabled under reduced-motion (native scroll). */

import { prefersReducedMotion, isMobile } from "./utils.js";

export function initSmoothScroll() {
  // No smooth-scroll when the user asked for reduced motion — native scroll.
  if (prefersReducedMotion()) return;

  // MOBILE: skip Lenis entirely. With syncTouch off it barely eases touch scroll
  // anyway, but it keeps a scroll-handling + RAF pipeline running on top of the
  // browser's own momentum scrolling — which is exactly the kind of overhead that
  // makes phones feel laggy. Native scroll is smoother here; ScrollTrigger works
  // fine on native scroll (its default), so reveals/pins are unaffected.
  if (isMobile()) return;

  const Lenis = window.Lenis;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // Progressive enhancement: if any dependency is missing, fall back to the browser's native scroll (the site stays fully usable).
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

  // Keep ScrollTrigger locked to Lenis' scroll position — THIS is what makes reveals and pins feel perfectly in sync.
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
