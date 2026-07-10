/* ============================================================================
   smoothScroll.js — Olamide Sax V2 · gentle eased window smooth-scroll
   ----------------------------------------------------------------------------
   APPROACH (and the tradeoff, learned from the prior build):
   We do NOT wrap the page in a translated container — that reliably breaks
   position:fixed (the nav), position:sticky (the media tabs) and the
   film-frame. Instead we ease the NATIVE scroll position: we intercept the
   wheel, keep a `target` scrollY, and each rAF frame lerp the real
   window.scrollTo toward it. Because we scroll the real document, fixed /
   sticky / anchors / the frame all behave exactly as the browser intends —
   just eased. The cost is that it only smooths wheel input (native drag, key,
   and touch scrolling pass straight through, which is the safe behavior on
   those inputs anyway).

   It is DISABLED entirely under prefers-reduced-motion and on coarse/touch
   pointers (there the browser's own inertial scroll is better and safer).

   It keeps ScrollTrigger in sync by calling ScrollTrigger.update() each frame
   while easing, so reveals stay locked to scroll position.
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

const LERP = 0.12;        // easing factor per frame — gentle, never sluggish
const WHEEL_MULT = 1;     // 1:1 wheel delta; easing does the smoothing
const SETTLE_EPS = 0.4;   // px; below this we snap and stop the rAF loop

export function initSmoothScroll() {
  // Gate: no smooth-scroll under reduced motion or on coarse/touch pointers.
  if (prefersReducedMotion()) return;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const noHover = window.matchMedia("(hover: none)").matches;
  if (!fine || noHover) return;

  const ST = window.ScrollTrigger || null;

  let target = window.scrollY || window.pageYOffset || 0;
  let current = target;
  let rafId = null;
  let running = false;

  const maxScroll = () =>
    Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );

  function clampTarget() {
    if (target < 0) target = 0;
    const max = maxScroll();
    if (target > max) target = max;
  }

  function frame() {
    const diff = target - current;

    if (Math.abs(diff) < SETTLE_EPS) {
      current = target;
      window.scrollTo(0, current);
      if (ST) ST.update();
      running = false;
      rafId = null;
      return;
    }

    current += diff * LERP;
    window.scrollTo(0, current);
    if (ST) ST.update();
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }

  function onWheel(e) {
    // Let the browser handle zoom / horizontal / modified scroll.
    if (e.ctrlKey || e.metaKey) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    e.preventDefault();

    // Normalize deltaMode (0=pixel, 1=line, 2=page) to pixels.
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= window.innerHeight;

    // Re-sync target if the user scrolled by other means (keyboard/anchor)
    // since our last frame, so we ease from where the page actually is.
    if (!running) current = window.scrollY;
    target = current + dy * WHEEL_MULT;
    clampTarget();
    start();
  }

  // If anything moves the scroll position outside our loop (anchor jump,
  // keyboard, programmatic scrollTo), adopt it as the new resting target so
  // our next wheel eases from the correct spot rather than snapping back.
  function onScroll() {
    if (running) return;
    target = current = window.scrollY;
  }

  // passive:false so preventDefault actually suppresses native wheel scroll.
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });

  // Keep bounds fresh on resize.
  window.addEventListener("resize", () => {
    clampTarget();
  });

  return () => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("scroll", onScroll);
    if (rafId) cancelAnimationFrame(rafId);
  };
}
