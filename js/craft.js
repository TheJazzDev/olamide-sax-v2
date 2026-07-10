/* ============================================================================
   craft.js — Olamide Sax V3 · "The Craft" horizontal scroll
   ----------------------------------------------------------------------------
   The canonical GSAP ScrollTrigger horizontal-scroll recipe (from gsap.com):
   pin the viewport and translate the panel track sideways as the user scrolls
   vertically. Because Lenis drives the scroll (smoothScroll.js) and feeds
   ScrollTrigger.update, the motion is smooth and perfectly in sync.

   PROGRESSIVE ENHANCEMENT: if GSAP/ScrollTrigger is missing or reduced-motion
   is on, we do nothing — the CSS leaves the track as a native horizontal
   scroll strip, fully usable.
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

export function initCraft() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  const section = document.querySelector("[data-craft]");
  const viewport = document.querySelector("[data-craft-viewport]");
  const track = document.querySelector("[data-craft-track]");
  if (!section || !viewport || !track) return;

  // Bail on reduced-motion / missing deps / small screens (mobile = stacked).
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  if (!gsap || !ScrollTrigger || prefersReducedMotion() || isMobile) return;

  gsap.registerPlugin(ScrollTrigger);
  section.classList.add("is-pinned");

  const panels = gsap.utils.toArray("[data-craft-panel]", track);

  // Distance the track must travel = its overflow beyond one viewport width.
  const getScrollDistance = () => track.scrollWidth - window.innerWidth;

  const tween = gsap.to(track, {
    x: () => -getScrollDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: viewport,
      pin: true,
      scrub: 1,                          // 1s catch-up = smooth, not 1:1 twitchy
      start: "top top",
      end: () => "+=" + getScrollDistance(),
      invalidateOnRefresh: true,         // recompute widths on resize/font load
      anticipatePin: 1,
    },
  });

  // Subtle per-panel life: the incoming panel's text rises as it enters centre.
  panels.forEach((panel) => {
    const text = panel.querySelector(".craft-panel__text");
    if (!text) return;
    gsap.from(text, {
      y: 60,
      opacity: 0,
      ease: "power2.out",
      scrollTrigger: {
        trigger: panel,
        containerAnimation: tween,       // <-- key: tie to the horizontal tween
        start: "left center",
        end: "center center",
        scrub: true,
      },
    });
  });

  return () => tween.scrollTrigger && tween.scrollTrigger.kill();
}
