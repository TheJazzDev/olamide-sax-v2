/* ============================================================================
   footerReveal.js — Olamide Sax V3 · the Coda enters like a closing passage
   One orchestrated timeline when the footer scrolls into view (once):
     1. the CODA seam fades on and its hairline draws out,
     2. the Explore rail links rise in sequence (a run of notes),
     3. the columns lift in, staggered,
     4. the colossal sign-off wordmark swells up from below the page edge
        and settles into its cropped resting position.
   Self-guarded: no-ops without the footer markup, under reduced motion, or
   when the GSAP vendor globals are absent (content just rests in its final
   CSS state — nothing is hidden up-front by CSS).
   ========================================================================== */

import { $, $$, prefersReducedMotion } from "./utils.js";

export function initFooterReveal() {
  const footer = $(".site-footer");
  if (!footer || prefersReducedMotion()) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const coda = $(".site-footer__coda", footer);
  const railLinks = $$(".site-footer__explore li", footer);
  const columns = $$(".site-footer__top > *", footer);
  const rule = $(".site-footer__rule", footer);
  const bottom = $(".site-footer__bottom", footer);
  const signoff = $(".site-footer__signoff", footer);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: footer,
      start: "top 85%",
      once: true,
    },
    defaults: { ease: "power3.out" },
  });

  // 0 · The bronze surface itself wipes UP into place first — a curtain
  //     rising from the bottom edge, given room to breathe — then the
  //     content snaps in quickly behind it.
  tl.fromTo(
    footer,
    { clipPath: "inset(100% 0 0 0)" },
    { clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "power4.out",
      clearProps: "clipPath" },
    0
  );

  if (coda) {
    tl.from(coda, { opacity: 0, x: -28, duration: 0.45 }, 0.4);
  }
  if (railLinks.length) {
    tl.from(
      railLinks,
      { yPercent: 80, opacity: 0, duration: 0.55, stagger: 0.04 },
      0.5
    );
  }
  if (columns.length) {
    tl.from(
      columns,
      { y: 40, opacity: 0, duration: 0.6, stagger: 0.09 },
      0.65
    );
  }
  if (rule) tl.from(rule, { scaleX: 0, transformOrigin: "left center", duration: 0.6 }, 0.85);
  if (bottom) tl.from(bottom, { opacity: 0, duration: 0.45 }, 0.95);
  if (signoff) {
    /* The sign-off rises from below the page edge into its resting position.

       That resting position differs by breakpoint, and the JS must agree with
       the CSS or it silently wins the argument: an inline transform beats any
       stylesheet rule, so animating to the desktop crop on a phone overrides
       the mobile CSS and re-introduces the very clipping it was written to
       avoid. On desktop the name rests CROPPED by the bottom edge (the poster
       effect, translateY(10%)); on mobile it rests fully ON the edge (0), so
       its descenders are not sliced. */
    const cropped = window.matchMedia("(min-width: 640px)").matches;
    tl.fromTo(
      signoff,
      { yPercent: 100 },
      { yPercent: cropped ? 10 : 0, duration: 1.0, ease: "power4.out" },
      0.75
    );
  }
}
