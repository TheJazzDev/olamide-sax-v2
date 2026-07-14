/* ============================================================================
   utils.js — Olamide Sax V2 · tiny shared DOM + environment helpers
   No dependencies. Every other module imports from here rather than
   re-implementing selectors/listeners/media-query checks.
   ========================================================================== */

/* * Query a single element. */
export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

/* * Query all matching elements as a real array (not a live NodeList). */
export function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/* * Attach an event listener and return an unsubscribe function. */
export function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/* * Whether the visitor has asked for reduced motion. */
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    "matchMedia" in window &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* * Phone-width viewport. Single source of truth for the mobile breakpoint so
   every module gates the same way (heavy per-frame scroll effects, pinned
   scrubs and the 3D wheel are stripped below this width for smoothness). */
export function isMobile() {
  return (
    typeof window !== "undefined" &&
    "matchMedia" in window &&
    window.matchMedia("(max-width: 767px)").matches
  );
}
