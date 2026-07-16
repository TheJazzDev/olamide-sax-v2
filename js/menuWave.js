/* ============================================================================
   menuWave.js — Hello Monday–style liquid edge for the menu overlay.

   The menu panel (.menu-overlay__frame) slides in from the right. This adds a
   wavy SVG "leading edge" on its LEFT side that morphs as the panel opens and
   closes, giving the signature liquid sweep. Purely decorative; the panel's
   own translateX slide (CSS) still does the travel — the wave animates its
   path `d` in sync.

   Self-contained rAF animation (does NOT use GSAP — the site's GSAP ticker is
   gated/dormant on some pages, so we drive our own frame loop). Page-guarded +
   reduced-motion aware: if the wave markup is missing or reduced motion is on,
   the menu still works with its plain CSS slide.
   ========================================================================== */

import { $, prefersReducedMotion } from "./utils.js";

/* Path builder — a vertical wave down the left edge of the SVG viewBox
   (0 0 100 1000). `amp` = how far the belly bulges LEFT (0 → flat edge at
   x=100; larger → deeper liquid curve reaching toward x=0). */
function wavePath(amp) {
  const x = 100 - amp;
  return (
    `M100,0 ` +
    `L${100 - amp * 0.25},0 ` +
    `C${x},170 ${x},170 ${100 - amp * 0.9},333 ` +
    `C${100 - amp * 1.15},500 ${100 - amp * 1.15},500 ${100 - amp * 0.9},667 ` +
    `C${x},830 ${x},830 ${100 - amp * 0.25},1000 ` +
    `L100,1000 Z`
  );
}

const OPEN_AMP = 8;    // gentle resting wave when the menu is settled open
const SWEEP_AMP = 78;  // deep liquid belly mid-sweep
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export function initMenuWave() {
  const overlay = $("#menu-overlay") || $(".menu-overlay");
  if (!overlay) return;
  const path = $("[data-menu-wave-path]", overlay);
  if (!path) return;

  // Reduced motion → quiet resting edge, no animation (CSS also hides the wave).
  if (prefersReducedMotion()) {
    path.setAttribute("d", wavePath(OPEN_AMP));
    return;
  }

  let amp = OPEN_AMP;
  let rafId = null;
  path.setAttribute("d", wavePath(amp));

  /* Animate `amp` through keyframes with our own rAF loop.
     phases: [{to, dur, ease}] applied sequentially from the current amp. */
  function run(phases) {
    if (rafId) cancelAnimationFrame(rafId);
    let i = 0;
    let from = amp;
    let start = null;

    function frame(now) {
      if (start === null) start = now;
      const ph = phases[i];
      const t = Math.min((now - start) / ph.dur, 1);
      amp = from + (ph.to - from) * ph.ease(t);
      path.setAttribute("d", wavePath(amp));

      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else if (i < phases.length - 1) {
        i += 1;
        from = amp;
        start = now;
        rafId = requestAnimationFrame(frame);
      } else {
        rafId = null;
      }
    }
    rafId = requestAnimationFrame(frame);
  }

  // Sweep in (swell to a deep belly, then settle) on open; pull back out on close.
  function openSweep() {
    run([
      { to: SWEEP_AMP, dur: 220, ease: easeOut },
      { to: OPEN_AMP, dur: 460, ease: easeInOut },
    ]);
  }
  function closeSweep() {
    run([{ to: SWEEP_AMP, dur: 320, ease: (t) => t * t }]);
  }

  const observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.attributeName !== "data-open") continue;
      if (overlay.hasAttribute("data-open")) openSweep();
      else closeSweep();
    }
  });
  observer.observe(overlay, { attributes: true, attributeFilter: ["data-open"] });
}
